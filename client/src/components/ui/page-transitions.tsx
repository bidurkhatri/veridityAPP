import * as React from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const [location] = useLocation();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Reset and animate in
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, [location]);

  React.useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
    }
  }, []);

  return (
    <div
      className={cn(
        "transition-all duration-fast ease-out",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2",
        className
      )}
      style={{
        transitionDuration: "var(--duration-fast)",
        transitionTimingFunction: "var(--ease-out)"
      }}
    >
      {children}
    </div>
  );
}