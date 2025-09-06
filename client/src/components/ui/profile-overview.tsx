import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Shield, 
  Key, 
  CloudDownload, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Star
} from "lucide-react";
import { VerificationLevel } from "./status-pills";

interface ProfileOverviewProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    joinedAt: Date;
  };
  verification: {
    level: 'basic' | 'standard' | 'premium' | 'enterprise';
    score: number;
    completedProofs: number;
  };
  security: {
    passkeyEnabled: boolean;
    backupStatus: 'none' | 'partial' | 'complete';
    lastBackup?: Date;
  };
  className?: string;
}

export function ProfileOverview({ 
  user, 
  verification, 
  security, 
  className 
}: ProfileOverviewProps) {
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getBackupStatus = () => {
    switch (security.backupStatus) {
      case 'complete':
        return {
          icon: CheckCircle,
          label: 'Backup Complete',
          color: 'text-success-text',
          description: 'Recovery phrase safely stored',
        };
      case 'partial':
        return {
          icon: AlertTriangle,
          label: 'Partial Backup',
          color: 'text-warning-text',
          description: 'Complete your backup setup',
        };
      default:
        return {
          icon: Clock,
          label: 'No Backup',
          color: 'text-danger-text',
          description: 'Set up account recovery',
        };
    }
  };

  const backupInfo = getBackupStatus();
  const BackupIcon = backupInfo.icon;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Profile Overview</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary">
              {user.name}
            </h3>
            <p className="text-text-secondary">{user.email}</p>
            <p className="text-sm text-text-tertiary">
              Member since {user.joinedAt.toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Verification Level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-text-primary flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Verification Level
            </h4>
            <VerificationLevel level={verification.level} score={verification.score} />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Verification Progress</span>
              <span className="font-medium">{verification.score}% complete</span>
            </div>
            <Progress value={verification.score} className="h-2" />
            <p className="text-xs text-text-tertiary">
              {verification.completedProofs} proofs verified
            </p>
          </div>
        </div>

        {/* Security Status */}
        <div className="space-y-4">
          <h4 className="font-medium text-text-primary flex items-center gap-2">
            <Key className="h-4 w-4" />
            Security Status
          </h4>

          {/* Passkey Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary/50">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                security.passkeyEnabled ? "bg-success-bg text-success-text" : "bg-warning-bg text-warning-text"
              )}>
                <Key className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm">Passkey Authentication</p>
                <p className="text-xs text-text-secondary">
                  {security.passkeyEnabled 
                    ? "Biometric login enabled" 
                    : "Password-only authentication"
                  }
                </p>
              </div>
            </div>
            <Badge 
              className={cn(
                "text-xs",
                security.passkeyEnabled 
                  ? "text-success-text bg-success-bg border-success-border"
                  : "text-warning-text bg-warning-bg border-warning-border"
              )}
            >
              {security.passkeyEnabled ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Backup Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary/50">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                security.backupStatus === 'complete' ? "bg-success-bg text-success-text" :
                security.backupStatus === 'partial' ? "bg-warning-bg text-warning-text" :
                "bg-danger-bg text-danger-text"
              )}>
                <BackupIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm">{backupInfo.label}</p>
                <p className="text-xs text-text-secondary">
                  {backupInfo.description}
                </p>
                {security.lastBackup && (
                  <p className="text-xs text-text-tertiary">
                    Last backup: {security.lastBackup.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              data-testid="backup-action-button"
            >
              {security.backupStatus === 'none' ? 'Set Up' : 'Manage'}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-border-default">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              data-testid="edit-profile-button"
            >
              <Star className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              data-testid="security-settings-button"
            >
              <Shield className="h-4 w-4" />
              Security
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}