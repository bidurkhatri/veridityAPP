import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatPercentage, formatUptime, formatNumber, formatResponseTime } from '@/lib/format';
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
  RefreshCw,
  Lock,
  Eye,
  FileCheck,
  BarChart3,
  HelpCircle,
  MessageCircle,
  Book,
  Edit
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

  // Fetch real system health data
  const { data: systemHealth } = useQuery<SystemHealth>({
    queryKey: ['/api/admin/health'],
    select: (data: any) => ({
      cpu: data.cpu?.usage || 0,
      memory: data.memory?.percentage || 0,
      disk: data.disk?.percentage || 0,
      uptime: formatUptime(data.uptime || 0),
      activeUsers: data.metrics?.requests || 0,
      totalRequests: data.metrics?.totalRequests || 0
    })
  });

  // Fetch real users data
  const { data: usersResponse } = useQuery<{users: User[], total: number}>({
    queryKey: ['/api/admin/users', userSearchTerm, userStatusFilter],
    queryFn: async () => {
      const response = await fetch('/api/admin/users?limit=50&offset=0');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  const users = usersResponse?.users || [];

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
            <Cpu className="h-4 w-4 text-text-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(systemHealth?.cpu)}</div>
            <Progress value={systemHealth?.cpu || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card data-testid="health-memory">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Database className="h-4 w-4 text-text-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(systemHealth?.memory)}</div>
            <Progress value={systemHealth?.memory || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card data-testid="health-disk">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-text-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(systemHealth?.disk)}</div>
            <Progress value={systemHealth?.disk || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card data-testid="health-uptime">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-success-text" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{systemHealth?.uptime}</div>
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
                  <span className="font-bold">{formatNumber(systemHealth?.activeUsers)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Requests (24h)</span>
                  <span className="font-bold">{formatNumber(systemHealth?.totalRequests)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Success Rate</span>
                  <span className="font-bold text-green-600">99.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Avg Response Time</span>
                  <span className="font-bold">{formatResponseTime(245)}</span>
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
                        <Button variant="outline" size="sm" data-testid={`activate-user-${user.id}`}>
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
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-600">System Status</p>
                    <p className="text-2xl font-bold">Secure</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Failed Login Attempts</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Blocked IPs</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Security Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Suspicious Login Activity</p>
                      <p className="text-xs text-muted-foreground">IP: 192.168.1.100</p>
                    </div>
                    <Badge variant="destructive">High</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Multiple Failed Attempts</p>
                      <p className="text-xs text-muted-foreground">User: admin@veridity.com</p>
                    </div>
                    <Badge variant="secondary">Medium</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">API Rate Limit Exceeded</p>
                      <p className="text-xs text-muted-foreground">Organization: Demo Corp</p>
                    </div>
                    <Badge variant="outline">Low</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Enforce 2FA for all admin accounts</p>
                  </div>
                  <Switch defaultChecked data-testid="toggle-2fa" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">IP Allowlist</h4>
                    <p className="text-sm text-muted-foreground">Restrict access to approved IP addresses</p>
                  </div>
                  <Switch data-testid="toggle-ip-allowlist" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Session Timeout</h4>
                    <p className="text-sm text-muted-foreground">Auto-logout after 30 minutes of inactivity</p>
                  </div>
                  <Switch defaultChecked data-testid="toggle-session-timeout" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Monitoring & Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Real-time Monitoring</h4>
                    <p className="text-sm text-muted-foreground">Monitor all system activities in real-time</p>
                  </div>
                  <Switch defaultChecked data-testid="toggle-monitoring" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Alerts</h4>
                    <p className="text-sm text-muted-foreground">Send alerts for security incidents</p>
                  </div>
                  <Switch defaultChecked data-testid="toggle-email-alerts" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Audit Logging</h4>
                    <p className="text-sm text-muted-foreground">Log all administrative actions</p>
                  </div>
                  <Switch defaultChecked data-testid="toggle-audit-logging" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Daily Active Users</span>
                    <span className="font-semibold">2,847</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Weekly Active Users</span>
                    <span className="font-semibold">12,456</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '84%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Active Users</span>
                    <span className="font-semibold">45,123</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Proof Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">15,632</p>
                    <p className="text-xs text-muted-foreground">Total Proofs</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600">14,891</p>
                    <p className="text-xs text-muted-foreground">Verified</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-yellow-600">456</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-red-600">285</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Success Rate</span>
                    <span className="font-semibold text-green-600">95.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Response Time</span>
                    <span className="font-semibold">127ms</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">API Uptime</span>
                    <span className="font-semibold text-green-600">99.9%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Peak RPS</span>
                    <span className="font-semibold">1,245</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Error Rate</span>
                    <span className="font-semibold text-red-600">0.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Usage Trends (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 30 }, (_, i) => (
                      <div key={i} className="space-y-1">
                        <div className="h-20 bg-secondary rounded flex items-end">
                          <div 
                            className="w-full bg-primary rounded-b"
                            style={{ height: `${Math.random() * 80 + 20}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-center text-muted-foreground">
                          {30 - i}d
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Peak Day</p>
                      <p className="font-semibold">3,456 proofs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Avg Daily</p>
                      <p className="font-semibold">2,134 proofs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Growth Rate</p>
                      <p className="font-semibold text-green-600">+12.3%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Trend</p>
                      <p className="font-semibold text-green-600">↗ Growing</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Support Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Open Tickets</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold">2.3h</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Payment Integration Issue</p>
                      <p className="text-xs text-muted-foreground">Ticket #2024-001</p>
                    </div>
                    <Badge variant="destructive">High</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">API Documentation Query</p>
                      <p className="text-xs text-muted-foreground">Ticket #2024-002</p>
                    </div>
                    <Badge variant="secondary">Medium</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Sessions</span>
                    <span className="font-semibold">7</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Queue Length</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Agents Online</span>
                    <span className="font-semibold text-green-600">4/5</span>
                  </div>
                </div>
                
                <Button className="w-full" data-testid="btn-open-chat">
                  Open Chat Console
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Knowledge Base
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Articles</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Monthly Views</p>
                    <p className="text-2xl font-bold">12.3k</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" data-testid="btn-manage-kb">
                    <Edit className="h-4 w-4 mr-2" />
                    Manage Articles
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="btn-view-analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Support Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-assign Tickets</h4>
                    <p className="text-sm text-muted-foreground">Automatically assign new tickets to available agents</p>
                  </div>
                  <Switch defaultChecked data-testid="toggle-auto-assign" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Send email alerts for new tickets</p>
                  </div>
                  <Switch defaultChecked data-testid="toggle-email-notifications" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Business Hours Only</h4>
                    <p className="text-sm text-muted-foreground">Limit support to business hours (9 AM - 6 PM)</p>
                  </div>
                  <Switch data-testid="toggle-business-hours" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}