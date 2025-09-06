import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface PortalTile {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  onClick: () => void;
  badge?: string;
  color?: 'primary' | 'success' | 'warning' | 'info';
}

interface PortalTilesProps {
  tiles: PortalTile[];
  columns?: 1 | 2 | 3;
  className?: string;
}

const colorVariants = {
  primary: {
    card: 'hover:border-primary/30 hover:bg-primary/5',
    icon: 'bg-primary/10 text-primary',
    badge: 'bg-primary text-primary-foreground',
  },
  success: {
    card: 'hover:border-success-border/30 hover:bg-success-bg/20',
    icon: 'bg-success-bg text-success-text',
    badge: 'bg-success-bg text-success-text border-success-border',
  },
  warning: {
    card: 'hover:border-warning-border/30 hover:bg-warning-bg/20',
    icon: 'bg-warning-bg text-warning-text',
    badge: 'bg-warning-bg text-warning-text border-warning-border',
  },
  info: {
    card: 'hover:border-info-border/30 hover:bg-info-bg/20',
    icon: 'bg-info-bg text-info-text',
    badge: 'bg-info-bg text-info-text border-info-border',
  },
};

export function PortalTiles({ tiles, columns = 2, className }: PortalTilesProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div className={cn("grid gap-6", gridCols[columns], className)}>
      {tiles.map((tile) => {
        const Icon = tile.icon;
        const colors = colorVariants[tile.color || 'primary'];

        return (
          <Card
            key={tile.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md group",
              "border border-border-default",
              colors.card
            )}
            onClick={tile.onClick}
            data-testid={`portal-tile-${tile.id}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-xl", colors.icon)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                      {tile.title}
                    </h3>
                  </div>
                </div>
                
                {tile.badge && (
                  <Badge className={cn("text-xs", colors.badge)}>
                    {tile.badge}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-text-secondary leading-relaxed">
                {tile.description}
              </p>

              {/* Feature List */}
              <div className="space-y-2">
                {tile.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-text-secondary">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Arrow */}
              <div className="flex items-center justify-end pt-2">
                <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Quick 5-second test optimized version
export function QuickPortalTiles({ tiles, className }: { tiles: PortalTile[]; className?: string }) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      {tiles.map((tile) => {
        const Icon = tile.icon;
        const colors = colorVariants[tile.color || 'primary'];

        return (
          <Card
            key={tile.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-sm group p-4",
              "border border-border-default",
              colors.card
            )}
            onClick={tile.onClick}
            data-testid={`quick-tile-${tile.id}`}
          >
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", colors.icon)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-text-primary group-hover:text-primary transition-colors">
                  {tile.title}
                </h4>
                <p className="text-sm text-text-secondary truncate">
                  {tile.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-primary transition-colors flex-shrink-0" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}