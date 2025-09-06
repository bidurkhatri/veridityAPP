import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Bell, Fingerprint, Eye, HelpCircle } from "lucide-react";

interface PrivacyToggle {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  riskLevel?: 'low' | 'medium' | 'high';
  helpText?: string;
  disabled?: boolean;
}

interface PrivacySettingsProps {
  className?: string;
}

const riskColors = {
  low: 'text-success-text bg-success-bg border-success-border',
  medium: 'text-warning-text bg-warning-bg border-warning-border', 
  high: 'text-danger-text bg-danger-bg border-danger-border',
};

export function PrivacySettings({ className }: PrivacySettingsProps) {
  const [notifications, setNotifications] = React.useState(true);
  const [biometrics, setBiometrics] = React.useState(false);
  const [highContrast, setHighContrast] = React.useState(false);

  const toggles: PrivacyToggle[] = [
    {
      id: 'notifications',
      title: 'Security Notifications',
      description: 'Get alerts for login attempts and proof verifications',
      icon: Bell,
      enabled: notifications,
      onChange: setNotifications,
      riskLevel: 'low',
      helpText: 'Recommended to keep enabled for security monitoring',
    },
    {
      id: 'biometrics',
      title: 'Biometric Authentication',
      description: 'Use fingerprint or Face ID to unlock your account',
      icon: Fingerprint,
      enabled: biometrics,
      onChange: setBiometrics,
      riskLevel: 'medium',
      helpText: 'More secure than passwords but device-dependent',
    },
    {
      id: 'high-contrast',
      title: 'High-Contrast Mode',
      description: 'Enhanced visibility for better accessibility',
      icon: Eye,
      enabled: highContrast,
      onChange: setHighContrast,
      riskLevel: 'low',
      helpText: 'Improves text readability and visual accessibility',
    },
  ];

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Privacy & Security
        </CardTitle>
        <p className="text-sm text-text-secondary">
          Configure your privacy preferences and security settings
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {toggles.map((toggle) => {
          const Icon = toggle.icon;
          const riskColor = toggle.riskLevel ? riskColors[toggle.riskLevel] : '';

          return (
            <div
              key={toggle.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border-default"
              data-testid={`privacy-toggle-${toggle.id}`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-lg bg-surface-secondary">
                  <Icon className="h-4 w-4 text-text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-text-primary">
                      {toggle.title}
                    </h4>
                    {toggle.riskLevel && (
                      <Badge className={cn("text-xs", riskColor)}>
                        {toggle.riskLevel} risk
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {toggle.description}
                  </p>
                  
                  {toggle.helpText && (
                    <div className="flex items-center gap-1 mt-2">
                      <HelpCircle className="h-3 w-3 text-text-tertiary" />
                      <p className="text-xs text-text-tertiary">
                        {toggle.helpText}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Switch
                checked={toggle.enabled}
                onCheckedChange={toggle.onChange}
                disabled={toggle.disabled}
                data-testid={`switch-${toggle.id}`}
              />
            </div>
          );
        })}
        
        {/* Advanced Settings */}
        <div className="pt-4 border-t border-border-default">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            data-testid="advanced-privacy-settings"
          >
            Advanced Privacy Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}