import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  Shield, 
  Clock, 
  AlertTriangle,
  QrCode,
  ArrowLeft,
  User,
  Building
} from 'lucide-react';
import { QR_ERROR_MESSAGES } from '@shared/qr-schema';

interface QRVerificationProps {
  // Props will be set based on URL query parameters
}

export default function QRVerification() {
  const [location] = useLocation();
  const [verificationData, setVerificationData] = useState<{
    success: boolean;
    type?: string;
    issuer?: string;
    error?: string;
    timeRemaining?: number;
  } | null>(null);

  useEffect(() => {
    // Parse URL query parameters
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const success = urlParams.get('success') === 'true';
    const type = urlParams.get('type');
    const issuer = urlParams.get('issuer');
    const error = urlParams.get('error');
    
    setVerificationData({
      success,
      type: type || undefined,
      issuer: issuer ? decodeURIComponent(issuer) : undefined,
      error: error || undefined
    });
  }, [location]);

  const getErrorMessage = (errorCode: string): string => {
    return QR_ERROR_MESSAGES[errorCode as keyof typeof QR_ERROR_MESSAGES] || 
           'An unknown error occurred during verification.';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'proof_verification':
        return <Shield className="h-5 w-5" />;
      case 'identity_share':
        return <User className="h-5 w-5" />;
      case 'login_request':
        return <Building className="h-5 w-5" />;
      default:
        return <QrCode className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'proof_verification':
        return 'Proof Verification Request';
      case 'identity_share':
        return 'Identity Sharing Request';
      case 'login_request':
        return 'Login Request';
      default:
        return 'Verification Request';
    }
  };

  if (!verificationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Processing QR code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => window.history.back()}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold" data-testid="qr-verification-title">
                QR Code Verification
              </h1>
              <p className="text-muted-foreground">
                Secure verification result
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        {verificationData.success ? (
          // Success State
          <Card className="border-success/20 bg-success/5">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-success" data-testid="verification-success-title">
                Verification Successful
              </CardTitle>
              <CardDescription>
                The QR code has been successfully verified and is authentic.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Verification Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                  <div className="flex items-center gap-3">
                    {verificationData.type && getTypeIcon(verificationData.type)}
                    <div>
                      <h3 className="font-medium">Request Type</h3>
                      <p className="text-sm text-muted-foreground">
                        {verificationData.type ? getTypeLabel(verificationData.type) : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">Verified</Badge>
                </div>

                {verificationData.issuer && (
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Issued By</h3>
                        <p className="text-sm text-muted-foreground" data-testid="verification-issuer">
                          {verificationData.issuer}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Trusted</Badge>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Verified At</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Just Now</Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button className="flex-1" data-testid="button-proceed">
                  Proceed with Verification
                </Button>
                <Button variant="secondary" data-testid="button-save-verification">
                  Save Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Error State
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-destructive" data-testid="verification-error-title">
                Verification Failed
              </CardTitle>
              <CardDescription>
                The QR code could not be verified. Please see details below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Details */}
              <div className="p-4 bg-background rounded-lg border border-destructive/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <h3 className="font-medium text-destructive mb-1">Error Details</h3>
                    <p className="text-sm" data-testid="verification-error-message">
                      {verificationData.error ? 
                        getErrorMessage(verificationData.error) : 
                        'An unknown error occurred during verification.'
                      }
                    </p>
                    {verificationData.error && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Error Code: {verificationData.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Suggested Actions */}
              <div className="space-y-3">
                <h4 className="font-medium">Suggested Actions</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Request a new QR code from the issuer</p>
                  <p>• Ensure your internet connection is stable</p>
                  <p>• Check that the QR code hasn't expired</p>
                  <p>• Contact support if the problem persists</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => window.location.reload()}
                  data-testid="button-try-again"
                >
                  Try Again
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => window.location.href = '/help'}
                  data-testid="button-contact-support"
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="mt-6 border-muted">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Security Notice</h4>
                <p className="text-sm text-muted-foreground">
                  This verification uses cryptographic signatures and tamper-proof technology 
                  to ensure the authenticity of the QR code. Each code is single-use and expires 
                  automatically for your security.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}