import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { AppHeader } from "@/components/AppHeader";
import { 
  QrCode, 
  Share as ShareIcon, 
  Camera, 
  Copy, 
  Download,
  Link2,
  Eye,
  Clock,
  Shield
} from "lucide-react";
import { useLocation } from "wouter";

export default function Share() {
  const [location, navigate] = useLocation();
  const { t } = useTranslation('en');
  const [activeTab, setActiveTab] = useState<'qr' | 'scan'>('qr');

  // Check if we should show scan tab first
  const shouldScan = new URLSearchParams(window.location.search).get('scan') === 'true';
  
  if (shouldScan && activeTab === 'qr') {
    setActiveTab('scan');
  }

  const mockQRData = "veridity://proof/verify/abc123def456";
  const mockSharingLink = "https://veridity.app/verify/abc123def456";

  const shareOptions = [
    {
      title: t('share.qr'),
      description: t('share.qrDesc'),
      icon: QrCode,
      action: () => setActiveTab('qr'),
      testId: "option-show-qr"
    },
    {
      title: t('share.link'),
      description: t('share.linkDesc', { time: '15 min' }),
      icon: Copy,
      action: () => navigator.clipboard.writeText(mockSharingLink),
      testId: "option-copy-link"
    },
    {
      title: t('share.download'),
      description: t('share.downloadDesc'),
      icon: Download,
      action: () => console.log('Download PDF'),
      testId: "option-download-pdf"
    }
  ];

  const scanSteps = [
    {
      step: 1,
      title: t('common.allow') + ' camera access',
      description: 'Required to scan QR codes'
    },
    {
      step: 2,
      title: 'Scan QR code',
      description: 'Point at organization\'s request QR'
    },
    {
      step: 3,
      title: 'Provide proof',
      description: 'Your proof will be sent automatically'
    }
  ];

  return (
    <div className="min-h-screen bg-background apple-blur-bg" style={{ paddingBottom: '80px' }}>
      <AppHeader 
        title={t('nav.share')}
        type="root"
        sticky
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex p-1 bg-muted/30 rounded-xl">
          <Button
            variant={activeTab === 'qr' ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === 'qr' ? 'apple-gradient apple-button border-0' : ''}`}
            onClick={() => setActiveTab('qr')}
            data-testid="tab-share"
          >
            <ShareIcon className="h-4 w-4 mr-2" />
            {t('common.share')}
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

        {activeTab === 'qr' && (
          <>
            {/* Current Proof QR */}
            <Card className="apple-card apple-glass border-0 apple-shadow text-center">
              <CardHeader>
                <CardTitle className="text-xl">
                  {language === 'np' ? 'मेरो प्रमाण QR' : 'My Proof QR'}
                </CardTitle>
                <p className="text-muted-foreground">
                  {language === 'np' ? 'अफलाइन प्रमाणीकरणको लागि यो QR देखाउनुहोस्' : 'Show this QR for offline verification'}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* QR Code Display */}
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-white rounded-2xl p-4 apple-shadow flex items-center justify-center">
                    <div className="w-full h-full bg-black/10 rounded-xl flex items-center justify-center">
                      <QrCode className="h-24 w-24 text-black/50" />
                    </div>
                  </div>
                </div>

                {/* QR Info */}
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {language === 'np' ? 'सक्रिय' : 'Active'}
                  </Badge>
                  <p className="text-xs text-muted-foreground font-mono">
                    {mockQRData}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Share Options */}
            <Card className="apple-card apple-glass border-0 apple-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'np' ? 'साझेदारी विकल्पहरू' : 'Sharing Options'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shareOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={index}
                      onClick={option.action}
                      className="w-full flex items-center p-4 rounded-xl border border-border/20 hover:bg-muted/50 transition-colors group text-left"
                      data-testid={option.testId}
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                        <Icon className="h-6 w-6 text-primary" />
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
                  );
                })}
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'scan' && (
          <>
            {/* Camera View Placeholder */}
            <Card className="apple-card apple-glass border-0 apple-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-full h-64 bg-black/5 rounded-2xl flex items-center justify-center mb-6">
                  <div className="space-y-4">
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      {language === 'np' ? 'क्यामेरा दृश्य यहाँ देखाइनेछ' : 'Camera view will appear here'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    className="apple-gradient apple-button border-0 shadow-lg px-8"
                    data-testid="button-start-camera"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {language === 'np' ? 'क्यामेरा सुरु गर्नुहोस्' : 'Start Camera'}
                  </Button>
                  
                  <Button variant="outline" data-testid="button-enter-code">
                    {language === 'np' ? 'कोड प्रविष्ट गर्नुहोस्' : 'Enter Code Manually'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* How to Scan */}
            <Card className="apple-card apple-glass border-0 apple-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-primary" />
                  {language === 'np' ? 'स्क्यान कसरी गर्ने' : 'How to Scan'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scanSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">{step.step}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{step.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {/* Security Notice */}
        <Card className="apple-glass border-0 apple-shadow bg-accent/5">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-foreground mb-1">
                  {language === 'np' ? 'सुरक्षा नोट' : 'Security Note'}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {language === 'np' 
                    ? 'तपाईंको व्यक्तिगत डेटा कहिल्यै साझेदारी हुँदैन। केवल प्रमाण मात्र प्रसारित हुन्छ।'
                    : 'Your personal data is never shared. Only the proof is transmitted.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}