import * as React from "react";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface TTSVoice {
  id: string;
  name: string;
  lang: string;
  gender: 'male' | 'female';
  quality: 'standard' | 'neural' | 'premium';
}

interface TTSControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  rate: number;
  onRateChange: (rate: number) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  selectedVoice?: string;
  onVoiceChange: (voiceId: string) => void;
  availableVoices: TTSVoice[];
  language: 'en' | 'ne';
  disabled?: boolean;
}

const VOICE_PRESETS = {
  en: [
    { id: 'en-us-neural-1', name: 'Emma (Neural)', lang: 'en-US', gender: 'female' as const, quality: 'neural' as const },
    { id: 'en-us-neural-2', name: 'Ryan (Neural)', lang: 'en-US', gender: 'male' as const, quality: 'neural' as const },
    { id: 'en-us-standard-1', name: 'Sarah (Standard)', lang: 'en-US', gender: 'female' as const, quality: 'standard' as const },
  ],
  ne: [
    { id: 'ne-np-neural-1', name: 'Kamala (Neural)', lang: 'ne-NP', gender: 'female' as const, quality: 'neural' as const },
    { id: 'ne-np-standard-1', name: 'Bikash (Standard)', lang: 'ne-NP', gender: 'male' as const, quality: 'standard' as const },
  ],
};

export function TTSControls({
  isPlaying,
  onPlayPause,
  rate,
  onRateChange,
  pitch,
  onPitchChange,
  volume,
  onVolumeChange,
  selectedVoice,
  onVoiceChange,
  availableVoices,
  language,
  disabled = false,
}: TTSControlsProps) {
  const voices = availableVoices.length > 0 ? availableVoices : VOICE_PRESETS[language];
  const currentVoice = voices.find(v => v.id === selectedVoice) || voices[0];

  return (
    <Card className="w-full max-w-md" data-testid="tts-controls">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Volume2 className="h-5 w-5" />
          Voice Settings
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Voice Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Voice
          </label>
          <Select
            value={selectedVoice || voices[0]?.id}
            onValueChange={onVoiceChange}
            disabled={disabled}
          >
            <SelectTrigger data-testid="voice-select">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{voice.name}</span>
                    <div className="flex gap-1 ml-2">
                      <Badge variant="outline" className="text-xs">
                        {voice.gender}
                      </Badge>
                      <Badge 
                        variant={voice.quality === 'neural' ? 'success' : 'secondary'} 
                        className="text-xs"
                      >
                        {voice.quality}
                      </Badge>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onPlayPause}
            disabled={disabled}
            data-testid="tts-play-pause"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-primary">Volume</label>
              <span className="text-sm text-text-tertiary">{Math.round(volume * 100)}%</span>
            </div>
            <Slider
              value={[volume]}
              onValueChange={([value]) => onVolumeChange(value)}
              max={1}
              step={0.1}
              disabled={disabled}
              data-testid="volume-slider"
            />
          </div>
        </div>

        {/* Rate Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-primary">Speed</label>
            <span className="text-sm text-text-tertiary">{rate.toFixed(1)}x</span>
          </div>
          <Slider
            value={[rate]}
            onValueChange={([value]) => onRateChange(value)}
            min={0.8}
            max={1.2}
            step={0.1}
            disabled={disabled}
            data-testid="rate-slider"
          />
        </div>

        {/* Pitch Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-primary">Pitch</label>
            <span className="text-sm text-text-tertiary">{pitch > 0 ? '+' : ''}{pitch}</span>
          </div>
          <Slider
            value={[pitch]}
            onValueChange={([value]) => onPitchChange(value)}
            min={-2}
            max={2}
            step={0.5}
            disabled={disabled}
            data-testid="pitch-slider"
          />
        </div>

        {/* Voice Info */}
        {currentVoice && (
          <div className="text-xs text-text-tertiary bg-surface-secondary/50 p-3 rounded-lg">
            <p>
              <strong>{currentVoice.name}</strong> • {currentVoice.lang} • {currentVoice.quality} quality
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}