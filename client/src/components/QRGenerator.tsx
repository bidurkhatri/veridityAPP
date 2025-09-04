import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslation, type Language } from '@/lib/i18n';
import {
  QrCode,
  Copy,
  Download,
  Clock,
  Share as ShareIcon,
  Sun,
  Moon,
  RefreshCw
} from 'lucide-react';

interface QRGeneratorProps {
  proofId: string;
  proofType: string;
  language?: Language;
  onClose?: () => void;
}

export function QRGenerator({ proofId, proofType, language = 'en', onClose }: QRGeneratorProps) {
  const { toast } = useToast();
  const { t } = useTranslation(language);
  const [qrData, setQrData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [copied, setCopied] = useState(false);

  // Generate QR code mutation
  const generateQRMutation = useMutation({
    mutationFn: async (data: { proofId: string; expiryMinutes?: number }) => {
      const response = await apiRequest('POST', '/api/qr/generate', data);
      return response.json();
    },
    onSuccess: (result) => {
      setQrData(result);
      setTimeLeft(15 * 60); // 15 minutes
      toast({
        title: "QR Code Generated",
        description: "Ready to share with verifiers"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Generate QR code on mount
  useEffect(() => {
    if (proofId) {
      generateQRMutation.mutate({ proofId, expiryMinutes: 15 });
    }
  }, [proofId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Copy sharing link
  const copyLink = async () => {
    if (qrData?.shareableUrl) {
      try {
        await navigator.clipboard.writeText(qrData.shareableUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Link Copied",
          description: "Sharing link copied to clipboard"
        });
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Unable to copy link to clipboard",
          variant: "destructive"
        });
      }
    }
  };

  // Download QR code
  const downloadQR = () => {
    if (qrData?.qrCodeDataUrl) {
      const link = document.createElement('a');
      link.href = qrData.qrCodeDataUrl;
      link.download = `veridity-proof-${proofId.slice(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "QR Code Downloaded",
        description: "Saved as PNG image"
      });
    }
  };

  // Refresh QR code
  const refreshQR = () => {
    generateQRMutation.mutate({ proofId, expiryMinutes: 15 });
  };

  // Adjust brightness for better scanning
  const adjustBrightness = (value: number[]) => {
    setBrightness(value[0]);
    document.body.style.filter = `brightness(${value[0]}%)`;
  };

  const resetBrightness = () => {
    setBrightness(100);
    document.body.style.filter = '';
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <Card className="apple-card apple-glass border-0 apple-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center">
              <QrCode className="mr-2 h-5 w-5 text-primary" />
              Share Proof
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-qr">
                ×
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {generateQRMutation.isPending && (
            <div className="text-center space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Generating secure QR code...</p>
            </div>
          )}

          {qrData && (
            <>
              {/* QR Code Display */}
              <div className="text-center space-y-3">
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img
                    src={qrData.qrCodeDataUrl}
                    alt="Verification QR Code"
                    className="w-48 h-48 mx-auto"
                    style={{ filter: `brightness(${brightness}%)` }}
                    data-testid="img-qr-code"
                  />
                </div>

                {/* Expiry Timer */}
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Badge variant={timeLeft < 300 ? 'destructive' : 'secondary'}>
                    {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'Expired'}
                  </Badge>
                </div>

                {/* Proof Info */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Proof Type: {proofType}</p>
                  <p>ID: {proofId.slice(0, 12)}...</p>
                </div>
              </div>

              {/* Brightness Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Screen Brightness</span>
                  <span className="text-xs text-muted-foreground">{brightness}%</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Moon className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={[brightness]}
                    onValueChange={adjustBrightness}
                    max={150}
                    min={50}
                    step={10}
                    className="flex-1"
                    data-testid="slider-brightness"
                  />
                  <Sun className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyLink}
                  disabled={copied}
                  data-testid="button-copy-link"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadQR}
                  data-testid="button-download-qr"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Save
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshQR}
                  disabled={generateQRMutation.isPending}
                  data-testid="button-refresh-qr"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${generateQRMutation.isPending ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {/* Instructions */}
              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>Show this QR code to the verifying organization</p>
                <p>Or share the link for online verification</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Reset brightness on component unmount */}
      {typeof window !== 'undefined' && (
        <div style={{ display: 'none' }} onLoad={resetBrightness} />
      )}
    </div>
  );
}