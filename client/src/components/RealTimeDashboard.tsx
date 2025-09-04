import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Users, 
  Shield, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Cpu,
  Globe,
  Lock
} from 'lucide-react';

interface SystemMetrics {
  uptime: number;
  memoryUsage: { rss: number; heapTotal: number; heapUsed: number; external: number };
  cpuUsage: number;
  requestCount: number;
  errorCount: number;
  responseTime: { min: number; max: number; avg: number };
  activeConnections: number;
  dbConnections: { active: number; idle: number; total: number };
  cacheStats: { hits: number; misses: number; hitRate: number };
}

interface SecurityMetrics {
  requestsBlocked: number;
  suspiciousActivity: number;
  deviceFingerprints: number;
  ipAddressesTracked: number;
}

export default function RealTimeDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [security, setSecurity] = useState<SecurityMetrics | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate real-time data fetching
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data.metrics);
          setSecurity(data.security);
          setAlerts(data.alerts || []);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        setIsConnected(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading real-time metrics...</p>
        </div>
      </div>
    );
  }

  const formatUptime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const memoryUsagePercent = (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100;
  const errorRate = (metrics.errorCount / Math.max(metrics.requestCount, 1)) * 100;

  return (
    <div className="space-y-6" data-testid="realtime-dashboard">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Real-Time Dashboard</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} className={`border-l-4 ${
              alert.level === 'critical' ? 'border-l-red-500 bg-red-50' :
              alert.level === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
              'border-l-blue-500 bg-blue-50'
            }`}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.message}</strong>
                {alert.details && (
                  <ul className="mt-1 text-sm">
                    {alert.details.map((detail: string, i: number) => (
                      <li key={i}>• {detail}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUptime(metrics.uptime)}</div>
            <p className="text-xs text-muted-foreground">
              Since last restart
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(memoryUsagePercent)}%</div>
            <Progress value={memoryUsagePercent} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.memoryUsage.heapUsed}MB / {metrics.memoryUsage.heapTotal}MB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpuUsage}%</div>
            <Progress value={metrics.cpuUsage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeConnections}</div>
            <p className="text-xs text-muted-foreground">
              Real-time connections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Request Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Requests</span>
              <span className="text-2xl font-bold">{metrics.requestCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Error Rate</span>
              <Badge variant={errorRate > 5 ? 'destructive' : errorRate > 1 ? 'secondary' : 'default'}>
                {errorRate.toFixed(2)}%
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Avg Response Time</span>
                <span>{metrics.responseTime.avg}ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Min Response Time</span>
                <span>{metrics.responseTime.min}ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Max Response Time</span>
                <span>{metrics.responseTime.max}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Connections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Active</span>
              <span className="text-xl font-bold text-green-600">{metrics.dbConnections.active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Idle</span>
              <span className="text-xl font-bold text-blue-600">{metrics.dbConnections.idle}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Pool</span>
              <span className="text-xl font-bold">{metrics.dbConnections.total}</span>
            </div>
            <Progress 
              value={(metrics.dbConnections.active / metrics.dbConnections.total) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Cache Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Hit Rate</span>
              <Badge variant={metrics.cacheStats.hitRate > 80 ? 'default' : 'secondary'}>
                {metrics.cacheStats.hitRate.toFixed(1)}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cache Hits</span>
              <span className="text-xl font-bold text-green-600">{metrics.cacheStats.hits}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cache Misses</span>
              <span className="text-xl font-bold text-red-600">{metrics.cacheStats.misses}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Metrics */}
      {security && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{security.requestsBlocked}</div>
                <p className="text-sm text-muted-foreground">Blocked Requests</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{security.suspiciousActivity}</div>
                <p className="text-sm text-muted-foreground">Suspicious Activity</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{security.deviceFingerprints}</div>
                <p className="text-sm text-muted-foreground">Device Fingerprints</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{security.ipAddressesTracked}</div>
                <p className="text-sm text-muted-foreground">IPs Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">API Gateway</p>
                <p className="text-sm text-green-600">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Database</p>
                <p className="text-sm text-green-600">Healthy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Authentication</p>
                <p className="text-sm text-green-600">Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}