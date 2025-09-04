import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Users, 
  Settings, 
  Activity, 
  TrendingUp,
  Database,
  AlertTriangle,
  CheckCircle,
  Server,
  Cpu,
  HardDrive,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  activeUsers: number;
  totalRequests: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'suspended' | 'pending';
  lastLogin: string;
  totalProofs: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export default function AdminPortal() {
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // Mock system health data
  const systemHealth: SystemHealth = {
    cpu: 68,
    memory: 74,
    disk: 45,
    uptime: '15 days, 8 hours',
    activeUsers: 1247,
    totalRequests: 45231
  };

  // Mock users data
  const { data: users } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: () => Promise.resolve([
      {
        id: '1',
        email: 'user1@example.com',
        name: 'John Doe',
        status: 'active',
        lastLogin: '2024-01-15T10:30:00Z',
        totalProofs: 15,
        riskLevel: 'low'
      },
      {
        id: '2',
        email: 'user2@example.com',
        name: 'Jane Smith',
        status: 'suspended',
        lastLogin: '2024-01-14T15:45:00Z',
        totalProofs: 3,
        riskLevel: 'high'
      }
    ] as User[])
  });

  const filteredUsers = users?.filter((user: User) => {
    const matchesSearch = user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'suspended': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8" data-testid="admin-portal">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="admin-portal-title">Admin Portal</h1>
          <p className="text-muted-foreground" data-testid="admin-portal-subtitle">
            System administration and platform management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" data-testid="refresh-data">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" data-testid="export-data">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="health-cpu">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.cpu}%</div>
            <Progress value={systemHealth.cpu} className="mt-2" />
          </CardContent>
        </Card>

        <Card data-testid="health-memory">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.memory}%</div>
            <Progress value={systemHealth.memory} className="mt-2" />
          </CardContent>
        </Card>

        <Card data-testid="health-disk">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.disk}%</div>
            <Progress value={systemHealth.disk} className="mt-2" />
          </CardContent>
        </Card>

        <Card data-testid="health-uptime">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{systemHealth.uptime}</div>
            <p className="text-xs text-muted-foreground">99.9% availability</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
          <TabsTrigger value="system" data-testid="tab-system">System</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          <TabsTrigger value="support" data-testid="tab-support">Support</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Platform Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Active Users</span>
                  <span className="font-bold">{systemHealth.activeUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Requests (24h)</span>
                  <span className="font-bold">{systemHealth.totalRequests.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Success Rate</span>
                  <span className="font-bold text-green-600">99.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Avg Response Time</span>
                  <span className="font-bold">245ms</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">All systems operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">High memory usage detected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Search, filter, and manage platform users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by email or name..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="user-search-input"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="border rounded px-3 py-2"
                    data-testid="user-status-filter"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredUsers?.map((user: User) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`user-row-${user.id}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium">{user.name}</h4>
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                          {user.status}
                        </Badge>
                        <Badge variant={getRiskBadgeVariant(user.riskLevel)}>
                          {user.riskLevel} risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Last login: {new Date(user.lastLogin).toLocaleDateString()} • 
                        {user.totalProofs} proofs generated
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" data-testid={`view-user-${user.id}`}>
                        View
                      </Button>
                      <Button variant="outline" size="sm" data-testid={`edit-user-${user.id}`}>
                        Edit
                      </Button>
                      {user.status === 'active' ? (
                        <Button variant="destructive" size="sm" data-testid={`suspend-user-${user.id}`}>
                          Suspend
                        </Button>
                      ) : (
                        <Button variant="default" size="sm" data-testid={`activate-user-${user.id}`}>
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Configuration Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>
                Platform settings and feature flags
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Multi-Signature Verification</h4>
                    <p className="text-sm text-muted-foreground">Require multiple signatures for high-value proofs</p>
                  </div>
                  <Switch defaultChecked data-testid="toggle-multisig" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">AI Fraud Detection</h4>
                    <p className="text-sm text-muted-foreground">Enable machine learning fraud detection</p>
                  </div>
                  <Switch defaultChecked data-testid="toggle-fraud-detection" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Blockchain Storage</h4>
                    <p className="text-sm text-muted-foreground">Store proof hashes on blockchain for immutability</p>
                  </div>
                  <Switch data-testid="toggle-blockchain" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Voice Navigation</h4>
                    <p className="text-sm text-muted-foreground">Enable voice commands and navigation</p>
                  </div>
                  <Switch defaultChecked data-testid="toggle-voice-nav" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Maintenance Mode</h4>
                    <p className="text-sm text-muted-foreground">Put platform in maintenance mode</p>
                  </div>
                  <Switch data-testid="toggle-maintenance" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Security monitoring and incident management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Platform Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Advanced analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Support Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Customer support and ticketing system coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}