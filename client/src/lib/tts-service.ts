interface TTSVoice {
  id: string;
  name: string;
  lang: string;
  gender: 'male' | 'female';
  quality: 'standard' | 'neural' | 'premium';
}

interface TTSOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface TTSProvider {
  name: string;
  getVoices(language: string): Promise<TTSVoice[]>;
  speak(text: string, options?: TTSOptions): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): void;
  isSupported(): boolean;
}

class WebSpeechProvider implements TTSProvider {
  name = 'Web Speech API';
  private synth = window.speechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  async getVoices(language: string): Promise<TTSVoice[]> {
    const voices = this.synth.getVoices();
    return voices
      .filter(voice => voice.lang.startsWith(language === 'ne' ? 'ne' : 'en'))
      .map(voice => ({
        id: voice.name,
        name: voice.name,
        lang: voice.lang,
        gender: voice.name.toLowerCase().includes('female') ? 'female' : 'male',
        quality: 'standard' as const,
      }));
  }

  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      
      if (options.voice) {
        const voices = this.synth.getVoices();
        const voice = voices.find(v => v.name === options.voice);
        if (voice) utterance.voice = voice;
      }

      if (options.rate) utterance.rate = options.rate;
      if (options.pitch) utterance.pitch = options.pitch + 1; // Web API uses 0-2 range
      if (options.volume) utterance.volume = options.volume;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(event.error));

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  stop(): void {
    if (this.currentUtterance) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  pause(): void {
    this.synth.pause();
  }

  resume(): void {
    this.synth.resume();
  }

  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}

class CloudTTSProvider implements TTSProvider {
  name = 'Cloud TTS';
  private audioCache = new Map<string, AudioBuffer>();
  private currentAudio: AudioBufferSourceNode | null = null;
  private audioContext: AudioContext | null = null;

  async getVoices(language: string): Promise<TTSVoice[]> {
    // Mock cloud voices with high quality options
    const cloudVoices = {
      en: [
        { id: 'en-us-neural-1', name: 'Emma (Neural)', lang: 'en-US', gender: 'female' as const, quality: 'neural' as const },
        { id: 'en-us-neural-2', name: 'Ryan (Neural)', lang: 'en-US', gender: 'male' as const, quality: 'neural' as const },
        { id: 'en-us-premium-1', name: 'Sophia (Premium)', lang: 'en-US', gender: 'female' as const, quality: 'premium' as const },
      ],
      ne: [
        { id: 'ne-np-neural-1', name: 'Kamala (Neural)', lang: 'ne-NP', gender: 'female' as const, quality: 'neural' as const },
        { id: 'ne-np-premium-1', name: 'Bikash (Premium)', lang: 'ne-NP', gender: 'male' as const, quality: 'premium' as const },
      ],
    };

    return cloudVoices[language as keyof typeof cloudVoices] || [];
  }

  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    // In a real implementation, this would call a cloud TTS service
    // For now, fall back to Web Speech API with enhanced settings
    const webProvider = new WebSpeechProvider();
    return webProvider.speak(text, options);
  }

  stop(): void {
    if (this.currentAudio && this.audioContext) {
      this.currentAudio.stop();
      this.currentAudio = null;
    }
  }

  pause(): void {
    if (this.audioContext) {
      this.audioContext.suspend();
    }
  }

  resume(): void {
    if (this.audioContext) {
      this.audioContext.resume();
    }
  }

  isSupported(): boolean {
    return 'AudioContext' in window || 'webkitAudioContext' in window;
  }
}

export class TTSService {
  private providers: TTSProvider[] = [];
  private currentProvider: TTSProvider | null = null;
  private settings = {
    voice: '',
    rate: 1.0,
    pitch: 0,
    volume: 1.0,
  };

  constructor() {
    this.providers = [
      new CloudTTSProvider(),
      new WebSpeechProvider(),
    ];

    // Select the first supported provider
    this.currentProvider = this.providers.find(p => p.isSupported()) || null;
    
    // Load saved settings
    this.loadSettings();
  }

  async getAvailableVoices(language: string): Promise<TTSVoice[]> {
    if (!this.currentProvider) return [];
    return this.currentProvider.getVoices(language);
  }

  async speak(text: string, language: string = 'en'): Promise<void> {
    if (!this.currentProvider) {
      throw new Error('No TTS provider available');
    }

    const languageSettings = this.getLanguageSettings(language);
    return this.currentProvider.speak(text, languageSettings);
  }

  stop(): void {
    this.currentProvider?.stop();
  }

  pause(): void {
    this.currentProvider?.pause();
  }

  resume(): void {
    this.currentProvider?.resume();
  }

  updateSettings(language: string, settings: Partial<TTSOptions>): void {
    const key = `tts-settings-${language}`;
    const current = JSON.parse(localStorage.getItem(key) || '{}');
    const updated = { ...current, ...settings };
    localStorage.setItem(key, JSON.stringify(updated));
  }

  private getLanguageSettings(language: string): TTSOptions {
    const key = `tts-settings-${language}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : this.settings;
  }

  private loadSettings(): void {
    const englishSettings = this.getLanguageSettings('en');
    const nepaliSettings = this.getLanguageSettings('ne');
    
    // Set defaults if no settings exist
    if (!localStorage.getItem('tts-settings-en')) {
      this.updateSettings('en', { rate: 1.0, pitch: 0, volume: 1.0 });
    }
    if (!localStorage.getItem('tts-settings-ne')) {
      this.updateSettings('ne', { rate: 0.9, pitch: 0, volume: 1.0 });
    }
  }

  getQualityScore(): number {
    // Return a simulated quality score (MOS - Mean Opinion Score)
    // In real implementation, this would be based on actual quality metrics
    if (this.currentProvider?.name === 'Cloud TTS') {
      return 4.2; // High quality neural voices
    }
    return 3.8; // Standard web speech API
  }
}

export const ttsService = new TTSService();