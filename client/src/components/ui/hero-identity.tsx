import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Bell, User } from "lucide-react";

interface HeroIdentityProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
    verified?: boolean;
  };
  environment: 'development' | 'staging' | 'production';
  className?: string;
}

const environmentBadges = {
  development: { label: 'Dev', variant: 'warning' as const, color: 'bg-warning-bg text-warning-text border-warning-border' },
  staging: { label: 'Staging', variant: 'info' as const, color: 'bg-info-bg text-info-text border-info-border' },
  production: { label: 'Live', variant: 'success' as const, color: 'bg-success-bg text-success-text border-success-border' },
};

const roleBadges = {
  admin: { label: 'Admin', color: 'bg-danger-bg text-danger-text border-danger-border' },
  organization: { label: 'Organization', color: 'bg-primary text-primary-foreground' },
  customer: { label: 'Customer', color: 'bg-info-bg text-info-text border-info-border' },
  developer: { label: 'Developer', color: 'bg-success-bg text-success-text border-success-border' },
};

export function HeroIdentity({ user, environment, className }: HeroIdentityProps) {
  const envBadge = environmentBadges[environment];
  const roleBadge = roleBadges[user.role as keyof typeof roleBadges] || roleBadges.customer;

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn(
      "flex items-center justify-between p-4 bg-surface border-b border-border-default",
      className
    )}>
      <div className="flex items-center gap-4">
        {/* User Avatar */}
        <Avatar className="h-10 w-10" data-testid="user-avatar">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-primary text-primary-foreground font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium text-text-primary" data-testid="user-name">
              {user.name}
            </span>
            {user.verified && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-success-bg text-success-text border-success-border">
                Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-text-tertiary" data-testid="user-email">
              {user.email}
            </span>
            <Badge 
              className={cn("text-xs px-2 py-0.5", roleBadge.color)}
              data-testid="user-role"
            >
              {roleBadge.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Actions and Environment */}
      <div className="flex items-center gap-3">
        {/* Environment Badge */}
        <Badge 
          className={cn("text-xs px-2 py-1", envBadge.color)}
          data-testid="environment-badge"
        >
          {envBadge.label}
        </Badge>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            data-testid="notifications-button"
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            data-testid="settings-button"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            data-testid="profile-button"
          >
            <User className="h-4 w-4" />
            <span className="sr-only">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
}