import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import { useTranslation } from "@/lib/i18n";
import { AppHeader } from "@/components/AppHeader";
import { 
  Settings as SettingsIcon,
  User as UserIcon,
  Lock,
  Shield,
  Bell,
  Globe,
  Trash2,
  LogOut,
  Fingerprint,
  Key,
  Eye,
  Download,
  HelpCircle,
  ChevronRight,
  CheckCircle
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { t } = useTranslation('en');
  
  // Settings state
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const settingSections = [
    {
      title: language === 'np' ? 'खाता' : 'Account',
      items: [
        {
          icon: UserIcon,
          title: language === 'np' ? 'प्रोफाइल जानकारी' : 'Profile Information',
          description: language === 'np' ? 'तपाईंको व्यक्तिगत विवरण' : 'Your personal details',
          action: () => console.log('Edit profile'),
          testId: "setting-profile"
        },
        {
          icon: Globe,
          title: language === 'np' ? 'भाषा' : 'Language',
          description: language === 'np' ? 'इन्टरफेस भाषा परिवर्तन गर्नुहोस्' : 'Change interface language',
          action: () => console.log('Change language'),
          testId: "setting-language",
          rightElement: <Badge variant="secondary">{language === 'np' ? 'नेपाली' : 'English'}</Badge>
        }
      ]
    },
    {
      title: language === 'np' ? 'सुरक्षा' : 'Security',
      items: [
        {
          icon: Lock,
          title: language === 'np' ? 'PIN परिवर्तन गर्नुहोस्' : 'Change PIN',
          description: language === 'np' ? '६-अंकको सुरक्षा PIN' : '6-digit security PIN',
          action: () => console.log('Change PIN'),
          testId: "setting-pin"
        },
        {
          icon: Fingerprint,
          title: language === 'np' ? 'बायोमेट्रिक लक' : 'Biometric Lock',
          description: language === 'np' ? 'फिंगरप्रिन्ट वा चेहरा ID' : 'Fingerprint or Face ID',
          action: () => setBiometricEnabled(!biometricEnabled),
          testId: "setting-biometric",
          rightElement: <Switch checked={biometricEnabled} onCheckedChange={setBiometricEnabled} />
        },
        {
          icon: Key,
          title: language === 'np' ? 'डेटा निर्यात गर्नुहोस्' : 'Export Data',
          description: language === 'np' ? 'तपाईंको प्रमाण डेटा डाउनलोड गर्नुहोस्' : 'Download your proof data',
          action: () => console.log('Export data'),
          testId: "setting-export"
        }
      ]
    },
    {
      title: language === 'np' ? 'गोपनीयता' : 'Privacy',
      items: [
        {
          icon: Bell,
          title: language === 'np' ? 'सूचनाहरू' : 'Notifications',
          description: language === 'np' ? 'प्रमाणीकरण अद्यावधिकहरू' : 'Verification updates',
          action: () => setNotificationsEnabled(!notificationsEnabled),
          testId: "setting-notifications",
          rightElement: <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
        },
        {
          icon: Shield,
          title: language === 'np' ? 'अफलाइन मोड' : 'Offline Mode',
          description: language === 'np' ? 'इन्टरनेट बिना प्रमाण उत्पन्न गर्नुहोस्' : 'Generate proofs without internet',
          action: () => setOfflineMode(!offlineMode),
          testId: "setting-offline",
          rightElement: <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
        },
        {
          icon: Eye,
          title: language === 'np' ? 'डेटा दृश्यता' : 'Data Visibility',
          description: language === 'np' ? 'के डेटा स्थानीय रूपमा भण्डारण गरिएको छ' : 'What data is stored locally',
          action: () => console.log('View data'),
          testId: "setting-data-visibility"
        }
      ]
    },
    {
      title: language === 'np' ? 'सहायता' : 'Support',
      items: [
        {
          icon: HelpCircle,
          title: language === 'np' ? 'सहायता केन्द्र' : 'Help Center',
          description: language === 'np' ? 'FAQ र गाइडहरू' : 'FAQs and guides',
          action: () => window.open('/help', '_blank'),
          testId: "setting-help"
        },
        {
          icon: Download,
          title: language === 'np' ? 'डेटा डाउनलोड गर्नुहोस्' : 'Download Data',
          description: language === 'np' ? 'तपाईंको सम्पूर्ण डेटा निर्यात गर्नुहोस्' : 'Export all your data',
          action: () => console.log('Download all data'),
          testId: "setting-download-all"
        }
      ]
    }
  ];

  const dangerZone = [
    {
      icon: LogOut,
      title: language === 'np' ? 'लगआउट' : 'Log Out',
      description: language === 'np' ? 'सबै यन्त्रहरूबाट बाहिर निस्कनुहोस्' : 'Sign out from all devices',
      action: handleLogout,
      testId: "setting-logout",
      variant: 'secondary' as const
    },
    {
      icon: Trash2,
      title: language === 'np' ? 'खाता मेटाउनुहोस्' : 'Delete Account',
      description: language === 'np' ? 'स्थायी रूपमा तपाईंको डेटा हटाउनुहोस्' : 'Permanently remove your data',
      action: () => console.log('Delete account'),
      testId: "setting-delete-account",
      variant: 'destructive' as const
    }
  ];

  return (
    <div className="min-h-screen bg-background apple-blur-bg" style={{ paddingBottom: '80px' }}>
      <AppHeader 
        title={t('nav.settings')}
        type="root"
        sticky
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* User Profile Card */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-600 rounded-2xl flex items-center justify-center">
                {(user as User)?.profileImageUrl ? (
                  <img 
                    src={(user as User).profileImageUrl!} 
                    alt="Profile" 
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <UserIcon className="h-8 w-8 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg text-foreground">
                  {(user as User)?.firstName ? `${(user as User).firstName} ${(user as User)?.lastName || ''}`.trim() : 'User'}
                </h2>
                <p className="text-sm text-muted-foreground">{(user as User)?.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-xs text-success font-medium">
                    {language === 'np' ? 'प्रमाणित खाता' : 'Verified Account'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="apple-card apple-glass border-0 apple-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIndex}
                    onClick={item.action}
                    className="w-full flex items-center p-4 rounded-xl hover:bg-muted/50 transition-colors group text-left"
                    data-testid={item.testId}
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mr-4">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    {item.rightElement || (
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        ))}

        {/* Danger Zone */}
        <Card className="apple-card apple-glass border-0 apple-shadow border-destructive/20">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">
              {language === 'np' ? 'खतरनाक क्षेत्र' : 'Danger Zone'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {dangerZone.map((item, index) => {
              const Icon = item.icon;
              const textColor = item.variant === 'destructive' ? 'text-destructive' : 'text-foreground';
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center p-4 rounded-xl hover:bg-muted/50 transition-colors group text-left"
                  data-testid={item.testId}
                >
                  <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center mr-4">
                    <Icon className={`h-5 w-5 ${item.variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${textColor}`}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* App Information */}
        <Card className="apple-glass border-0 apple-shadow bg-muted/20">
          <CardContent className="p-6 text-center">
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">Veridity</h3>
              <p className="text-sm text-muted-foreground">
                {language === 'np' ? 'संस्करण १.०.०' : 'Version 1.0.0'}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === 'np' 
                  ? 'नेपालको लागि गोपनीयता-केन्द्रित डिजिटल पहिचान'
                  : 'Privacy-first digital identity for Nepal'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}