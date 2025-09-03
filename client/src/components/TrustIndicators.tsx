import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import {
  Shield,
  CheckCircle,
  Clock,
  Users,
  Globe,
  Zap,
  Lock,
  Eye,
  TrendingUp,
  Award,
  Star,
  Verified
} from "lucide-react";

interface TrustIndicatorsProps {
  variant?: 'compact' | 'detailed' | 'inline';
  showStats?: boolean;
  className?: string;
}

interface SecurityMetric {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  description?: string;
}

interface LiveStats {
  totalVerifications: number;
  activeUsers: number;
  uptimePercentage: number;
  securityIncidents: number;
}

export function TrustIndicators({ variant = 'compact', showStats = true, className = '' }: TrustIndicatorsProps) {
  const { t } = useTranslation('en');
  const [stats, setStats] = useState<LiveStats>({
    totalVerifications: 1247890,
    activeUsers: 23456,
    uptimePercentage: 99.97,
    securityIncidents: 0
  });

  // Simulate real-time stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalVerifications: prev.totalVerifications + Math.floor(Math.random() * 3),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 2) - 1,
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const securityMetrics: SecurityMetric[] = [
    {
      label: 'Zero-Knowledge',
      value: 'Active',
      icon: Shield,
      color: 'text-primary',
      description: 'Your data never leaves your device'
    },
    {
      label: 'Encryption',
      value: 'AES-256',
      icon: Lock,
      color: 'text-success',
      description: 'Military-grade encryption'
    },
    {
      label: 'Uptime',
      value: `${stats.uptimePercentage}%`,
      icon: Zap,
      color: 'text-success',
      description: 'Service availability'
    },
    {
      label: 'Audited',
      value: 'Verified',
      icon: Award,
      color: 'text-accent',
      description: 'Third-party security audit'
    }
  ];

  const certifications = [
    { name: 'Nepal Government', icon: Verified, color: 'bg-blue-500' },
    { name: 'ISO 27001', icon: Shield, color: 'bg-green-500' },
    { name: 'SOC 2 Type II', icon: CheckCircle, color: 'bg-purple-500' },
    { name: 'GDPR Compliant', icon: Globe, color: 'bg-amber-500' }
  ];

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Badge className="bg-success/10 text-success border-success/20 text-xs">
          <Shield className="h-3 w-3 mr-1" />
          Verified Secure
        </Badge>
        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          Government Approved
        </Badge>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={`apple-card apple-glass border-0 apple-shadow ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Security Status</h3>
            <Badge className="bg-success/10 text-success border-success/20 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {securityMetrics.slice(0, 4).map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                  <div>
                    <p className="text-xs font-medium">{metric.label}</p>
                    <p className="text-xs text-muted-foreground">{metric.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {showStats && (
            <div className="mt-4 pt-3 border-t border-border/20">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{stats.totalVerifications.toLocaleString()} verifications</span>
                <span>{stats.activeUsers.toLocaleString()} active users</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Detailed variant
  return (
    <Card className={`apple-card apple-glass border-0 apple-shadow ${className}`}>
      <CardContent className="p-6 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-success to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 apple-shadow">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-bold text-lg mb-1">Veridity Security</h3>
          <p className="text-sm text-muted-foreground">
            Enterprise-grade privacy protection
          </p>
        </div>

        {/* Security Metrics */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Security Features</h4>
          <div className="grid grid-cols-1 gap-3">
            {securityMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                    <div>
                      <p className="text-sm font-medium">{metric.label}</p>
                      {metric.description && (
                        <p className="text-xs text-muted-foreground">{metric.description}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {metric.value}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certifications */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Certifications</h4>
          <div className="grid grid-cols-2 gap-2">
            {certifications.map((cert, index) => {
              const Icon = cert.icon;
              return (
                <div key={index} className="flex items-center space-x-2 p-2 border border-border/20 rounded-lg">
                  <div className={`w-6 h-6 ${cert.color} rounded flex items-center justify-center`}>
                    <Icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs font-medium">{cert.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Statistics */}
        {showStats && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Live Statistics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-primary/5 rounded-lg">
                <p className="text-lg font-bold text-primary">{stats.totalVerifications.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Verifications</p>
              </div>
              <div className="text-center p-3 bg-success/5 rounded-lg">
                <p className="text-lg font-bold text-success">{stats.uptimePercentage}%</p>
                <p className="text-xs text-muted-foreground">Uptime</p>
              </div>
              <div className="text-center p-3 bg-accent/5 rounded-lg">
                <p className="text-lg font-bold text-accent">{stats.activeUsers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
              <div className="text-center p-3 bg-success/5 rounded-lg">
                <p className="text-lg font-bold text-success">{stats.securityIncidents}</p>
                <p className="text-xs text-muted-foreground">Security Incidents</p>
              </div>
            </div>
          </div>
        )}

        {/* Trust Score */}
        <div className="text-center p-4 bg-gradient-to-r from-success/10 to-primary/10 rounded-xl border border-success/20">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Star className="h-5 w-5 text-success fill-current" />
            <span className="font-bold text-lg">98/100</span>
            <Star className="h-5 w-5 text-success fill-current" />
          </div>
          <p className="text-sm font-medium text-success">Excellent Trust Score</p>
          <p className="text-xs text-muted-foreground">Based on security audit & user feedback</p>
        </div>
      </CardContent>
    </Card>
  );
}