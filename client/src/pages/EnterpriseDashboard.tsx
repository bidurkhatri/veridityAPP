import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp,
  Activity,
  Lock,
  Eye,
  BarChart3
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface MultiSigRequirement {
  id: string;
  proofTypeId: string;
  requiredSignatures: number;
  authorizedEntities: number;
  threshold: number;
  createdAt: string;
}

interface FraudAlert {
  id: string;
  type: 'suspicious_pattern' | 'velocity_limit' | 'duplicate_proof' | 'blacklist_match' | 'anomaly_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  resolved: boolean;
}

interface FraudStats {
  totalAlerts: number;
  criticalAlerts: number;
  blacklistedUsers: number;
  highRiskUsers: number;
}

export default function EnterpriseDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Fetch multi-sig requirements
  const { data: multiSigRequirements, isLoading: loadingMultiSig } = useQuery({
    queryKey: ['/api/multisig/requirements'],
    enabled: true
  });

  // Fetch fraud alerts
  const { data: fraudAlerts, isLoading: loadingAlerts } = useQuery({
    queryKey: ['/api/fraud/alerts'],
    enabled: true
  });

  // Fetch fraud statistics
  const { data: fraudStats, isLoading: loadingStats } = useQuery({
    queryKey: ['/api/fraud/statistics'],
    enabled: true
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8" data-testid="enterprise-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="dashboard-title">Enterprise Security Dashboard</h1>
          <p className="text-muted-foreground" data-testid="dashboard-subtitle">
            Multi-signature verification and fraud detection overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelectedTimeRange('1h')}>
            1H
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedTimeRange('24h')}>
            24H
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedTimeRange('7d')}>
            7D
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedTimeRange('30d')}>
            30D
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="metric-multisig">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Multi-Sig Requirements</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{multiSigRequirements?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active configurations</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-fraud-alerts">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{fraudStats?.totalAlerts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {fraudStats?.criticalAlerts || 0} critical
            </p>
          </CardContent>
        </Card>

        <Card data-testid="metric-risk-users">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Users</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{fraudStats?.highRiskUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-blacklisted">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blacklisted Users</CardTitle>
            <Lock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{fraudStats?.blacklistedUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Blocked accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="multisig" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="multisig" data-testid="tab-multisig">Multi-Signature</TabsTrigger>
          <TabsTrigger value="fraud" data-testid="tab-fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Multi-Signature Tab */}
        <TabsContent value="multisig" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Multi-Signature Requirements
              </CardTitle>
              <CardDescription>
                Configure proof types that require multiple signatures for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMultiSig ? (
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {multiSigRequirements?.map((req: MultiSigRequirement) => (
                    <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`multisig-requirement-${req.id}`}>
                      <div>
                        <h4 className="font-medium">{req.proofTypeId}</h4>
                        <p className="text-sm text-muted-foreground">
                          Requires {req.requiredSignatures} signatures from {req.authorizedEntities} entities
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{req.threshold} threshold</Badge>
                        <Button variant="outline" size="sm" data-testid={`edit-requirement-${req.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!multiSigRequirements || multiSigRequirements.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No multi-signature requirements configured
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fraud Detection Tab */}
        <TabsContent value="fraud" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Recent Fraud Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAlerts ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {fraudAlerts?.slice(0, 10).map((alert: FraudAlert) => (
                      <Alert key={alert.id} data-testid={`fraud-alert-${alert.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(alert.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <AlertDescription className="text-sm">
                              {alert.description}
                            </AlertDescription>
                          </div>
                          {!alert.resolved && (
                            <Button variant="outline" size="sm" data-testid={`resolve-alert-${alert.id}`}>
                              Resolve
                            </Button>
                          )}
                        </div>
                      </Alert>
                    ))}
                    {(!fraudAlerts || fraudAlerts.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        No fraud alerts detected
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>System Security Level</span>
                    <span className="font-medium">High</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fraud Detection Rate</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Authentication Success</span>
                    <span className="font-medium">98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>

                <div className="pt-4 border-t">
                  <Button className="w-full" data-testid="view-detailed-analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Detailed Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Verification Trends</CardTitle>
                <CardDescription>Success rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <LineChart
                    width={500}
                    height={250}
                    data={[
                      { name: 'Mon', success: 94, failed: 6 },
                      { name: 'Tue', success: 97, failed: 3 },
                      { name: 'Wed', success: 89, failed: 11 },
                      { name: 'Thu', success: 95, failed: 5 },
                      { name: 'Fri', success: 92, failed: 8 },
                      { name: 'Sat', success: 98, failed: 2 },
                      { name: 'Sun', success: 96, failed: 4 }
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="success" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Success Rate (%)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="failed" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Failed Rate (%)"
                    />
                  </LineChart>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Events</CardTitle>
                <CardDescription>Real-time monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">System Healthy</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2 min ago</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Rate Limit Warning</span>
                    </div>
                    <span className="text-xs text-muted-foreground">15 min ago</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">High Traffic Period</span>
                    </div>
                    <span className="text-xs text-muted-foreground">1 hour ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}