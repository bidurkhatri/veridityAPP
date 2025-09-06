import * as React from "react";
import { cn } from "@/lib/utils";
import { VeridityLogo } from "./veridity-icons";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { Menu, X } from "lucide-react";

interface BrandHeaderProps {
  variant?: 'splash' | 'topbar' | 'login';
  showLanguage?: boolean;
  showMenu?: boolean;
  onMenuClick?: () => void;
  className?: string;
}

export function BrandHeader({ 
  variant = 'topbar', 
  showLanguage = true,
  showMenu = false,
  onMenuClick,
  className 
}: BrandHeaderProps) {
  const [currentLanguage, setCurrentLanguage] = React.useState('en');

  if (variant === 'splash') {
    return (
      <div className={cn("text-center space-y-6 py-12", className)}>
        <div className="flex justify-center">
          <VeridityLogo size={80} className="text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-text-primary">
            Veridity
          </h1>
          <p className="text-xl text-text-secondary">
            Privacy-First Digital Identity
          </p>
          <p className="text-text-tertiary max-w-md mx-auto">
            Secure zero-knowledge proofs for Nepal's digital future
          </p>
        </div>
        {showLanguage && (
          <div className="flex justify-center">
            <LanguageSwitcher
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
            />
          </div>
        )}
      </div>
    );
  }

  if (variant === 'login') {
    return (
      <div className={cn("text-center space-y-4 mb-8", className)}>
        <div className="flex justify-center">
          <VeridityLogo size={48} className="text-primary" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-text-primary">
            Welcome to Veridity
          </h1>
          <p className="text-text-secondary">
            Secure digital identity verification
          </p>
        </div>
      </div>
    );
  }

  // Topbar variant
  return (
    <header className={cn(
      "flex items-center justify-between h-16 px-4 border-b border-border-default bg-surface",
      className
    )}>
      <div className="flex items-center gap-4">
        {showMenu && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="md:hidden"
            data-testid="mobile-menu-toggle"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <div className="flex items-center gap-3">
          <VeridityLogo size={32} className="text-primary" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-text-primary">
              Veridity
            </h1>
            <p className="text-xs text-text-tertiary -mt-1">
              Privacy-First Identity
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {showLanguage && (
          <LanguageSwitcher
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
          />
        )}
        
        <Button
          variant="outline"
          size="sm"
          data-testid="user-menu"
        >
          Profile
        </Button>
      </div>
    </header>
  );
}

// Empty state with consistent branding
export function BrandedEmptyState({ 
  title, 
  description, 
  action,
  illustration,
  className 
}: {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  illustration?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  const Illustration = illustration;

  return (
    <div className={cn("text-center py-12 space-y-6", className)}>
      {Illustration ? (
        <Illustration className="w-24 h-24 mx-auto text-text-tertiary" />
      ) : (
        <VeridityLogo size={48} className="mx-auto text-text-tertiary opacity-50" />
      )}
      
      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-text-primary">
          {title}
        </h3>
        <p className="text-text-secondary">
          {description}
        </p>
      </div>

      {action && (
        <Button onClick={action.onClick} data-testid="empty-state-action">
          {action.label}
        </Button>
      )}
    </div>
  );
}