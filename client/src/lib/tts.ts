/**
 * High-quality Text-to-Speech with cloud providers and caching
 */

import { Lang, langToBCP47, getFallbackLang } from './lang';

export interface TTSOptions {
  lang: Lang;
  rate?: number;
  volume?: number;
  pitch?: number;
  cache?: boolean;
}

export interface TTSResult {
  audioUrl?: string;
  usedLang: string;
  fallbackUsed: boolean;
  provider: string;
  cached: boolean;
}

export class TTSService {
  private cache = new Map<string, string>();
  
  /**
   * Convert text to SSML for better pronunciation
   */
  private textToSSML(text: string, lang: Lang): string {
    const xmlLang = langToBCP47[lang];
    
    // Add proper pauses and pronunciation hints for Nepali
    let ssmlText = text;
    if (lang === 'ne') {
      // Add slight pauses after common Nepali punctuation
      ssmlText = ssmlText.replace(/।/g, '।<break time="300ms"/>');
      // Slow down numbers for clarity
      ssmlText = ssmlText.replace(/(\d+)/g, '<prosody rate="0.8">$1</prosody>');
    }
    
    return `
      <speak xml:lang="${xmlLang}">
        <prosody rate="0.95" pitch="0st">
          ${ssmlText}
        </prosody>
      </speak>
    `.trim();
  }

  /**
   * Generate cache key for audio content
   */
  private getCacheKey(text: string, options: TTSOptions): string {
    return `tts_${text}_${options.lang}_${options.rate || 1.0}_${options.pitch || 0}`;
  }

  /**
   * Synthesize speech using cloud provider
   */
  async synthesize(text: string, options: TTSOptions = { lang: 'en' }): Promise<TTSResult> {
    const cacheKey = this.getCacheKey(text, options);
    
    // Check cache first
    if (options.cache !== false && this.cache.has(cacheKey)) {
      return {
        audioUrl: this.cache.get(cacheKey)!,
        usedLang: langToBCP47[options.lang],
        fallbackUsed: false,
        provider: 'cache',
        cached: true
      };
    }

    try {
      const ssml = this.textToSSML(text, options.lang);
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          ssml,
          lang: langToBCP47[options.lang],
          rate: options.rate || 1.0,
          pitch: options.pitch || 0,
          volume: options.volume || 1.0
        })
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result
      if (options.cache !== false && result.audioUrl) {
        this.cache.set(cacheKey, result.audioUrl);
      }

      return {
        audioUrl: result.audioUrl,
        usedLang: result.usedLang,
        fallbackUsed: result.fallbackUsed || false,
        provider: result.provider || 'cloud',
        cached: false
      };
      
    } catch (error) {
      console.error('TTS synthesis failed:', error);
      
      // Fallback to browser TTS
      return this.fallbackToWebSpeech(text, options);
    }
  }

  /**
   * Fallback to browser Web Speech API
   */
  private async fallbackToWebSpeech(text: string, options: TTSOptions): Promise<TTSResult> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('No TTS support available'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find appropriate voice
      const voices = speechSynthesis.getVoices();
      let targetLang = langToBCP47[options.lang];
      let fallbackUsed = false;
      
      let voice = voices.find(v => v.lang.startsWith(options.lang === 'ne' ? 'ne' : 'en'));
      
      if (!voice && options.lang === 'ne') {
        // Try Hindi as fallback for Nepali
        voice = voices.find(v => v.lang.startsWith('hi'));
        if (voice) {
          targetLang = 'hi-IN';
          fallbackUsed = true;
        }
      }
      
      if (!voice) {
        // Final fallback to any English voice
        voice = voices.find(v => v.lang.startsWith('en'));
        if (voice) {
          targetLang = 'en-US';
          fallbackUsed = true;
        }
      }

      utterance.lang = targetLang;
      if (voice) utterance.voice = voice;
      utterance.rate = options.rate || 1.0;
      utterance.volume = options.volume || 1.0;
      utterance.pitch = options.pitch || 1.0;

      utterance.onend = () => {
        resolve({
          usedLang: targetLang,
          fallbackUsed,
          provider: 'web-speech',
          cached: false
        });
      };

      utterance.onerror = (e) => {
        reject(new Error(`Web Speech TTS error: ${e.error}`));
      };

      speechSynthesis.speak(utterance);
    });
  }

  /**
   * Play synthesized audio
   */
  async play(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error('Audio playback failed'));
      
      audio.play().catch(reject);
    });
  }

  /**
   * Speak text with full pipeline
   */
  async speak(text: string, options: TTSOptions = { lang: 'en' }): Promise<TTSResult> {
    const result = await this.synthesize(text, options);
    
    if (result.audioUrl) {
      await this.play(result.audioUrl);
    }
    
    return result;
  }

  /**
   * Clear TTS cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const ttsService = new TTSService();