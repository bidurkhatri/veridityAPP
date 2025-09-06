import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Users, 
  Key, 
  Globe, 
  Clock,
  Edit3,
  HelpCircle,
  Settings
} from "lucide-react";

interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  category: 'authentication' | 'authorization' | 'data' | 'network';
  enabled: boolean;
  critical: boolean;
  settings?: {
    maxAttempts?: number;
    timeoutMinutes?: number;
    allowedIPs?: string[];
    requiredRoles?: string[];
  };
}

interface AccessPoliciesProps {
  policies: AccessPolicy[];
  onTogglePolicy?: (policyId: string, enabled: boolean) => void;
  onEditPolicy?: (policy: AccessPolicy) => void;
  className?: string;
}

const categoryConfig = {
  authentication: {
    label: 'Authentication',
    icon: Key,
    color: 'text-primary bg-primary/10',
  },
  authorization: {
    label: 'Authorization', 
    icon: Users,
    color: 'text-info-text bg-info-bg',
  },
  data: {
    label: 'Data Protection',
    icon: Shield,
    color: 'text-success-text bg-success-bg',
  },
  network: {
    label: 'Network Security',
    icon: Globe,
    color: 'text-warning-text bg-warning-bg',
  },
};

export function AccessPolicies({ 
  policies, 
  onTogglePolicy, 
  onEditPolicy, 
  className 
}: AccessPoliciesProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const filteredPolicies = React.useMemo(() => {
    if (selectedCategory === 'all') return policies;
    return policies.filter(policy => policy.category === selectedCategory);
  }, [policies, selectedCategory]);

  const groupedPolicies = React.useMemo(() => {
    const groups: Record<string, AccessPolicy[]> = {};
    filteredPolicies.forEach(policy => {
      if (!groups[policy.category]) {
        groups[policy.category] = [];
      }
      groups[policy.category].push(policy);
    });
    return groups;
  }, [filteredPolicies]);

  const criticalPolicies = policies.filter(p => p.critical && !p.enabled);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Critical Alert */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Access Control Policies</h2>
          <p className="text-text-secondary">Manage security policies and permissions</p>
        </div>
        
        {criticalPolicies.length > 0 && (
          <Badge className="text-danger-text bg-danger-bg border-danger-border">
            {criticalPolicies.length} Critical Disabled
          </Badge>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
          data-testid="filter-all"
        >
          All Policies ({policies.length})
        </Button>
        {Object.entries(categoryConfig).map(([key, config]) => {
          const count = policies.filter(p => p.category === key).length;
          const Icon = config.icon;
          
          return (
            <Button
              key={key}
              variant={selectedCategory === key ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(key)}
              className="flex items-center gap-2"
              data-testid={`filter-${key}`}
            >
              <Icon className="h-3 w-3" />
              {config.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Policy Groups */}
      <div className="space-y-6">
        {Object.entries(groupedPolicies).map(([category, categoryPolicies]) => {
          const config = categoryConfig[category as keyof typeof categoryConfig];
          const Icon = config.icon;
          
          return (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className={cn("p-2 rounded-lg", config.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {config.label}
                  <Badge variant="outline" className="ml-auto">
                    {categoryPolicies.filter(p => p.enabled).length} / {categoryPolicies.length} active
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {categoryPolicies.map((policy) => (
                    <div
                      key={policy.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border transition-colors",
                        policy.enabled 
                          ? "border-border-default bg-surface" 
                          : "border-border-subtle bg-surface-secondary/30",
                        policy.critical && !policy.enabled && "border-danger-border/50 bg-danger-bg/5"
                      )}
                      data-testid={`policy-${policy.id}`}
                    >
                      {/* Policy Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={cn(
                                "font-medium",
                                policy.enabled ? "text-text-primary" : "text-text-secondary"
                              )}>
                                {policy.name}
                              </h4>
                              {policy.critical && (
                                <Badge className="text-xs text-danger-text bg-danger-bg border-danger-border">
                                  Critical
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-text-secondary leading-relaxed">
                              {policy.description}
                            </p>
                          </div>
                        </div>

                        {/* Policy Settings Summary */}
                        {policy.settings && policy.enabled && (
                          <div className="flex items-center gap-4 text-xs text-text-tertiary">
                            {policy.settings.maxAttempts && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Max attempts: {policy.settings.maxAttempts}
                              </div>
                            )}
                            {policy.settings.timeoutMinutes && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Timeout: {policy.settings.timeoutMinutes}m
                              </div>
                            )}
                            {policy.settings.allowedIPs && (
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {policy.settings.allowedIPs.length} allowed IPs
                              </div>
                            )}
                            {policy.settings.requiredRoles && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {policy.settings.requiredRoles.length} required roles
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {}}
                          className="p-1"
                          data-testid={`help-${policy.id}`}
                        >
                          <HelpCircle className="h-4 w-4 text-text-tertiary" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditPolicy?.(policy)}
                          className="p-1"
                          data-testid={`edit-${policy.id}`}
                        >
                          <Edit3 className="h-4 w-4 text-text-tertiary" />
                        </Button>

                        <Switch
                          checked={policy.enabled}
                          onCheckedChange={(enabled) => onTogglePolicy?.(policy.id, enabled)}
                          disabled={policy.critical && policy.enabled} // Prevent disabling critical policies
                          data-testid={`toggle-${policy.id}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-text-primary">Policy Management</h4>
              <p className="text-sm text-text-secondary">
                {policies.filter(p => p.enabled).length} of {policies.length} policies active
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" data-testid="import-policies">
                Import Policies
              </Button>
              <Button variant="outline" size="sm" data-testid="export-policies">
                Export Settings
              </Button>
              <Button size="sm" data-testid="add-new-policy">
                <Settings className="h-3 w-3 mr-2" />
                New Policy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Mock data generator
export function generateMockAccessPolicies(): AccessPolicy[] {
  return [
    {
      id: 'mfa-required',
      name: 'Multi-Factor Authentication Required',
      description: 'Require MFA for all user logins and sensitive operations',
      category: 'authentication',
      enabled: true,
      critical: true,
      settings: {
        maxAttempts: 3,
        timeoutMinutes: 30,
      },
    },
    {
      id: 'password-policy',
      name: 'Strong Password Policy',
      description: 'Enforce minimum 12 characters with complexity requirements',
      category: 'authentication',
      enabled: true,
      critical: true,
      settings: {
        maxAttempts: 5,
      },
    },
    {
      id: 'role-based-access',
      name: 'Role-Based Access Control',
      description: 'Restrict access to features based on user roles and permissions',
      category: 'authorization',
      enabled: true,
      critical: false,
      settings: {
        requiredRoles: ['admin', 'operator', 'viewer'],
      },
    },
    {
      id: 'ip-allowlist',
      name: 'IP Address Allowlist',
      description: 'Only allow access from pre-approved IP addresses',
      category: 'network',
      enabled: false,
      critical: false,
      settings: {
        allowedIPs: ['192.168.1.0/24', '10.0.0.0/8'],
      },
    },
    {
      id: 'data-encryption',
      name: 'Data Encryption at Rest',
      description: 'Encrypt all sensitive data stored in the database',
      category: 'data',
      enabled: true,
      critical: true,
    },
    {
      id: 'session-timeout',
      name: 'Session Timeout Policy',
      description: 'Automatically log out users after period of inactivity',
      category: 'authentication',
      enabled: true,
      critical: false,
      settings: {
        timeoutMinutes: 60,
      },
    },
  ];
}