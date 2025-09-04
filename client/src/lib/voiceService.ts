/**
 * Voice Service - Handles text-to-speech and speech recognition with proper Nepali support
 */

export interface VoiceSettings {
  enabled: boolean;
  language: string;
  speechRate: number;
  speechVolume: number;
  confirmCommands: boolean;
}

export interface VoiceSupport {
  tts: boolean;
  asr: boolean;
  nepaliTTS: boolean;
  nepaliASR: boolean;
}

/**
 * Check browser voice capabilities
 */
export function checkVoiceSupport(): VoiceSupport {
  const tts = 'speechSynthesis' in window;
  const asr = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  
  let nepaliTTS = false;
  let nepaliASR = false;
  
  if (tts) {
    // Check if we have Nepali or Hindi voices as fallback
    const voices = speechSynthesis.getVoices();
    nepaliTTS = voices.some(v => 
      v.lang?.toLowerCase().startsWith('ne') || 
      v.lang?.toLowerCase().startsWith('hi')
    );
  }
  
  // ASR support is harder to detect, assume it's available if the API exists
  if (asr) {
    nepaliASR = true; // We'll handle fallbacks in the actual recognition
  }
  
  return { tts, asr, nepaliTTS, nepaliASR };
}

/**
 * Get available voices with fallback chain: ne -> hi -> en
 */
export async function getVoicesForLanguage(targetLang: 'ne-NP' | 'en-US'): Promise<SpeechSynthesisVoice | null> {
  if (!('speechSynthesis' in window)) return null;
  
  // Wait for voices to load
  await new Promise<void>(resolve => {
    if (speechSynthesis.getVoices().length) return resolve();
    speechSynthesis.onvoiceschanged = () => resolve();
  });
  
  const voices = speechSynthesis.getVoices();
  
  if (targetLang === 'ne-NP') {
    // Fallback chain for Nepali
    const ne = voices.find(v => v.lang?.toLowerCase().startsWith('ne'));
    const hi = voices.find(v => v.lang?.toLowerCase().startsWith('hi'));
    const en = voices.find(v => v.lang?.toLowerCase().startsWith('en'));
    
    return ne || hi || en || null;
  } else {
    // English voice
    return voices.find(v => v.lang?.toLowerCase().startsWith('en')) || null;
  }
}

/**
 * Speak text with proper language detection and fallback
 */
export async function speak(
  text: string, 
  language: 'ne' | 'en' = 'en',
  rate: number = 1.0,
  volume: number = 1.0
): Promise<void> {
  if (!('speechSynthesis' in window)) {
    throw new Error('Text-to-speech not supported in this browser');
  }
  
  const targetLang = language === 'ne' ? 'ne-NP' : 'en-US';
  const voice = await getVoicesForLanguage(targetLang);
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = Math.max(0.5, Math.min(1.2, rate));
  utterance.volume = Math.max(0, Math.min(1, volume));
  
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    // Fallback to system default
    utterance.lang = targetLang;
  }
  
  return new Promise<void>((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);
    speechSynthesis.speak(utterance);
  });
}

/**
 * Start speech recognition with proper language support
 */
export function startRecognition(
  language: 'ne' | 'en' = 'en',
  onResult: (transcript: string) => void,
  onError?: (error: string) => void
): () => void {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    const error = 'Speech recognition not supported. Please use Chrome, Edge, or a supported mobile browser.';
    if (onError) onError(error);
    throw new Error(error);
  }
  
  const recognition = new SpeechRecognition();
  recognition.lang = language === 'ne' ? 'ne-NP' : 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  
  recognition.onresult = (event: any) => {
    if (event.results && event.results.length > 0) {
      const transcript = event.results[0][0].transcript.trim();
      onResult(transcript);
    }
  };
  
  recognition.onerror = (event: any) => {
    const error = `Recognition error: ${event.error}`;
    console.error(error);
    if (onError) onError(error);
  };
  
  recognition.start();
  
  return () => {
    recognition.stop();
  };
}

/**
 * Voice command patterns for both languages
 */
export interface VoiceCommand {
  id: string;
  patterns: {
    en: RegExp[];
    ne: RegExp[];
  };
  description: {
    en: string;
    ne: string;
  };
}

export const voiceCommands: VoiceCommand[] = [
  {
    id: 'home',
    patterns: {
      en: [/go home/i, /home page/i, /dashboard/i],
      ne: [/होम जानुहोस्/i, /घर जानुहोस्/i, /ड्यासबोर्ड/i]
    },
    description: {
      en: 'Go to home page',
      ne: 'होम पेजमा जानुहोस्'
    }
  },
  {
    id: 'generate',
    patterns: {
      en: [/generate proof/i, /create proof/i, /new proof/i],
      ne: [/प्रमाण बनाउनुहोस्/i, /प्रमाण तयार गर्नुहोस्/i, /नयाँ प्रमाण/i]
    },
    description: {
      en: 'Generate new proof',
      ne: 'नयाँ प्रमाण बनाउनुहोस्'
    }
  },
  {
    id: 'verify',
    patterns: {
      en: [/verify proof/i, /check proof/i, /validate/i],
      ne: [/प्रमाण जाँच गर्नुहोस्/i, /प्रमाण सत्यापन/i, /प्रमाणित गर्नुहोस्/i]
    },
    description: {
      en: 'Verify proof',
      ne: 'प्रमाण सत्यापन गर्नुहोस्'
    }
  },
  {
    id: 'share',
    patterns: {
      en: [/share proof/i, /send proof/i, /share/i],
      ne: [/प्रमाण साझा गर्नुहोस्/i, /प्रमाण पठाउनुहोस्/i, /साझा गर्नुहोस्/i]
    },
    description: {
      en: 'Share proof',
      ne: 'प्रमाण साझा गर्नुहोस्'
    }
  },
  {
    id: 'help',
    patterns: {
      en: [/help/i, /what can you do/i, /commands/i],
      ne: [/मद्दत/i, /सहायता/i, /के गर्न सकिन्छ/i, /आदेशहरू/i]
    },
    description: {
      en: 'Show help',
      ne: 'मद्दत देखाउनुहोस्'
    }
  }
];

/**
 * Match voice input to command
 */
export function matchVoiceCommand(transcript: string, language: 'ne' | 'en'): VoiceCommand | null {
  for (const command of voiceCommands) {
    const patterns = command.patterns[language];
    if (patterns.some(pattern => pattern.test(transcript))) {
      return command;
    }
  }
  return null;
}

/**
 * Get formatted command list for display
 */
export function getCommandList(language: 'ne' | 'en'): Array<{command: string; description: string}> {
  return voiceCommands.map(cmd => ({
    command: language === 'ne' 
      ? cmd.patterns.ne[0].source.replace(/[\/\\ig]/g, '')
      : cmd.patterns.en[0].source.replace(/[\/\\ig]/g, ''),
    description: cmd.description[language]
  }));
}