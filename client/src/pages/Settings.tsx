import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import { useTranslation } from "@/lib/i18n";
import { AppHeader } from "@/components/AppHeader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StatusPill } from "@/components/StatusPill";
import { WalletBackup } from "@/components/WalletBackup";
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Shield,
  Bell,
  Fingerprint,
  Trash2,
  Download,
  HelpCircle,
  LogOut,
  ChevronRight,
  Mail,
  Calendar
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { t } = useTranslation('en');
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [autoDelete, setAutoDelete] = useState(30);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const settingsOptions = [
    {
      title: 'Notifications',
      description: 'Alerts for new verifications',
      value: notifications,
      onChange: setNotifications,
      testId: "toggle-notifications"
    },
    {
      title: 'Biometric Security',
      description: 'Face or fingerprint access',
      value: biometric,
      onChange: setBiometric,
      testId: "toggle-biometric"
    }
  ];

  const menuItems = [
    {
      title: 'Privacy Policy',
      description: 'How we protect your data',
      icon: Shield,
      href: '/privacy',
      testId: 'link-privacy'
    },
    {
      title: 'Help & Support',
      description: 'Get help and contact us',
      icon: HelpCircle,
      href: '/help',
      testId: 'link-help'
    },
    {
      title: 'Export Data',
      description: 'Download your verification history',
      icon: Download,
      action: () => console.log('Export data'),
      testId: 'button-export'
    },
    {
      title: 'Delete Account',
      description: 'Permanently remove your account',
      icon: Trash2,
      action: () => console.log('Delete account'),
      destructive: true,
      testId: 'button-delete-account'
    }
  ];

  return (
    <div className="min-h-screen bg-canvas" style={{ paddingBottom: '80px' }}>
      <AppHeader 
        title={t('nav.settings')}
        type="root"
        actions={[
          <ThemeToggle key="theme-toggle" />
        ]}
        sticky
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* User Profile */}
        <Card className="bg-surface shadow-elev1 rounded-card border">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center shadow-elev1">
                {(user as User)?.profileImageUrl ? (
                  <img 
                    src={(user as User).profileImageUrl!} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-8 w-8 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-brand-emphasis">
                  {(user as User)?.firstName || (user as User)?.email?.split('@')[0] || 'User'}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-text-secondary">
                  <Mail className="h-4 w-4" />
                  <span>{(user as User)?.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-text-secondary mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {new Date((user as User)?.createdAt || '').toLocaleDateString()}</span>
                </div>
              </div>
              <StatusPill status="verified">
                Verified
              </StatusPill>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Backup */}
        <WalletBackup />

        {/* Privacy Settings */}
        <Card className="bg-surface shadow-elev1 rounded-card border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-text-primary">
              <Shield className="h-5 w-5" />
              <span>Privacy & Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {settingsOptions.map((option, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-text-primary">{option.title}</h3>
                  <p className="text-sm text-text-secondary">{option.description}</p>
                </div>
                <Switch
                  checked={option.value}
                  onCheckedChange={option.onChange}
                  data-testid={option.testId}
                />
              </div>
            ))}
            
            {/* Auto Delete Setting */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Auto-delete proofs</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically remove proofs after {autoDelete} days
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoDelete(Math.max(7, autoDelete - 7))}
                    disabled={autoDelete <= 7}
                    className="apple-button"
                  >
                    -
                  </Button>
                  <span className="min-w-[3rem] text-center font-medium">{autoDelete}d</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoDelete(Math.min(365, autoDelete + 7))}
                    disabled={autoDelete >= 365}
                    className="apple-button"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardContent className="p-6 space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left ${
                    item.destructive ? 'hover:bg-destructive/10' : ''
                  }`}
                  data-testid={item.testId}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${item.destructive ? 'text-destructive' : 'text-muted-foreground'}`} />
                    <div>
                      <h3 className={`font-medium ${item.destructive ? 'text-destructive' : ''}`}>
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardContent className="p-6">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full apple-button border-destructive/20 text-destructive hover:bg-destructive/10"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>

        {/* App Version */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Veridity v1.0.0</p>
          <p>Privacy-first digital identity platform</p>
        </div>
      </main>
    </div>
  );
}