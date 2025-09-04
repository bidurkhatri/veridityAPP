import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppHeader } from "@/components/AppHeader";
import { useTranslation, type Language } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { 
  Building, 
  Key, 
  BarChart3, 
  Users, 
  Shield, 
  Settings, 
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  domain: string;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
  verificationCount: number;
  lastUsed?: string;
}

interface VerificationStats {
  totalVerifications: number;
  successfulVerifications: number;
  failedVerifications: number;
  uniqueUsers: number;
  topProofTypes: Array<{ type: string; count: number }>;
  recentActivity: Array<{
    id: string;
    type: string;
    result: 'success' | 'failed';
    timestamp: string;
    userHash?: string;
  }>;
}

export default function OrganizationDashboard() {
  const [language, setLanguage] = useState<Language>('en');
  const { t } = useTranslation(language);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDomain, setNewOrgDomain] = useState('');

  // Fetch organizations
  const { data: organizations, isLoading: orgsLoading } = useQuery<Organization[]>({
    queryKey: ['/api/organizations/my'],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch verification stats
  const { data: stats, isLoading: statsLoading } = useQuery<VerificationStats>({
    queryKey: ['/api/organizations/stats'],
    staleTime: 2 * 60 * 1000 // 2 minutes
  });

  // Create organization mutation
  const createOrgMutation = useMutation({
    mutationFn: async (data: { name: string; domain: string }) => {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create organization');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Organization Created",
        description: "New organization created successfully with API key"
      });
      setNewOrgName('');
      setNewOrgDomain('');
      queryClient.invalidateQueries({ queryKey: ['/api/organizations/my'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Regenerate API key mutation
  const regenerateKeyMutation = useMutation({
    mutationFn: async (orgId: string) => {
      const response = await fetch(`/api/organizations/${orgId}/regenerate-key`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to regenerate API key');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "API Key Regenerated",
        description: "New API key generated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations/my'] });
    }
  });

  // Delete organization mutation
  const deleteOrgMutation = useMutation({
    mutationFn: async (orgId: string) => {
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete organization');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Organization Deleted",
        description: "Organization and API access removed"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations/my'] });
    }
  });

  const handleCreateOrganization = () => {
    if (!newOrgName.trim() || !newOrgDomain.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both organization name and domain",
        variant: "destructive"
      });
      return;
    }

    createOrgMutation.mutate({
      name: newOrgName.trim(),
      domain: newOrgDomain.trim()
    });
  };

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "API Key Copied",
      description: "API key copied to clipboard"
    });
  };

  const toggleApiKeyVisibility = (orgId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [orgId]: !prev[orgId]
    }));
  };

  return (
    <div className="min-h-screen bg-background apple-blur-bg">
      <AppHeader 
        title={language === 'np' ? 'संस्था ड्यासबोर्ड' : 'Organization Dashboard'}
        type="secondary"
        showLanguageSwitcher
        onLanguageChange={setLanguage}
        currentLanguage={language}
      />

      <main className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="apple-card apple-glass border-0 apple-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.totalVerifications || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'np' ? 'कुल प्रमाणीकरण' : 'Total Verifications'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="apple-card apple-glass border-0 apple-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.successfulVerifications || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'np' ? 'सफल प्रमाणीकरण' : 'Successful'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="apple-card apple-glass border-0 apple-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.uniqueUsers || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'np' ? 'अद्वितीय प्रयोगकर्ता' : 'Unique Users'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="apple-card apple-glass border-0 apple-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-foreground">
                    {organizations?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'np' ? 'संस्थाहरू' : 'Organizations'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organization Management */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Building className="mr-3 h-6 w-6 text-primary" />
              {language === 'np' ? 'संस्था व्यवस्थापन' : 'Organization Management'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Organization */}
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
              <h3 className="font-medium text-foreground">
                {language === 'np' ? 'नयाँ संस्था थप्नुहोस्' : 'Add New Organization'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="Organization name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  data-testid="input-org-name"
                />
                <Input
                  placeholder="Domain (e.g., company.com)"
                  value={newOrgDomain}
                  onChange={(e) => setNewOrgDomain(e.target.value)}
                  data-testid="input-org-domain"
                />
                <Button
                  onClick={handleCreateOrganization}
                  disabled={createOrgMutation.isPending}
                  className="apple-gradient apple-button border-0"
                  data-testid="button-create-org"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {createOrgMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>

            {/* Organizations List */}
            {orgsLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-spin" />
                <p className="text-muted-foreground">Loading organizations...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {organizations?.map((org) => (
                  <Card key={org.id} className="border border-border/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-foreground">{org.name}</h3>
                            <Badge variant={org.isActive ? "default" : "outline"}>
                              {org.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{org.domain}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{org.verificationCount} verifications</span>
                            {org.lastUsed && <span>Last used: {new Date(org.lastUsed).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleApiKeyVisibility(org.id)}
                              data-testid={`button-toggle-key-${org.id}`}
                            >
                              {showApiKeys[org.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyApiKey(org.apiKey)}
                              data-testid={`button-copy-key-${org.id}`}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => regenerateKeyMutation.mutate(org.id)}
                              data-testid={`button-regen-key-${org.id}`}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteOrgMutation.mutate(org.id)}
                              data-testid={`button-delete-org-${org.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* API Key Display */}
                      <div className="mt-4 p-3 bg-muted/10 rounded border">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">API Key:</span>
                          <code className="text-xs font-mono">
                            {showApiKeys[org.id] 
                              ? org.apiKey 
                              : org.apiKey.substring(0, 8) + '••••••••••••••••'
                            }
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {organizations?.length === 0 && (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No organizations created yet</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Usage Statistics */}
        {stats && (
          <Card className="apple-card apple-glass border-0 apple-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <BarChart3 className="mr-3 h-6 w-6 text-primary" />
                {language === 'np' ? 'उपयोग तथ्याङ्क' : 'Usage Statistics'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Proof Types Chart */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">
                  {language === 'np' ? 'लोकप्रिय प्रमाण प्रकारहरू' : 'Popular Proof Types'}
                </h3>
                <div className="space-y-2">
                  {stats.topProofTypes.map((type, index) => (
                    <div key={type.type} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{type.type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ 
                              width: `${(type.count / Math.max(...stats.topProofTypes.map(t => t.count))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">{type.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">
                  {language === 'np' ? 'हालका गतिविधि' : 'Recent Activity'}
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>User</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentActivity.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell>
                            <span className="capitalize">{activity.type}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={activity.result === 'success' ? 'default' : 'outline'}>
                              {activity.result}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs">
                              {activity.userHash?.substring(0, 8) || 'Anonymous'}...
                            </code>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Documentation */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Key className="mr-3 h-6 w-6 text-primary" />
              {language === 'np' ? 'API एकीकरण' : 'API Integration'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-medium text-foreground">Quick Start Guide</h3>
              <div className="bg-muted/10 p-4 rounded-lg border">
                <h4 className="text-sm font-medium mb-2">1. Verify a proof:</h4>
                <code className="text-xs block bg-background p-3 rounded border">
                  curl -X POST https://veridity.replit.app/api/verify \{'\n'}
                  &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY" \{'\n'}
                  &nbsp;&nbsp;-H "Content-Type: application/json" \{'\n'}
                  &nbsp;&nbsp;-d '{`{"proofId": "proof_123", "requirements": {"minAge": 18}}`}'
                </code>
              </div>
              
              <div className="bg-muted/10 p-4 rounded-lg border">
                <h4 className="text-sm font-medium mb-2">2. Check proof status:</h4>
                <code className="text-xs block bg-background p-3 rounded border">
                  curl -H "Authorization: Bearer YOUR_API_KEY" \{'\n'}
                  &nbsp;&nbsp;https://veridity.replit.app/api/proof/proof_123
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}