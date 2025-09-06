import * as React from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSwitcherProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  languages?: Array<{
    code: string;
    name: string;
    nativeName: string;
  }>;
}

const DEFAULT_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली" },
];

export function LanguageSwitcher({
  currentLanguage,
  onLanguageChange,
  languages = DEFAULT_LANGUAGES,
}: LanguageSwitcherProps) {
  const currentLang = languages.find(lang => lang.code === currentLanguage);

  // Enhanced language change with immediate persistence
  const handleLanguageChange = React.useCallback((language: string) => {
    localStorage.setItem('veridity-language', language);
    onLanguageChange(language);
    
    // Immediate UI feedback
    const currentBtn = document.querySelector(`[data-testid="language-option-${language}"]`);
    if (currentBtn) {
      currentBtn.classList.add('bg-primary/10');
      setTimeout(() => {
        currentBtn.classList.remove('bg-primary/10');
      }, 200);
    }
  }, [onLanguageChange]);

  // Load saved language on mount
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('veridity-language');
    if (savedLanguage && savedLanguage !== currentLanguage && languages.find(l => l.code === savedLanguage)) {
      onLanguageChange(savedLanguage);
    }
  }, [currentLanguage, onLanguageChange, languages]);

  return (
    <Select value={currentLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger 
        className="w-auto min-w-[120px]"
        data-testid="language-switcher"
      >
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue>
          {currentLang?.nativeName || currentLang?.name || currentLanguage.toUpperCase()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem 
            key={language.code} 
            value={language.code}
            data-testid={`language-option-${language.code}`}
            className="transition-all duration-200"
          >
            <div className="flex items-center justify-between w-full">
              <span>{language.nativeName}</span>
              <span className="text-text-tertiary text-xs ml-2">
                {language.name}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Hook for persistent language state
export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = React.useState<string>('en');

  // Load language from localStorage on mount
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('veridity-language');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = React.useCallback((language: string) => {
    localStorage.setItem('veridity-language', language);
    setCurrentLanguage(language);
  }, []);

  return {
    currentLanguage,
    changeLanguage,
  };
}