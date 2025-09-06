import * as React from "react";
import { cn } from "@/lib/utils";

// Skip to content link for keyboard navigation
export function SkipToContent({ href = "#main-content" }: { href?: string }) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999]",
        "bg-primary text-text-inverse px-4 py-2 rounded-md",
        "focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2"
      )}
    >
      Skip to main content
    </a>
  );
}

// Screen reader only text
interface SROnlyProps {
  children: React.ReactNode;
  className?: string;
}

export function SROnly({ children, className }: SROnlyProps) {
  return (
    <span className={cn("sr-only", className)}>
      {children}
    </span>
  );
}

// Focus trap for modals and dialogs
interface FocusTrapProps {
  children: React.ReactNode;
  enabled?: boolean;
  className?: string;
}

export function FocusTrap({ children, enabled = true, className }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus the first element when trap is enabled
    firstElement?.focus();

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [enabled]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// Accessible heading with proper hierarchy
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  visualLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function Heading({ level, visualLevel, className, children, ...props }: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const visualClass = visualLevel ? `h${visualLevel}` : `h${level}`;
  
  const headingClasses = {
    h1: "text-4xl font-bold tracking-tight",
    h2: "text-3xl font-semibold tracking-tight",
    h3: "text-2xl font-semibold tracking-tight",
    h4: "text-xl font-medium",
    h5: "text-lg font-medium",
    h6: "text-base font-medium",
  };

  return React.createElement(
    Tag,
    {
      className: cn(headingClasses[visualClass as keyof typeof headingClasses], className),
      ...props,
    },
    children
  );
}

// Live region for announcements
interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  className?: string;
}

export function LiveRegion({ 
  children, 
  politeness = 'polite', 
  atomic = false,
  className 
}: LiveRegionProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className={cn("sr-only", className)}
    >
      {children}
    </div>
  );
}

// High contrast mode detector and wrapper
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  React.useEffect(() => {
    const checkHighContrast = () => {
      const hasHighContrast = 
        document.documentElement.classList.contains('high-contrast') ||
        window.matchMedia('(prefers-contrast: more)').matches;
      setIsHighContrast(hasHighContrast);
    };

    checkHighContrast();
    
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    const observer = new MutationObserver(checkHighContrast);
    
    mediaQuery.addEventListener('change', checkHighContrast);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => {
      mediaQuery.removeEventListener('change', checkHighContrast);
      observer.disconnect();
    };
  }, []);

  return isHighContrast;
}

// Reduced motion detector
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Announce changes to screen readers
export function useAnnounce() {
  const [announcement, setAnnouncement] = React.useState<string>('');

  const announce = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(''); // Clear first to ensure change is detected
    setTimeout(() => setAnnouncement(message), 100);
  }, []);

  return { announcement, announce };
}