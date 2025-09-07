import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2,
  Key,
  Webhook,
  BarChart3,
  Settings,
  Users,
  Shield,
  Activity,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface OrgAdminDashboardData {
  organization: {
    id: string;
    name: string;
    type: string;
    isActive: boolean;
  };
  stats: {
    todayVerifications: number;
    monthlyVerifications: number;
    successRate: number;
    avgTime: number;
  };
  apiKeys: Array<{
    id: string;
    name: string;
    lastUsed: string;
    isActive: boolean;
  }>;
  webhooks: Array<{
    id: string;
    url: string;
    events: string[];
    status: 'active' | 'inactive' | 'error';
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    timestamp: string;
    status: string;
  }>;
}

export default function OrgAdminDashboard() {
  const { data, isLoading } = useQuery<OrgAdminDashboardData>({
    queryKey: ['/api/org-admin/dashboard'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading organization dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Unable to Load Dashboard</h1>
          <p className="text-muted-foreground">Please check your organization access.</p>
        </div>
      </div>
    );
  }

  const { organization, stats, apiKeys, webhooks, recentActivity } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold" data-testid="org-dashboard-title">
                  {organization.name}
                </h1>
                <p className="text-muted-foreground">
                  Organization Dashboard • {organization.type}
                </p>
              </div>
            </div>
            <Badge variant={organization.isActive ? "default" : "secondary"}>
              {organization.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Today's Verifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-today-verifications">
                {stats.todayVerifications}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +12% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Monthly Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-monthly-verifications">
                {stats.monthlyVerifications}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This month's verifications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success" data-testid="stat-success-rate">
                {stats.successRate}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Verification success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Avg Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-avg-time">
                {stats.avgTime}s
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Average processing time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Recent Verification Activity
                </CardTitle>
                <CardDescription>
                  Latest verification requests processed by your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          activity.status === 'verified' ? 'bg-success/10 text-success' :
                          activity.status === 'failed' ? 'bg-destructive/10 text-destructive' :
                          'bg-warning/10 text-warning'
                        }`}>
                          <Shield className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{activity.type}</h4>
                          <p className="text-sm text-muted-foreground">
                            {activity.timestamp}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        activity.status === 'verified' ? 'default' :
                        activity.status === 'failed' ? 'destructive' :
                        'secondary'
                      }>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      API Keys
                    </CardTitle>
                    <CardDescription>
                      Manage your organization's API keys for Veridity integration
                    </CardDescription>
                  </div>
                  <Button data-testid="button-create-api-key">
                    Create New Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{key.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Last used: {key.lastUsed}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={key.isActive ? "default" : "secondary"}>
                          {key.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="secondary" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Webhook className="h-5 w-5" />
                      Webhooks
                    </CardTitle>
                    <CardDescription>
                      Configure webhook endpoints for real-time verification notifications
                    </CardDescription>
                  </div>
                  <Button data-testid="button-create-webhook">
                    Add Webhook
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Webhook className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium font-mono text-sm">{webhook.url}</h4>
                          <p className="text-sm text-muted-foreground">
                            Events: {webhook.events.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          webhook.status === 'active' ? 'default' :
                          webhook.status === 'error' ? 'destructive' :
                          'secondary'
                        }>
                          {webhook.status}
                        </Badge>
                        <Button variant="secondary" size="sm">
                          Configure
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Organization Settings
                </CardTitle>
                <CardDescription>
                  Configure your organization's verification preferences and security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Security Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button variant="secondary" className="w-full justify-start">
                          <Shield className="h-4 w-4 mr-2" />
                          IP Allowlist
                        </Button>
                        <Button variant="secondary" className="w-full justify-start">
                          <Key className="h-4 w-4 mr-2" />
                          Rotate API Keys
                        </Button>
                        <Button variant="secondary" className="w-full justify-start">
                          <Users className="h-4 w-4 mr-2" />
                          Manage Team Access
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Integration Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button variant="secondary" className="w-full justify-start">
                          <Webhook className="h-4 w-4 mr-2" />
                          Webhook Configuration
                        </Button>
                        <Button variant="secondary" className="w-full justify-start">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics Setup
                        </Button>
                        <Button variant="secondary" className="w-full justify-start">
                          <Activity className="h-4 w-4 mr-2" />
                          Rate Limits
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}