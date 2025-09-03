import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import { AppHeader } from "@/components/AppHeader";
import { useTranslation } from "@/lib/i18n";
import { 
  Shield, 
  Plus, 
  QrCode, 
  Calendar, 
  CheckCircle,
  Clock,
  Zap,
  Eye,
  Share
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const { t } = useTranslation('en');

  // Fetch user stats
  const { data: stats } = useQuery<{totalProofs: number; verifiedProofs: number; recentProofs: any[]}>({
    queryKey: ['/api/stats/user'],
    enabled: !!user,
  });

  // Fetch recent proofs
  const { data: proofs = [] } = useQuery<any[]>({
    queryKey: ['/api/proofs'],
    enabled: !!user,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const firstName = (user as User)?.firstName || (user as User)?.email?.split('@')[0] || 'Friend';
  const greeting = t('home.greeting', { name: firstName });

  const quickActions = [
    {
      title: t('home.ctaGenerate'),
      description: t('prove.subtitle'),
      icon: Plus,
      href: "/prove",
      color: "from-primary to-primary-600",
      testId: "action-generate-proof"
    },
    {
      title: t('home.ctaMyQR'),
      description: t('share.qrDesc'),
      icon: QrCode,
      href: "/share",
      color: "from-accent to-amber-500",
      testId: "action-my-qr"
    },
    {
      title: t('home.ctaScan'),
      description: t('share.qrDesc'),
      icon: Eye,
      href: "/share?scan=true",
      color: "from-success to-emerald-500",
      testId: "action-scan"
    }
  ];

  const tips = [
    {
      title: t('home.tipLocal'),
      description: t('prove.privacyNote'),
      icon: Shield
    },
    {
      title: t('home.tipInstant'),
      description: t('home.tipInstant'),
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen bg-background apple-blur-bg" style={{ paddingBottom: '80px' }}>
      <AppHeader 
        title={greeting}
        type="root"
        actions={[
          <Button 
            key="logout"
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="text-muted-foreground"
            data-testid="button-logout"
          >
            {t('settings.logout')}
          </Button>
        ]}
        sticky
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="apple-card apple-glass border-0 apple-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('stats.proofsGenerated')}
                  </p>
                  <p className="text-2xl font-bold apple-gradient-text" data-testid="stat-total-proofs">
                    {stats?.totalProofs || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center apple-shadow">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="apple-card apple-glass border-0 apple-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('stats.verifications')}
                  </p>
                  <p className="text-2xl font-bold apple-gradient-text" data-testid="stat-verified-proofs">
                    {stats?.verifiedProofs || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-success to-emerald-500 rounded-xl flex items-center justify-center apple-shadow">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardHeader>
            <CardTitle className="text-lg">
              {t('home.quickActions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  href={action.href}
                  className="block"
                  data-testid={action.testId}
                >
                  <div className="flex items-center p-4 rounded-xl border border-border/20 hover:bg-muted/50 transition-colors group">
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mr-4 apple-shadow group-hover:scale-105 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <Share className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {proofs.length > 0 && (
          <Card className="apple-card apple-glass border-0 apple-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {t('nav.history')}
                </CardTitle>
                <Link href="/history">
                  <Button variant="ghost" size="sm" data-testid="link-view-all-history">
                    {t('common.viewAll')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {proofs.slice(0, 3).map((proof, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{proof.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(proof.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={proof.status === 'verified' ? 'default' : 'secondary'}>
                    {proof.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Privacy Tips */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardHeader>
            <CardTitle className="text-lg">
              {t('home.privacyTips')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mt-1">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{tip.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}