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

  return (
    <Select value={currentLanguage} onValueChange={onLanguageChange}>
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