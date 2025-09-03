import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  currentLanguage: 'en' | 'np';
  onLanguageChange: (language: 'en' | 'np') => void;
}

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'np' : 'en';
    onLanguageChange(newLanguage);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center space-x-1 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
      data-testid="button-language-toggle"
    >
      <Globe className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm">{currentLanguage.toUpperCase()}</span>
    </Button>
  );
}
