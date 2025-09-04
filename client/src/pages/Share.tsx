import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { AppHeader } from "@/components/AppHeader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  QrCode, 
  Share as ShareIcon, 
  Camera, 
  Copy,
  Download,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  Eye
} from "lucide-react";
import { useLocation } from "wouter";

export default function Share() {
  const [location, navigate] = useLocation();
  const { t } = useTranslation('en');
  const [activeTab, setActiveTab] = useState<'qr' | 'scan'>('qr');
  const [copying, setCopying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [brightness, setBrightness] = useState(1);

  // Mock sharing link for demonstration
  const mockSharingLink = "https://veridity.np/verify/abc123def456";

  // Countdown timer effect
  useEffect(() => {
    if (activeTab === 'qr' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeTab, timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Boost brightness for QR code
  const boostBrightness = () => {
    setBrightness(1.2);
    document.body.style.filter = 'brightness(120%)';
  };

  const resetBrightness = () => {
    setBrightness(1);
    document.body.style.filter = '';
  };

  const shareOptions = [
    {
      title: "Show QR Code",
      description: "For offline verification",
      icon: QrCode,
      action: () => setActiveTab('qr'),
      testId: "option-show-qr"
    },
    {
      title: "Copy Link",
      description: "Expires in 15 minutes",
      icon: Copy,
      action: () => navigator.clipboard.writeText(mockSharingLink),
      testId: "option-copy-link"
    },
    {
      title: "Download PDF",
      description: "Save as receipt",
      icon: Download,
      action: () => console.log('Download PDF'),
      testId: "option-download-pdf"
    }
  ];

  const scanSteps = [
    {
      step: 1,
      title: "Allow camera access",
      description: "Required to scan QR codes"
    },
    {
      step: 2,
      title: "Scan QR code",
      description: "Point at organization's request QR"
    },
    {
      step: 3,
      title: "Provide proof",
      description: "Your proof will be sent automatically"
    }
  ];

  return (
    <div className="min-h-screen bg-background apple-blur-bg" style={{ paddingBottom: '80px' }}>
      <AppHeader 
        title={t('nav.share')}
        type="root"
        actions={[
          <ThemeToggle key="theme-toggle" />
        ]}
        sticky
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Tab Navigation */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardContent className="p-4">
            <div className="flex rounded-xl bg-muted/20 p-1 space-x-1">
              <Button
                variant={activeTab === 'qr' ? 'default' : 'ghost'}
                className={`flex-1 ${activeTab === 'qr' ? 'apple-gradient apple-button border-0' : ''}`}
                onClick={() => setActiveTab('qr')}
                data-testid="tab-share"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant={activeTab === 'scan' ? 'default' : 'ghost'}
                className={`flex-1 ${activeTab === 'scan' ? 'apple-gradient apple-button border-0' : ''}`}
                onClick={() => setActiveTab('scan')}
                data-testid="tab-scan"
              >
                <Camera className="h-4 w-4 mr-2" />
                Scan
              </Button>
            </div>
          </CardContent>
        </Card>

        {activeTab === 'qr' ? (
          <>
            {/* Share Options */}
            <div className="grid gap-4">
              {shareOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <Card key={index} className="apple-card apple-glass border-0 apple-shadow">
                    <CardContent className="p-6">
                      <button
                        onClick={option.action}
                        className="w-full flex items-center space-x-4 text-left hover:bg-muted/20 rounded-lg transition-colors"
                        data-testid={option.testId}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center apple-shadow">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">
                            {option.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* QR Code Display */}
            <Card className="apple-card apple-glass border-0 apple-shadow">
              <CardHeader>
                <CardTitle className="text-center">Your Verification QR</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* QR Code Display */}
                <div className="flex justify-center">
                  <div 
                    className="w-72 h-72 bg-white rounded-2xl flex items-center justify-center apple-shadow cursor-pointer transition-transform hover:scale-105"
                    style={{ filter: `brightness(${brightness})` }}
                    onClick={boostBrightness}
                    onMouseLeave={resetBrightness}
                  >
                    {timeLeft > 0 ? (
                      <div className="w-64 h-64 border-4 border-gray-900 rounded-xl flex items-center justify-center bg-white">
                        <div className="text-center">
                          <QrCode className="h-32 w-32 text-gray-900 mx-auto mb-2" />
                          <div className="text-xs text-gray-600 font-mono">
                            {mockSharingLink.slice(-12)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <Clock className="h-16 w-16 mx-auto mb-2" />
                        <p className="text-sm">QR Code Expired</p>
                        <Button size="sm" className="mt-2" onClick={() => setTimeLeft(15 * 60)}>
                          Generate New
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* QR Info */}
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <Clock className={`h-4 w-4 ${timeLeft < 60 ? 'text-destructive' : 'text-muted-foreground'}`} />
                    <span className={timeLeft < 60 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                      Expires in {formatTime(timeLeft)}
                    </span>
                  </div>
                  
                  {timeLeft < 60 && (
                    <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-xs text-destructive">QR code expires soon! Generate a new one if needed.</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        setCopying(true);
                        await navigator.clipboard.writeText(mockSharingLink);
                        setTimeout(() => setCopying(false), 2000);
                      }}
                      className="apple-button"
                      data-testid="button-copy-link"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copying ? 'Copied!' : 'Copy Link'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="apple-button"
                      data-testid="button-share-qr"
                    >
                      <ShareIcon className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Privacy Notice */}
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm text-accent">Privacy Protected</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        This QR contains only verification tokens. Your actual data never leaves your device.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Scan Instructions */}
            <Card className="apple-card apple-glass border-0 apple-shadow">
              <CardHeader>
                <CardTitle>How to Scan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scanSteps.map((step) => (
                  <div key={step.step} className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Camera Placeholder */}
            <Card className="apple-card apple-glass border-0 apple-shadow">
              <CardContent className="p-8">
                <div className="aspect-square bg-black rounded-2xl flex items-center justify-center mb-6">
                  <div className="text-center text-white">
                    <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm opacity-75">Camera view will appear here</p>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Button
                    className="apple-gradient apple-button border-0 flex-1"
                    data-testid="button-enable-camera"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Enable Camera
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Scan Results */}
            <Card className="apple-card apple-glass border-0 apple-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Recent Scans</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent scans</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}