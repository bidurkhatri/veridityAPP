import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ProofCard } from "@/components/ProofCard";
import { useTranslation, type Language } from "@/lib/i18n";
import { 
  Shield, 
  Plus, 
  Eye, 
  Calendar, 
  Flag, 
  GraduationCap, 
  Settings,
  Lock,
  Fingerprint,
  Key,
  Wifi,
  HelpCircle,
  Book,
  Headphones
} from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [language, setLanguage] = useState<Language>('en');
  const { t } = useTranslation(language);

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

  const recentProofs = proofs.slice(0, 3);

  return (
    <div className="min-h-screen bg-background apple-blur-bg">
      {/* Header */}
      <header className="apple-glass border-b border-border/20 sticky top-0 z-50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="text-primary-foreground text-lg" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-foreground">Veridity</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {language === 'np' ? 'प्राइभेसी पहिले डिजिटल पहिचान' : 'Privacy-first digital identity'}
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.dashboard')}
              </Link>
              <Link href="/generate" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.generateProof')}
              </Link>
              <Link href="/verify" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.verify')}
              </Link>
              <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.help')}
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher 
                currentLanguage={language} 
                onLanguageChange={setLanguage} 
              />
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">
                    {(user as any)?.firstName?.[0] || (user as any)?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm text-foreground hidden sm:inline">
                  {(user as any)?.firstName} {(user as any)?.lastName}
                </span>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Welcome Section */}
        <section className="apple-glass rounded-3xl p-8 mb-8 border-0 relative overflow-hidden apple-shadow apple-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5"></div>
          <div className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  {t('welcome.title')}
                  <span className="block text-lg font-normal text-muted-foreground mt-2">
                    {t('welcome.subtitle')}
                  </span>
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t('welcome.description')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/generate">
                    <Button className="flex items-center apple-gradient apple-button border-0 shadow-lg px-8 py-3" data-testid="button-generate-proof">
                      <Plus className="mr-2 h-5 w-5" />
                      {t('welcome.generateProof')}
                    </Button>
                  </Link>
                  <Link href="/verify">
                    <Button variant="outline" className="flex items-center apple-button border-border/20 backdrop-blur-sm px-8 py-3" data-testid="button-verify-proof">
                      <Eye className="mr-2 h-5 w-5" />
                      {t('welcome.verifyProof')}
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Stats Dashboard */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="text-center apple-card apple-glass border-0">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold apple-gradient-text" data-testid="stat-total-proofs">
                      {stats?.totalProofs || 0}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">{t('stats.proofsGenerated')}</div>
                  </CardContent>
                </Card>
                
                <Card className="text-center apple-card apple-glass border-0">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-secondary" data-testid="stat-verified-proofs">
                      {stats?.verifiedProofs || 0}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">{t('stats.verifications')}</div>
                  </CardContent>
                </Card>
                
                <Card className="text-center apple-card apple-glass border-0">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-accent">5</div>
                    <div className="text-sm text-muted-foreground font-medium">{t('stats.trustedOrgs')}</div>
                  </CardContent>
                </Card>
                
                <Card className="text-center apple-card apple-glass border-0">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-foreground">100%</div>
                    <div className="text-sm text-muted-foreground font-medium">{t('stats.privacyProtected')}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="apple-card apple-glass border-0 apple-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Plus className="mr-3 h-6 w-6 text-accent" />
                  Quick Proof Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/generate?type=age">
                    <Card className="cursor-pointer apple-card apple-glass border-0 group">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center apple-shadow group-hover:scale-105 transition-transform">
                            <Calendar className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <h4 className="font-semibold text-foreground text-lg">{t('proof.age.title')}</h4>
                          </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {t('proof.age.description')}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/generate?type=citizenship">
                    <Card className="cursor-pointer apple-card apple-glass border-0 group">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center apple-shadow group-hover:scale-105 transition-transform">
                            <Flag className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <h4 className="font-semibold text-foreground text-lg">{t('proof.citizenship.title')}</h4>
                          </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {t('proof.citizenship.description')}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/generate?type=education">
                    <Card className="cursor-pointer apple-card apple-glass border-0 group">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center apple-shadow group-hover:scale-105 transition-transform">
                            <GraduationCap className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <h4 className="font-semibold text-foreground text-lg">{t('proof.education.title')}</h4>
                          </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {t('proof.education.description')}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Proofs */}
            {recentProofs.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Proofs</CardTitle>
                    <Link href="/proofs">
                      <Button variant="ghost" size="sm">
                        {t('common.viewAll')}
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentProofs.map((proof: any) => (
                      <div key={proof.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {proof.proofType?.name || 'Unknown Type'}
                            </p>
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
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile */}
            <Card className="apple-card apple-glass border-0 apple-shadow">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 apple-gradient rounded-full flex items-center justify-center mx-auto mb-4 apple-shadow">
                    <span className="text-white text-2xl font-bold">
                      {(user as any)?.firstName?.[0] || (user as any)?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-lg">
                    {(user as any)?.firstName} {(user as any)?.lastName}
                  </h3>
                  <p className="text-muted-foreground">{(user as any)?.email}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Account Status</span>
                    <Badge className="bg-primary text-primary-foreground">
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="text-foreground">
                      {(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4" data-testid="button-account-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  {t('nav.accountSettings')}
                </Button>
              </CardContent>
            </Card>

            {/* Security Status */}
            <Card className="apple-card apple-glass border-0 apple-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Shield className="mr-3 h-6 w-6 text-primary" />
                  {t('security.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Fingerprint className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-sm text-foreground">{t('security.biometric')}</span>
                    </div>
                    <div className="text-primary">
                      <Badge variant="outline">ON</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Key className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-sm text-foreground">{t('security.encryption')}</span>
                    </div>
                    <div className="text-primary">
                      <Badge variant="outline">ON</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wifi className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-sm text-foreground">{t('security.offline')}</span>
                    </div>
                    <div className="text-primary">
                      <Badge variant="outline">ON</Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-primary font-medium flex items-center">
                    <Lock className="mr-2 h-4 w-4" />
                    {t('security.allSecure')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card className="apple-card apple-glass border-0 apple-shadow">
              <CardHeader>
                <CardTitle className="text-xl">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start">
                    <HelpCircle className="mr-3 h-4 w-4 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-foreground text-sm">{t('help.zkp')}</p>
                      <p className="text-xs text-muted-foreground">Learn about zero-knowledge proofs</p>
                    </div>
                  </Button>
                  
                  <Button variant="ghost" className="w-full justify-start">
                    <Book className="mr-3 h-4 w-4 text-accent" />
                    <div className="text-left">
                      <p className="font-medium text-foreground text-sm">{t('help.userGuide')}</p>
                      <p className="text-xs text-muted-foreground">Step-by-step tutorials</p>
                    </div>
                  </Button>
                  
                  <Button variant="ghost" className="w-full justify-start">
                    <Headphones className="mr-3 h-4 w-4 text-secondary" />
                    <div className="text-left">
                      <p className="font-medium text-foreground text-sm">{t('help.support')}</p>
                      <p className="text-xs text-muted-foreground">Get help from our team</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
