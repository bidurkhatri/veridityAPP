import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { VerificationResult } from "@/components/VerificationResult";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation, type Language } from "@/lib/i18n";
import { Shield, Search, QrCode, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Verification() {
  const { toast } = useToast();
  const [language, setLanguage] = useState<Language>('en');
  const { t } = useTranslation(language);

  // Form state
  const [proofId, setProofId] = useState('');
  const [organizationApiKey, setOrganizationApiKey] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Fetch organizations
  const { data: organizations = [] } = useQuery<any[]>({
    queryKey: ['/api/organizations'],
  });

  // Verification mutation
  const verifyMutation = useMutation({
    mutationFn: async (data: { proofId: string; organizationApiKey?: string }) => {
      const response = await apiRequest('POST', '/api/verify', data);
      return response.json();
    },
    onSuccess: (result) => {
      setVerificationResult(result);
      if (result.valid) {
        toast({
          title: t('message.proofVerified'),
          description: "Proof is valid and trustworthy",
        });
      } else {
        toast({
          title: t('message.proofFailed'),
          description: "Proof verification failed",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVerify = () => {
    if (!proofId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a proof ID",
        variant: "destructive",
      });
      return;
    }

    verifyMutation.mutate({
      proofId: proofId.trim(),
      organizationApiKey: organizationApiKey || undefined,
    });
  };

  const handleScanQR = () => {
    // In a real implementation, this would open camera for QR scanning
    toast({
      title: "QR Scanner",
      description: "QR code scanning not implemented in demo",
    });
  };

  return (
    <div className="min-h-screen bg-background apple-blur-bg">
      {/* Header */}
      <header className="apple-glass border-b border-border/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Search className="text-secondary-foreground text-lg" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-foreground">Verify Proof</h1>
                <p className="text-xs text-muted-foreground">Validate identity proofs</p>
              </div>
            </div>

            <LanguageSwitcher 
              currentLanguage={language} 
              onLanguageChange={setLanguage} 
            />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Verification Form */}
          <div className="space-y-6">
            <Card className="apple-card apple-glass border-0 apple-shadow apple-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Search className="mr-3 h-6 w-6 text-secondary" />
                  {t('nav.verify')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="proofId">
                    {t('form.proofCode')}
                  </Label>
                  <div className="flex gap-3">
                    <Input
                      id="proofId"
                      placeholder="Enter proof ID or scan QR..."
                      value={proofId}
                      onChange={(e) => setProofId(e.target.value)}
                      data-testid="input-proof-id"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleScanQR}
                      data-testid="button-scan-qr"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="organization">
                    {t('form.organization')} (Optional)
                  </Label>
                  <Select 
                    value={organizationApiKey} 
                    onValueChange={setOrganizationApiKey}
                  >
                    <SelectTrigger data-testid="select-organization">
                      <SelectValue placeholder="Select verifying organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No organization (public verification)</SelectItem>
                      {(organizations as any[]).map((org: any) => (
                        <SelectItem key={org.id} value={org.apiKey || org.id}>
                          {language === 'np' ? org.nameNepali || org.name : org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleVerify}
                  disabled={verifyMutation.isPending}
                  className="w-full apple-gradient apple-button border-0 shadow-lg py-3"
                  data-testid="button-verify-proof"
                >
                  {verifyMutation.isPending ? t('common.loading') : t('form.verify')}
                </Button>
              </CardContent>
            </Card>

            {/* Information Card */}
            <Card className="apple-glass border-0 apple-shadow">
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-4 flex items-center text-lg">
                  <Shield className="mr-3 h-6 w-6 text-accent" />
                  How Verification Works
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Enter the proof ID provided by the proof holder</p>
                  <p>• Optionally select your organization for logged verification</p>
                  <p>• The system validates the cryptographic proof without accessing personal data</p>
                  <p>• Get instant verification results with mathematical certainty</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Verifications */}
            <Card className="apple-card apple-glass border-0 apple-shadow">
              <CardHeader>
                <CardTitle className="text-xl">Recent Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground text-sm">Age 18+ Proof</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                    <div className="text-green-600">
                      <span className="text-xs font-medium">VERIFIED</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground text-sm">Education Proof</p>
                      <p className="text-xs text-muted-foreground">5 minutes ago</p>
                    </div>
                    <div className="text-green-600">
                      <span className="text-xs font-medium">VERIFIED</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground text-sm">Citizenship Proof</p>
                      <p className="text-xs text-muted-foreground">10 minutes ago</p>
                    </div>
                    <div className="text-red-600">
                      <span className="text-xs font-medium">FAILED</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Verification Result */}
          <div className="space-y-6">
            {verificationResult ? (
              <VerificationResult result={verificationResult} language={language} />
            ) : (
              <Card className="border-dashed border-2 border-muted">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Ready to Verify</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter a proof ID above to start verification
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Organization Info */}
            <Card className="apple-card apple-glass border-0 apple-shadow">
              <CardHeader>
                <CardTitle className="text-xl">Trusted Organizations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(organizations as any[]).slice(0, 4).map((org: any) => (
                    <div key={org.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {language === 'np' ? org.nameNepali || org.name : org.name}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{org.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
