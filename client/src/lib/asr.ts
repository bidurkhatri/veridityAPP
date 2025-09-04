/**
 * High-quality Automatic Speech Recognition with cloud providers
 */

import { Lang, langToBCP47, getFallbackLang } from './lang';

export interface ASROptions {
  lang: Lang;
  maxDuration?: number; // seconds
  sampleRate?: number;
}

export interface ASRResult {
  text: string;
  confidence: number;
  usedLang: string;
  fallbackUsed: boolean;
  provider: string;
}

export class ASRService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  /**
   * Check if ASR is supported
   */
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 
           ('mediaDevices' in navigator) &&
           ('getUserMedia' in navigator.mediaDevices);
  }

  /**
   * Request microphone permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 22050,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  /**
   * Start recording audio for transcription
   */
  async startRecording(options: ASROptions = { lang: 'en' }): Promise<void> {
    if (!this.stream) {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error('Microphone permission required');
      }
    }

    this.audioChunks = [];
    
    this.mediaRecorder = new MediaRecorder(this.stream!, {
      mimeType: 'audio/webm;codecs=opus'
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100); // Collect data every 100ms
    
    // Auto-stop after max duration
    if (options.maxDuration) {
      setTimeout(() => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.stopRecording();
        }
      }, options.maxDuration * 1000);
    }
  }

  /**
   * Stop recording and return audio blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Transcribe audio using cloud service
   */
  async transcribe(audioBlob: Blob, options: ASROptions = { lang: 'en' }): Promise<ASRResult> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('lang', langToBCP47[options.lang]);

      const response = await fetch('/api/asr', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`ASR API error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        text: result.text || '',
        confidence: result.confidence || 0,
        usedLang: result.usedLang,
        fallbackUsed: result.fallbackUsed || false,
        provider: result.provider || 'cloud'
      };
      
    } catch (error) {
      console.error('Cloud ASR failed:', error);
      
      // Fallback to Web Speech API
      return this.fallbackToWebSpeech(audioBlob, options);
    }
  }

  /**
   * Fallback to browser Web Speech Recognition
   */
  private async fallbackToWebSpeech(audioBlob: Blob, options: ASROptions): Promise<ASRResult> {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = (window as any).SpeechRecognition || 
                               (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error('Speech recognition not supported in this browser'));
        return;
      }

      const recognition = new SpeechRecognition();
      let targetLang = langToBCP47[options.lang];
      let fallbackUsed = false;

      // Try Nepali, fallback to Hindi if needed
      if (options.lang === 'ne') {
        recognition.lang = 'ne-NP';
      } else {
        recognition.lang = 'en-US';
      }

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        if (event.results && event.results.length > 0) {
          const result = event.results[0][0];
          resolve({
            text: result.transcript,
            confidence: result.confidence || 0.8,
            usedLang: targetLang,
            fallbackUsed,
            provider: 'web-speech'
          });
        } else {
          resolve({
            text: '',
            confidence: 0,
            usedLang: targetLang,
            fallbackUsed,
            provider: 'web-speech'
          });
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'language-not-supported' && options.lang === 'ne') {
          // Retry with Hindi
          recognition.lang = 'hi-IN';
          targetLang = 'hi-IN';
          fallbackUsed = true;
          recognition.start();
        } else {
          reject(new Error(`Web Speech ASR error: ${event.error}`));
        }
      };

      recognition.start();
    });
  }

  /**
   * Record and transcribe in one call
   */
  async recordAndTranscribe(options: ASROptions = { lang: 'en' }): Promise<ASRResult> {
    await this.startRecording(options);
    
    // Return a promise that resolves when recording is stopped
    return new Promise((resolve, reject) => {
      const stopAndTranscribe = async () => {
        try {
          const audioBlob = await this.stopRecording();
          const result = await this.transcribe(audioBlob, options);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      // Auto-stop after 5 seconds if no manual stop
      setTimeout(() => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          stopAndTranscribe();
        }
      }, 5000);

      // Allow manual stopping
      (this as any)._stopAndTranscribe = stopAndTranscribe;
    });
  }

  /**
   * Stop current recording and transcribe
   */
  async finishRecording(): Promise<void> {
    if ((this as any)._stopAndTranscribe) {
      await (this as any)._stopAndTranscribe();
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.mediaRecorder) {
      this.mediaRecorder = null;
    }
    this.audioChunks = [];
  }
}

// Singleton instance
export const asrService = new ASRService();