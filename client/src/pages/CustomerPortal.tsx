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
  User, 
  Shield, 
  Settings, 
  Activity, 
  HelpCircle,
  QrCode,
  Share2,
  Eye,
  Download,
  Bell,
  Lock,
  Smartphone,
  Globe,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Plus,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { KpiTile, KpiGrid } from '@/components/ui/kpi-tiles';
import { StatusPill } from '@/components/ui/status-pills';
import { NumberDisplay } from '@/components/ui/number-display';
import { VeridityIcons } from '@/components/ui/veridity-icons';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  memberSince: string;
  verificationLevel: 'basic' | 'verified' | 'premium';
  language: 'en' | 'ne' | 'zh' | 'ko' | 'ja';
}

interface UserProof {
  id: string;
  type: string;
  status: 'active' | 'expired' | 'revoked';
  createdAt: string;
  expiresAt: string;
  sharedCount: number;
  verifications: number;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  ip?: string;
  location?: string;
}

export default function CustomerPortal() {
  const [notifications, setNotifications] = useState({
    proofExpiry: true,
    securityAlerts: true,
    sharingActivity: false,
    marketing: false
  });

  // Mock user profile
  const userProfile: UserProfile = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    memberSince: '2023-06-15T00:00:00Z',
    verificationLevel: 'verified',
    language: 'en'
  };

  // Mock user proofs
  const { data: userProofs } = useQuery({
    queryKey: ['/api/customer/proofs'],
    queryFn: () => Promise.resolve([
      {
        id: '1',
        type: 'age_verification',
        status: 'active',
        createdAt: '2024-01-10T00:00:00Z',
        expiresAt: '2024-07-10T00:00:00Z',
        sharedCount: 5,
        verifications: 12
      },
      {
        id: '2',
        type: 'citizenship',
        status: 'active',
        createdAt: '2023-12-15T00:00:00Z',
        expiresAt: '2024-12-15T00:00:00Z',
        sharedCount: 2,
        verifications: 8
      }
    ] as UserProof[])
  });

  // Mock activity log
  const activityLog: ActivityLog[] = [
    {
      id: '1',
      action: 'proof_generated',
      description: 'Generated age verification proof',
      timestamp: '2024-01-15T10:30:00Z',
      ip: '192.168.1.1',
      location: 'Kathmandu, Nepal'
    },
    {
      id: '2',
      action: 'proof_shared',
      description: 'Shared citizenship proof with Bank of Nepal',
      timestamp: '2024-01-14T15:45:00Z',
      ip: '192.168.1.1',
      location: 'Kathmandu, Nepal'
    }
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expired': return 'secondary';
      case 'revoked': return 'destructive';
      default: return 'outline';
    }
  };

  const getVerificationBadgeVariant = (level: string) => {
    switch (level) {
      case 'basic': return 'secondary';
      case 'verified': return 'default';
      case 'premium': return 'destructive';
      default: return 'outline';
    }
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const days = Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8" data-testid="customer-portal">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="customer-portal-title">My Identity</h1>
          <p className="text-muted-foreground" data-testid="customer-portal-subtitle">
            Welcome back, {userProfile.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getVerificationBadgeVariant(userProfile.verificationLevel)}>
            {userProfile.verificationLevel}
          </Badge>
          <Button variant="secondary" size="sm" data-testid="upgrade-verification">
            Upgrade
          </Button>
        </div>
      </div>

      {/* Customer KPI Dashboard - Brief Requirements */}
      <KpiGrid 
        columns={4}
        className="mb-8"
        tiles={[
          {
            label: "Active Proofs",
            value: userProofs?.filter(p => p.status === 'active').length || 0,
            formatType: "number",
            decimals: 0,
            trend: {
              value: 12.5,
              direction: "up",
              period: "this month"
            },
            sparklineData: [8, 12, 15, 18, 22, 25, 28],
            icon: <VeridityIcons.zkShield size={16} />,
          },
          {
            label: "Total Shares",
            value: userProofs?.reduce((sum, proof) => sum + proof.sharedCount, 0) || 7,
            formatType: "number", 
            decimals: 0,
            trend: {
              value: 18.3,
              direction: "up",
              period: "vs last week"
            },
            sparklineData: [5, 7, 6, 8, 12, 10, 14],
            icon: <Share2 className="h-4 w-4" />,
          },
          {
            label: "Success Rate",
            value: 94.7,
            formatType: "percentage",
            decimals: 1,
            trend: {
              value: 2.1,
              direction: "up", 
              period: "this month"
            },
            sparklineData: [92, 93, 91, 94, 95, 96, 94.7],
            icon: <CheckCircle className="h-4 w-4" />,
          },
          {
            label: "Privacy Score",
            value: 98.2,
            formatType: "percentage", 
            decimals: 1,
            trend: {
              value: 0.8,
              direction: "up",
              period: "improving"
            },
            sparklineData: [96, 97, 97.5, 98, 98.1, 98.0, 98.2],
            icon: <VeridityIcons.privacy size={16} />,
          }
        ]}
      />

      {/* Main Customer Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="proofs" data-testid="tab-proofs">My Proofs</TabsTrigger>
          <TabsTrigger value="privacy" data-testid="tab-privacy">Privacy</TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
          <TabsTrigger value="help" data-testid="tab-help">Help</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {userProfile.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{userProfile.name}</h3>
                    <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                    <Badge variant={getVerificationBadgeVariant(userProfile.verificationLevel)} className="mt-1">
                      {userProfile.verificationLevel} account
                    </Badge>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button className="w-full" data-testid="edit-profile">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Quick Actions - Brief Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Most common identity verification tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {/* Primary Actions */}
                  <div className="space-y-3 pb-3 border-b border-border-default">
                    <Button 
                      className="w-full justify-start h-12" 
                      variant="primary" 
                      size="lg"
                      data-testid="generate-new-proof"
                    >
                      <VeridityIcons.zkShield className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">Generate New Proof</div>
                        <div className="text-xs opacity-80">Create ZK proof for verification</div>
                      </div>
                    </Button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      className="h-16 flex-col gap-1" 
                      variant="secondary" 
                      data-testid="qr-verify-action"
                    >
                      <VeridityIcons.qrVerify size={20} />
                      <span className="text-xs">QR Verify</span>
                    </Button>
                    <Button 
                      className="h-16 flex-col gap-1" 
                      variant="secondary" 
                      data-testid="share-proof-action"
                    >
                      <Share2 className="h-5 w-5" />
                      <span className="text-xs">Share Proof</span>
                    </Button>
                  </div>

                  {/* Utility Actions */}
                  <div className="space-y-2 pt-2">
                    <Button 
                      className="w-full justify-start" 
                      variant="tertiary" 
                      data-testid="wallet-backup-action"
                    >
                      <VeridityIcons.walletBackup className="h-4 w-4 mr-2" />
                      Wallet Backup
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="tertiary" 
                      data-testid="audit-trail-action"
                    >
                      <VeridityIcons.auditTrail className="h-4 w-4 mr-2" />
                      View Activity Trail
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expiring Proofs Alert */}
          {userProofs?.some(proof => getDaysUntilExpiry(proof.expiresAt) <= 30) && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="h-5 w-5" />
                  Expiring Proofs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700 mb-4">
                  Some of your proofs are expiring soon. Renew them to maintain access.
                </p>
                <div className="space-y-2">
                  {userProofs
                    ?.filter(proof => getDaysUntilExpiry(proof.expiresAt) <= 30)
                    .map(proof => (
                      <div key={proof.id} className="flex justify-between items-center">
                        <span className="text-sm">{proof.type}</span>
                        <span className="text-sm font-medium text-orange-700">
                          {getDaysUntilExpiry(proof.expiresAt)} days
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* My Proofs Tab */}
        <TabsContent value="proofs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                My Digital Proofs
              </CardTitle>
              <CardDescription>
                Manage and share your verified identity proofs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userProofs?.map((proof: UserProof) => (
                  <div key={proof.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`proof-${proof.id}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium capitalize">{proof.type.replace('_', ' ')}</h4>
                        <Badge variant={getStatusBadgeVariant(proof.status)}>
                          {proof.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="block">Created:</span>
                          <span>{new Date(proof.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="block">Expires:</span>
                          <span>{new Date(proof.expiresAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="block">Shared:</span>
                          <span>{proof.sharedCount} times</span>
                        </div>
                        <div>
                          <span className="block">Verified:</span>
                          <span>{proof.verifications} times</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="secondary" size="sm" data-testid={`share-proof-${proof.id}`}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="sm" data-testid={`view-proof-${proof.id}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="sm" data-testid={`download-proof-${proof.id}`}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {(!userProofs || userProofs.length === 0) && (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Proofs Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Generate your first identity proof to get started
                    </p>
                    <Button data-testid="create-first-proof">
                      Create Your First Proof
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Controls Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Controls
              </CardTitle>
              <CardDescription>
                Control how your data is shared and used
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Data Sharing</h4>
                    <p className="text-sm text-muted-foreground">Allow sharing of anonymized usage data for platform improvement</p>
                  </div>
                  <Switch data-testid="toggle-data-sharing" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Analytics Tracking</h4>
                    <p className="text-sm text-muted-foreground">Help us improve by sharing usage analytics</p>
                  </div>
                  <Switch data-testid="toggle-analytics" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Profile Visibility</h4>
                    <p className="text-sm text-muted-foreground">Make your profile visible to organization partners</p>
                  </div>
                  <Switch data-testid="toggle-profile-visibility" />
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="font-medium mb-4">Data Export & Deletion</h4>
                <div className="flex gap-3">
                  <Button variant="secondary" data-testid="export-data">
                    <Download className="h-4 w-4 mr-2" />
                    Export My Data
                  </Button>
                  <Button variant="destructive" data-testid="delete-account">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="secondary" data-testid="setup-2fa">
                    Setup
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Biometric Authentication</h4>
                    <p className="text-sm text-muted-foreground">Use fingerprint or face recognition</p>
                  </div>
                  <Switch data-testid="toggle-biometric" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Session Timeout</h4>
                    <p className="text-sm text-muted-foreground">Automatically sign out after inactivity</p>
                  </div>
                  <select className="border rounded px-3 py-2" data-testid="session-timeout-select">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="0">Never</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="font-medium mb-4">Notification Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Proof expiry warnings</span>
                    <Switch 
                      checked={notifications.proofExpiry}
                      onCheckedChange={(checked) => setNotifications(prev => ({...prev, proofExpiry: checked}))}
                      data-testid="notification-expiry"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Security alerts</span>
                    <Switch 
                      checked={notifications.securityAlerts}
                      onCheckedChange={(checked) => setNotifications(prev => ({...prev, securityAlerts: checked}))}
                      data-testid="notification-security"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sharing activity</span>
                    <Switch 
                      checked={notifications.sharingActivity}
                      onCheckedChange={(checked) => setNotifications(prev => ({...prev, sharingActivity: checked}))}
                      data-testid="notification-sharing"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Marketing emails</span>
                    <Switch 
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications(prev => ({...prev, marketing: checked}))}
                      data-testid="notification-marketing"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Log
              </CardTitle>
              <CardDescription>
                View your recent account activity and login history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityLog.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`activity-${activity.id}`}>
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.description}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{new Date(activity.timestamp).toLocaleString()}</span>
                        {activity.ip && <span>IP: {activity.ip}</span>}
                        {activity.location && <span>{activity.location}</span>}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      {activity.action.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Help & Support Tab */}
        <TabsContent value="help" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Help & Support
              </CardTitle>
              <CardDescription>
                Get help and find answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="secondary" data-testid="view-faq">
                <HelpCircle className="h-4 w-4 mr-2" />
                Frequently Asked Questions
              </Button>
              <Button className="w-full justify-start" variant="secondary" data-testid="contact-support">
                <Smartphone className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button className="w-full justify-start" variant="secondary" data-testid="video-tutorials">
                <Globe className="h-4 w-4 mr-2" />
                Video Tutorials
              </Button>
              <Button className="w-full justify-start" variant="secondary" data-testid="report-issue">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report an Issue
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}