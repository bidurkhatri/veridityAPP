import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield,
  Server,
  Users,
  AlertTriangle,
  Activity,
  TrendingUp,
  Database,
  Lock,
  Bell,
  Settings,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck
} from 'lucide-react';

interface AdminDashboardData {
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: string;
    responseTime: number;
    errorRate: number;
  };
  userStats: {
    total: number;
    admins: number;
    clients: number;
    customers: number;
    dailyActive: number;
  };
  systemStats: {
    totalUsers: number;
    totalProofs: number;
    totalVerifications: number;
    totalOrganizations: number;
  };
  recentIncidents: Array<{
    id: string;
    type: 'security' | 'performance' | 'system';
    message: string;
    timestamp: string;
    status: 'resolved' | 'investigating' | 'open';
  }>;
  securityEvents: Array<{
    id: string;
    event: string;
    user: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery<AdminDashboardData>({
    queryKey: ['/api/admin/dashboard'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading system dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Administrator privileges required.</p>
        </div>
      </div>
    );
  }

  const { systemHealth, userStats, systemStats, recentIncidents, securityEvents } = data;

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'critical': return <XCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold" data-testid="admin-dashboard-title">
                  System Administration
                </h1>
                <p className="text-muted-foreground">
                  Platform management and security oversight
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${getHealthColor(systemHealth.status)}`}>
                {getHealthIcon(systemHealth.status)}
                <span className="font-medium capitalize">{systemHealth.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Server className="h-4 w-4" />
                System Uptime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-uptime">
                {systemHealth.uptime}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Operational time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-response-time">
                {systemHealth.responseTime}ms
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Average response time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Error Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-error-rate">
                {systemHealth.errorRate}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Current error rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-active-users">
                {userStats.dailyActive}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Daily active users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-users">
                {systemStats.totalUsers}
              </div>
              <div className="text-xs text-muted-foreground mt-2 space-y-1">
                <div>Customers: {userStats.customers}</div>
                <div>Clients: {userStats.clients}</div>
                <div>Admins: {userStats.admins}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Total Proofs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-proofs">
                {systemStats.totalProofs}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Generated proofs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Verifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-verifications">
                {systemStats.totalVerifications}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total verifications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Database className="h-4 w-4" />
                Organizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-organizations">
                {systemStats.totalOrganizations}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered organizations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="incidents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="security">Security Events</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="incidents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Incidents
                </CardTitle>
                <CardDescription>
                  System incidents and their resolution status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentIncidents.map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          incident.type === 'security' ? 'bg-destructive/10 text-destructive' :
                          incident.type === 'performance' ? 'bg-warning/10 text-warning' :
                          'bg-info/10 text-info'
                        }`}>
                          {incident.type === 'security' ? (
                            <Lock className="h-4 w-4" />
                          ) : incident.type === 'performance' ? (
                            <BarChart3 className="h-4 w-4" />
                          ) : (
                            <Server className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{incident.message}</h4>
                          <p className="text-sm text-muted-foreground">
                            {incident.timestamp} • {incident.type}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        incident.status === 'resolved' ? 'default' :
                        incident.status === 'investigating' ? 'secondary' :
                        'destructive'
                      }>
                        {incident.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Events
                </CardTitle>
                <CardDescription>
                  Authentication attempts, access violations, and security alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          event.severity === 'critical' ? 'bg-destructive text-destructive-foreground' :
                          event.severity === 'high' ? 'bg-destructive/20 text-destructive' :
                          event.severity === 'medium' ? 'bg-warning/20 text-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          <Shield className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{event.event}</h4>
                          <p className="text-sm text-muted-foreground">
                            User: {event.user} • {event.timestamp}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        event.severity === 'critical' || event.severity === 'high' ? 'destructive' :
                        event.severity === 'medium' ? 'secondary' :
                        'outline'
                      }>
                        {event.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Management
                    </CardTitle>
                    <CardDescription>
                      Manage user accounts, roles, and permissions
                    </CardDescription>
                  </div>
                  <Button data-testid="button-manage-users">
                    View All Users
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        User Roles
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Customers</span>
                        <span className="font-medium">{userStats.customers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Clients</span>
                        <span className="font-medium">{userStats.clients}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Admins</span>
                        <span className="font-medium">{userStats.admins}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="secondary" size="sm" className="w-full justify-start">
                        Create Admin User
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full justify-start">
                        Bulk User Import
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full justify-start">
                        Export User Data
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Permissions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="secondary" size="sm" className="w-full justify-start">
                        Role Permissions
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full justify-start">
                        Access Control
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full justify-start">
                        Audit Trail
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>
                  Platform-wide settings and configuration options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="secondary" className="w-full justify-start">
                        <Lock className="h-4 w-4 mr-2" />
                        Security Policies
                      </Button>
                      <Button variant="secondary" className="w-full justify-start">
                        <Shield className="h-4 w-4 mr-2" />
                        Rate Limiting
                      </Button>
                      <Button variant="secondary" className="w-full justify-start">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Incident Response
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">System Maintenance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="secondary" className="w-full justify-start">
                        <Database className="h-4 w-4 mr-2" />
                        Database Management
                      </Button>
                      <Button variant="secondary" className="w-full justify-start">
                        <Server className="h-4 w-4 mr-2" />
                        Server Configuration
                      </Button>
                      <Button variant="secondary" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Performance Monitoring
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}