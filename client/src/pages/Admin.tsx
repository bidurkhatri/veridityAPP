import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation, type Language } from "@/lib/i18n";
import { 
  Shield, 
  Users, 
  Activity, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  Building,
  Code,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

export default function Admin() {
  const [language, setLanguage] = useState<Language>('en');
  const { t } = useTranslation(language);

  // Fetch organizations
  const { data: organizations = [] } = useQuery({
    queryKey: ['/api/organizations'],
  });

  // Mock organization stats (in real app, this would be fetched with proper API key)
  const mockOrgStats = {
    todayVerifications: 47,
    monthlyVerifications: 1284,
    successRate: 98.5,
    avgTime: 1.2
  };

  // Mock recent verifications
  const mockRecentVerifications = [
    { type: 'Age 18+ Proof', timestamp: '2:45 PM', status: 'verified' },
    { type: 'Citizenship Proof', timestamp: '2:40 PM', status: 'verified' },
    { type: 'Education Proof', timestamp: '2:35 PM', status: 'failed' },
    { type: 'Income Proof', timestamp: '2:30 PM', status: 'verified' },
    { type: 'Address Proof', timestamp: '2:25 PM', status: 'verified' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Users className="text-primary-foreground text-lg" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-foreground">Organization Dashboard</h1>
                <p className="text-xs text-muted-foreground">Admin verification panel</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher 
                currentLanguage={language} 
                onLanguageChange={setLanguage} 
              />
              
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tribhuvan University</span>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Verifications</p>
                  <p className="text-2xl font-bold text-primary" data-testid="stat-today-verifications">
                    {mockOrgStats.todayVerifications}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Total</p>
                  <p className="text-2xl font-bold text-secondary" data-testid="stat-monthly-verifications">
                    {mockOrgStats.monthlyVerifications.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-accent" data-testid="stat-success-rate">
                    {mockOrgStats.successRate}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Time</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-avg-time">
                    {mockOrgStats.avgTime}s
                  </p>
                </div>
                <Clock className="h-8 w-8 text-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Verifications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Verification Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentVerifications.map((verification, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      data-testid={`verification-${index}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          verification.status === 'verified' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-foreground">{verification.type}</p>
                          <p className="text-sm text-muted-foreground">{verification.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={verification.status === 'verified' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {verification.status.toUpperCase()}
                        </Badge>
                        {verification.status === 'verified' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="outline" data-testid="button-view-all-verifications">
                    View All Verifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API Integration & Organizations */}
          <div className="space-y-6">
            {/* API Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="mr-2 h-5 w-5" />
                  API Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">API Status</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600">ACTIVE</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">All endpoints operational</p>
                </div>
                
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Rate Limit</span>
                    <span className="text-xs text-primary">247/1000</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full" style={{width: '24.7%'}}></div>
                  </div>
                </div>

                <Button variant="outline" className="w-full" data-testid="button-api-docs">
                  <Code className="mr-2 h-4 w-4" />
                  View Documentation
                </Button>
              </CardContent>
            </Card>

            {/* Registered Organizations */}
            <Card>
              <CardHeader>
                <CardTitle>Registered Organizations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {organizations.slice(0, 5).map((org: any) => (
                    <div key={org.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {language === 'np' ? org.nameNepali || org.name : org.name}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">{org.type}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={org.isActive ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {org.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Button variant="outline" className="w-full" data-testid="button-manage-orgs">
                    Manage Organizations
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" data-testid="button-export-logs">
                  <Activity className="mr-2 h-4 w-4" />
                  Export Verification Logs
                </Button>
                
                <Button variant="outline" className="w-full justify-start" data-testid="button-generate-report">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Generate Monthly Report
                </Button>
                
                <Button variant="outline" className="w-full justify-start" data-testid="button-api-settings">
                  <Code className="mr-2 h-4 w-4" />
                  API Key Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
