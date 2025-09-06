import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";

interface ActionCard {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
  badge?: string;
}

interface ActionCardsProps {
  cards: ActionCard[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

const cardVariants = {
  default: "hover:bg-surface-secondary border-border-default",
  primary: "bg-primary/5 border-primary/20 hover:bg-primary/10",
  success: "bg-success-bg/50 border-success-border/50 hover:bg-success-bg",
  warning: "bg-warning-bg/50 border-warning-border/50 hover:bg-warning-bg",
  danger: "bg-danger-bg/50 border-danger-border/50 hover:bg-danger-bg",
};

const iconVariants = {
  default: "text-text-secondary",
  primary: "text-primary",
  success: "text-success-text",
  warning: "text-warning-text",
  danger: "text-danger-text",
};

export function ActionCards({ cards, columns = 2, className }: ActionCardsProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        const variant = card.variant || 'default';

        return (
          <Card
            key={index}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md group relative overflow-hidden",
              cardVariants[variant],
              card.disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={card.disabled ? undefined : card.onClick}
            data-testid={`action-card-${index}`}
          >
            {card.badge && (
              <div className="absolute top-2 right-2">
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  {card.badge}
                </span>
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg bg-surface-secondary group-hover:bg-surface-tertiary transition-colors",
                    !card.disabled && iconVariants[variant]
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium text-text-primary group-hover:text-text-primary">
                      {card.title}
                    </CardTitle>
                  </div>
                </div>
                
                {!card.disabled && (
                  <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-text-secondary group-hover:translate-x-1 transition-all" />
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-sm text-text-secondary leading-relaxed">
                {card.description}
              </p>
            </CardContent>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </Card>
        );
      })}
    </div>
  );
}

// Quick Action variant for smaller, icon-focused cards
interface QuickActionProps {
  title: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
  className?: string;
}

export function QuickAction({ 
  title, 
  icon: Icon, 
  onClick, 
  variant = 'default', 
  disabled = false,
  className 
}: QuickActionProps) {
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-auto p-4 flex-col gap-2 hover:bg-surface-secondary",
        cardVariants[variant],
        className
      )}
      data-testid={`quick-action-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <Icon className={cn("h-6 w-6", iconVariants[variant])} />
      <span className="text-sm font-medium">{title}</span>
    </Button>
  );
}