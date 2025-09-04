/**
 * Fixed language segmented control - no more wrong highlighting
 */

import { Lang, langToDisplay } from '@/lib/lang';

interface LanguageSegmentProps {
  value: Lang;
  onChange: (lang: Lang) => void;
  className?: string;
}

export function LanguageSegment({ value, onChange, className = '' }: LanguageSegmentProps) {
  const languages: Lang[] = ['en', 'ne'];
  
  return (
    <div 
      role="tablist" 
      className={`inline-flex rounded-lg border border-border p-1 bg-background ${className}`}
      data-testid="language-segment"
    >
      {languages.map((lang) => (
        <button
          key={lang}
          type="button"
          role="tab"
          aria-selected={value === lang}
          data-testid={`language-option-${lang}`}
          onClick={() => onChange(lang)}
          className={[
            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
            value === lang 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          ].join(' ')}
        >
          {langToDisplay[lang]}
        </button>
      ))}
    </div>
  );
}