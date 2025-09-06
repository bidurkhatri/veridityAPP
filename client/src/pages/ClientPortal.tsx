import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Building, 
  Users, 
  Settings, 
  Activity, 
  CreditCard,
  Key,
  BarChart3,
  Shield,
  Webhook,
  Download,
  Upload,
  Globe,
  Palette,
  FileText,
  BookOpen,
  HelpCircle,
  Bell,
  Filter,
  Search,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Code,
  Zap
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  industry: string;
  plan: 'basic' | 'professional' | 'enterprise';
  members: number;
  verifications: number;
  successRate: number;
  monthlyUsage: number;
  usageLimit: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  status: 'active' | 'invited' | 'suspended';
  lastActive: string;
  permissions: string[];
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  environment: 'sandbox' | 'production';
  permissions: string[];
  lastUsed: string;
  status: 'active' | 'revoked';
}

export default function ClientPortal() {
  const [teamSearchTerm, setTeamSearchTerm] = useState('');
  const [apiKeyFilter, setApiKeyFilter] = useState('all');

  // Mock organization data
  const organization: Organization = {
    id: 'org-1',
    name: 'TechCorp Solutions',
    industry: 'Financial Technology',
    plan: 'professional',
    members: 15,
    verifications: 12547,
    successRate: 98.7,
    monthlyUsage: 8750,
    usageLimit: 10000
  };

  // Mock team members
  const { data: teamMembers } = useQuery({
    queryKey: ['/api/client/team'],
    queryFn: () => Promise.resolve([
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@techcorp.com',
        role: 'owner',
        status: 'active',
        lastActive: '2024-01-15T14:30:00Z',
        permissions: ['admin', 'billing', 'api_access', 'team_management']
      },
      {
        id: '2',
        name: 'Mike Chen',
        email: 'mike@techcorp.com',
        role: 'developer',
        status: 'active',
        lastActive: '2024-01-15T10:15:00Z',
        permissions: ['api_access', 'webhook_config']
      },
      {
        id: '3',
        name: 'Alex Rodriguez',
        email: 'alex@techcorp.com',
        role: 'admin',
        status: 'invited',
        lastActive: '2024-01-10T16:45:00Z',
        permissions: ['team_management', 'analytics']
      }
    ] as TeamMember[])
  });

  // Mock API Keys
  const { data: apiKeys } = useQuery({
    queryKey: ['/api/client/api-keys'],
    queryFn: () => Promise.resolve([
      {
        id: '1',
        name: 'Production API Key',
        key: 'vk_live_abcd1234...',
        environment: 'production',
        permissions: ['proof_generation', 'verification'],
        lastUsed: '2024-01-15T12:00:00Z',
        status: 'active'
      },
      {
        id: '2',
        name: 'Development Key',
        key: 'vk_test_efgh5678...',
        environment: 'sandbox',
        permissions: ['proof_generation', 'verification', 'webhook_test'],
        lastUsed: '2024-01-14T18:30:00Z',
        status: 'active'
      }
    ] as APIKey[])
  });

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'basic': return 'secondary';
      case 'professional': return 'default';
      case 'enterprise': return 'destructive';
      default: return 'outline';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'destructive';
      case 'admin': return 'default';
      case 'developer': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'invited': return 'secondary';
      case 'suspended': return 'destructive';
      case 'revoked': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredTeamMembers = teamMembers?.filter((member: TeamMember) => {
    return member.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
           member.email.toLowerCase().includes(teamSearchTerm.toLowerCase());
  });

  const filteredApiKeys = apiKeys?.filter((key: APIKey) => {
    return apiKeyFilter === 'all' || key.environment === apiKeyFilter;
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8" data-testid="client-portal">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="client-portal-title">Organization Dashboard</h1>
          <p className="text-muted-foreground" data-testid="client-portal-subtitle">
            {organization.name} • {organization.industry}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getPlanBadgeVariant(organization.plan)}>
            {organization.plan} plan
          </Badge>
          <Button variant="outline" size="sm" data-testid="upgrade-plan">
            Upgrade Plan
          </Button>
        </div>
      </div>

      {/* Organization Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="stat-team-members">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.members}</div>
            <p className="text-xs text-muted-foreground">active users</p>
          </CardContent>
        </Card>

        <Card data-testid="stat-verifications">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verifications</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.verifications.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>

        <Card data-testid="stat-success-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.successRate}%</div>
            <p className="text-xs text-muted-foreground">verification success</p>
          </CardContent>
        </Card>

        <Card data-testid="stat-usage">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Usage</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.monthlyUsage.toLocaleString()}</div>
            <Progress value={(organization.monthlyUsage / organization.usageLimit) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              of {organization.usageLimit.toLocaleString()} monthly limit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Client Portal Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="team" data-testid="tab-team">Team</TabsTrigger>
          <TabsTrigger value="integration" data-testid="tab-integration">Integration</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          <TabsTrigger value="billing" data-testid="tab-billing">Billing</TabsTrigger>
          <TabsTrigger value="branding" data-testid="tab-branding">Branding</TabsTrigger>
          <TabsTrigger value="compliance" data-testid="tab-compliance">Compliance</TabsTrigger>
          <TabsTrigger value="support" data-testid="tab-support">Support</TabsTrigger>
        </TabsList>

        {/* Organization Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Organization Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
                    {organization.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{organization.name}</h3>
                    <p className="text-sm text-muted-foreground">{organization.industry}</p>
                    <Badge variant={getPlanBadgeVariant(organization.plan)} className="mt-1">
                      {organization.plan} plan
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm">Team Members</span>
                    <span className="font-medium">{organization.members}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Monthly Verifications</span>
                    <span className="font-medium">{organization.verifications.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-medium text-success-text">{organization.successRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" data-testid="generate-api-key">
                  <Key className="h-4 w-4 mr-2" />
                  Generate API Key
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="configure-webhook">
                  <Webhook className="h-4 w-4 mr-2" />
                  Configure Webhooks
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="download-sdk">
                  <Download className="h-4 w-4 mr-2" />
                  Download SDK
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="view-documentation">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Documentation
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">API key generated</p>
                    <p className="text-sm text-muted-foreground">Production environment • 2 hours ago</p>
                  </div>
                  <Badge variant="default">Security</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Team member invited</p>
                    <p className="text-sm text-muted-foreground">alex@techcorp.com • 1 day ago</p>
                  </div>
                  <Badge variant="secondary">Team</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Billing updated</p>
                    <p className="text-sm text-muted-foreground">Plan upgraded to Professional • 3 days ago</p>
                  </div>
                  <Badge variant="outline">Billing</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Management Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Management
              </CardTitle>
              <CardDescription>
                Manage team members, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search team members..."
                      value={teamSearchTerm}
                      onChange={(e) => setTeamSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="team-search-input"
                    />
                  </div>
                </div>
                <Button data-testid="invite-member">
                  <Users className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </div>

              <div className="space-y-3">
                {filteredTeamMembers?.map((member: TeamMember) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`team-member-${member.id}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium">{member.name}</h4>
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(member.status)}>
                          {member.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Last active: {new Date(member.lastActive).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" data-testid={`edit-member-${member.id}`}>
                        Edit
                      </Button>
                      {member.status === 'active' ? (
                        <Button variant="destructive" size="sm" data-testid={`suspend-member-${member.id}`}>
                          Suspend
                        </Button>
                      ) : (
                        <Button variant="secondary" size="sm" data-testid={`activate-member-${member.id}`}>
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

        {/* Integration Hub Tab */}
        <TabsContent value="integration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  Manage your API keys and access tokens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                      value={apiKeyFilter}
                      onChange={(e) => setApiKeyFilter(e.target.value)}
                      className="border rounded px-3 py-2"
                      data-testid="api-key-filter"
                    >
                      <option value="all">All Environments</option>
                      <option value="production">Production</option>
                      <option value="sandbox">Sandbox</option>
                    </select>
                  </div>
                  <Button data-testid="create-api-key">
                    <Key className="h-4 w-4 mr-2" />
                    Create API Key
                  </Button>
                </div>

                <div className="space-y-3">
                  {filteredApiKeys?.map((apiKey: APIKey) => (
                    <div key={apiKey.id} className="p-4 border rounded-lg" data-testid={`api-key-${apiKey.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <div className="flex gap-2">
                          <Badge variant={apiKey.environment === 'production' ? 'destructive' : 'secondary'}>
                            {apiKey.environment}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(apiKey.status)}>
                            {apiKey.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded">{apiKey.key}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" data-testid={`copy-key-${apiKey.id}`}>
                          Copy Key
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`edit-key-${apiKey.id}`}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" data-testid={`revoke-key-${apiKey.id}`}>
                          Revoke
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  SDK & Tools
                </CardTitle>
                <CardDescription>
                  Download SDKs and integration tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" data-testid="download-js-sdk">
                    <Download className="h-4 w-4 mr-2" />
                    JavaScript SDK
                  </Button>
                  <Button className="w-full justify-start" variant="outline" data-testid="download-python-sdk">
                    <Download className="h-4 w-4 mr-2" />
                    Python SDK
                  </Button>
                  <Button className="w-full justify-start" variant="outline" data-testid="download-java-sdk">
                    <Download className="h-4 w-4 mr-2" />
                    Java SDK
                  </Button>
                  <Button className="w-full justify-start" variant="outline" data-testid="download-php-sdk">
                    <Download className="h-4 w-4 mr-2" />
                    PHP SDK
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Configuration
              </CardTitle>
              <CardDescription>
                Configure webhooks for real-time event notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Verification Events</h4>
                    <p className="text-sm text-muted-foreground">https://api.techcorp.com/webhooks/verify</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="default">Active</Badge>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Fraud Alerts</h4>
                    <p className="text-sm text-muted-foreground">https://api.techcorp.com/webhooks/fraud</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Inactive</Badge>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
                <Button data-testid="add-webhook">
                  <Webhook className="h-4 w-4 mr-2" />
                  Add Webhook
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Verification Analytics
              </CardTitle>
              <CardDescription>
                Track verification success rates and fraud detection statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">98.7%</div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">1.3%</div>
                  <p className="text-sm text-muted-foreground">Fraud Detected</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">245ms</div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Age Verification</span>
                  <div className="flex items-center gap-2">
                    <Progress value={95} className="w-32" />
                    <span className="text-sm font-medium">95%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Document Verification</span>
                  <div className="flex items-center gap-2">
                    <Progress value={87} className="w-32" />
                    <span className="text-sm font-medium">87%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Biometric Verification</span>
                  <div className="flex items-center gap-2">
                    <Progress value={92} className="w-32" />
                    <span className="text-sm font-medium">92%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing & Usage Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing & Usage
              </CardTitle>
              <CardDescription>
                Manage your subscription, invoices, and usage limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Current Plan</h4>
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Professional Plan</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-2xl font-bold">$299/month</p>
                    <p className="text-sm text-muted-foreground">Up to 10,000 verifications</p>
                    <Button className="w-full mt-4" data-testid="upgrade-plan-billing">
                      Upgrade to Enterprise
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Usage This Month</h4>
                  <div className="p-4 border rounded-lg">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Verifications Used</span>
                        <span className="font-medium">{organization.monthlyUsage.toLocaleString()}</span>
                      </div>
                      <Progress value={(organization.monthlyUsage / organization.usageLimit) * 100} />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>0</span>
                        <span>{organization.usageLimit.toLocaleString()} limit</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Recent Invoices</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">January 2024</p>
                      <p className="text-sm text-muted-foreground">Professional Plan</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$299.00</p>
                      <p className="text-sm text-green-600">Paid</p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="download-invoice-jan">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">December 2023</p>
                      <p className="text-sm text-muted-foreground">Professional Plan</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$299.00</p>
                      <p className="text-sm text-green-600">Paid</p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="download-invoice-dec">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Custom Branding
              </CardTitle>
              <CardDescription>
                Customize the verification experience with your brand
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Logo Upload</h4>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload your logo (PNG, JPG, SVG)
                    </p>
                    <Button variant="outline" className="mt-2" data-testid="upload-logo">
                      Upload Logo
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Brand Colors</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Primary Color</label>
                      <div className="flex gap-2 mt-1">
                        <input type="color" value="#2563eb" className="w-12 h-8 rounded border" />
                        <Input value="#2563eb" className="flex-1" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Secondary Color</label>
                      <div className="flex gap-2 mt-1">
                        <input type="color" value="#7c3aed" className="w-12 h-8 rounded border" />
                        <Input value="#7c3aed" className="flex-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">White-Label Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Hide Veridity Branding</p>
                      <p className="text-sm text-muted-foreground">Remove Veridity logos from verification flow</p>
                    </div>
                    <Switch data-testid="toggle-hide-branding" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Custom Domain</p>
                      <p className="text-sm text-muted-foreground">Use your own domain for verification pages</p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="configure-domain">
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tools Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance Tools
              </CardTitle>
              <CardDescription>
                Audit reports, data retention settings, and privacy controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Audit Reports</h4>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline" data-testid="download-audit-report">
                      <FileText className="h-4 w-4 mr-2" />
                      Download Latest Audit Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline" data-testid="download-compliance-cert">
                      <Shield className="h-4 w-4 mr-2" />
                      Download Compliance Certificate
                    </Button>
                    <Button className="w-full justify-start" variant="outline" data-testid="schedule-audit">
                      <Activity className="h-4 w-4 mr-2" />
                      Schedule Security Audit
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Data Retention</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Verification Data Retention</label>
                      <select className="w-full border rounded px-3 py-2 mt-1" data-testid="retention-period">
                        <option value="30">30 days</option>
                        <option value="90">90 days</option>
                        <option value="180">180 days</option>
                        <option value="365">1 year</option>
                        <option value="custom">Custom period</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-delete expired data</p>
                        <p className="text-sm text-muted-foreground">Automatically delete data after retention period</p>
                      </div>
                      <Switch defaultChecked data-testid="toggle-auto-delete" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Privacy Controls</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">GDPR Compliance Mode</p>
                      <p className="text-sm text-muted-foreground">Enable GDPR-compliant data processing</p>
                    </div>
                    <Switch defaultChecked data-testid="toggle-gdpr" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Data Processing Agreements</p>
                      <p className="text-sm text-muted-foreground">Automatic DPA generation for clients</p>
                    </div>
                    <Switch defaultChecked data-testid="toggle-dpa" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Consent Management</p>
                      <p className="text-sm text-muted-foreground">Track and manage user consent</p>
                    </div>
                    <Switch defaultChecked data-testid="toggle-consent" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Center Tab */}
        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Support Center
              </CardTitle>
              <CardDescription>
                Technical support, documentation, and training resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Documentation</h4>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline" data-testid="api-documentation">
                      <BookOpen className="h-4 w-4 mr-2" />
                      API Documentation
                    </Button>
                    <Button className="w-full justify-start" variant="outline" data-testid="integration-guides">
                      <Code className="h-4 w-4 mr-2" />
                      Integration Guides
                    </Button>
                    <Button className="w-full justify-start" variant="outline" data-testid="sdk-reference">
                      <FileText className="h-4 w-4 mr-2" />
                      SDK Reference
                    </Button>
                    <Button className="w-full justify-start" variant="outline" data-testid="best-practices">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Best Practices Guide
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Support</h4>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline" data-testid="contact-support">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Contact Technical Support
                    </Button>
                    <Button className="w-full justify-start" variant="outline" data-testid="submit-ticket">
                      <FileText className="h-4 w-4 mr-2" />
                      Submit Support Ticket
                    </Button>
                    <Button className="w-full justify-start" variant="outline" data-testid="schedule-training">
                      <Users className="h-4 w-4 mr-2" />
                      Schedule Team Training
                    </Button>
                    <Button className="w-full justify-start" variant="outline" data-testid="system-status">
                      <Activity className="h-4 w-4 mr-2" />
                      System Status Page
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Training Resources</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h5 className="font-medium mb-2">Getting Started</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      Learn the basics of Veridity integration
                    </p>
                    <Button size="sm" variant="outline" data-testid="getting-started-training">
                      Start Training
                    </Button>
                  </Card>
                  <Card className="p-4">
                    <h5 className="font-medium mb-2">Advanced Features</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      Master advanced verification techniques
                    </p>
                    <Button size="sm" variant="outline" data-testid="advanced-training">
                      Start Training
                    </Button>
                  </Card>
                  <Card className="p-4">
                    <h5 className="font-medium mb-2">Security Best Practices</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      Implement security best practices
                    </p>
                    <Button size="sm" variant="outline" data-testid="security-training">
                      Start Training
                    </Button>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}