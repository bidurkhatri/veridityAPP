import * as React from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export function HighContrastToggle() {
  const [highContrast, setHighContrast] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("veridity-high-contrast") === "true";
    }
    return false;
  });

  React.useEffect(() => {
    const root = document.documentElement;
    
    if (highContrast) {
      root.classList.add("high-contrast");
      root.style.setProperty('--text-primary', 'hsl(0, 0%, 0%)');
      root.style.setProperty('--bg-canvas', 'hsl(0, 0%, 100%)');
      root.style.setProperty('--border-default', 'hsl(0, 0%, 20%)');
      root.style.setProperty('--focus-ring', 'hsl(220, 100%, 30%)');
    } else {
      root.classList.remove("high-contrast");
      // Reset to original design tokens
      root.style.removeProperty('--text-primary');
      root.style.removeProperty('--bg-canvas');
      root.style.removeProperty('--border-default');
      root.style.removeProperty('--focus-ring');
    }
    
    localStorage.setItem("veridity-high-contrast", String(highContrast));
  }, [highContrast]);

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleHighContrast}
      data-testid="high-contrast-toggle"
      className="h-8 w-8 px-0"
      title={highContrast ? "Disable high contrast" : "Enable high contrast"}
    >
      <Eye className={`h-4 w-4 ${highContrast ? 'text-primary' : 'text-text-tertiary'}`} />
      <span className="sr-only">Toggle high contrast</span>
    </Button>
  );
}