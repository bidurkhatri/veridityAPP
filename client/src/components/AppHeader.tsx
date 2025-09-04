import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useLocation } from "wouter";

export interface AppHeaderProps {
  title: string;
  type?: 'root' | 'sub';
  leftSlot?: React.ReactNode;
  actions?: React.ReactNode[];
  sticky?: boolean;
  divider?: boolean;
  className?: string;
}

export function AppHeader({
  title,
  type = 'root',
  leftSlot,
  actions = [],
  sticky = false,
  divider = false,
  className = '',
}: AppHeaderProps) {
  const [, navigate] = useLocation();

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  return (
    <header
      className={`
        bg-surface text-text-primary border-b border z-40
        ${sticky ? 'sticky top-0' : ''}
        ${className}
      `}
      style={{ height: '56px' }}
      aria-label="App header"
    >
      <div className="container mx-auto px-4 py-3 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left side */}
          <div className="flex items-center min-w-[64px]">
            {type === 'sub' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-2 h-9 w-9"
                aria-label="Back"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {leftSlot}
          </div>

          {/* Center - Title */}
          <div className="flex-1 text-center sm:text-left px-4">
            <h1 className="text-lg font-semibold text-text-primary truncate">
              {title}
            </h1>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 min-w-[64px] justify-end">
            {actions?.slice(0, 2).map((action, index) => (
              <div key={index} className="flex items-center">
                {action}
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export function BackButton({ href = '#' }: { href?: string }) {
  const [, navigate] = useLocation();
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(href)}
      className="p-2 h-9 w-9"
      aria-label="Back"
      data-testid="button-back-custom"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
}

export function OverflowButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="p-2 h-9 w-9"
      aria-label="More options"
      data-testid="button-overflow"
    >
      <MoreVertical className="h-4 w-4" />
    </Button>
  );
}