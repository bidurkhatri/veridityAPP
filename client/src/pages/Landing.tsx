import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, CheckCircle, Globe, Smartphone, Lock, Users } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-canvas bg-gradient-subtle relative overflow-hidden">
      {/* Identity Strip - Brief Requirements */}
      <div className="bg-surface border-b border-border-default">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-brand-emerald-600 rounded-sm flex items-center justify-center">
                  <Shield className="h-3 w-3 text-white" />
                </div>
                <span className="font-medium text-text-primary">Nepal's First ZK Platform</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-text-tertiary">
                <CheckCircle className="h-4 w-4 text-success-text" />
                <span>Government Approved</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-text-tertiary">
              <span>🔒 99.9% Uptime</span>
              <span>⚡ Zero Data Storage</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-24 fade-in">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 brand-gradient rounded-2xl flex items-center justify-center elevation-lg scale-in">
              <Shield className="h-10 w-10 text-text-inverse" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold brand-gradient-text mb-6 tracking-tight">
            Veridity
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-4 font-medium">
            Privacy-First Digital Identity Platform
          </p>
          <p className="text-lg md:text-xl text-text-tertiary mb-12 font-devanagari font-medium">
            प्राइभेसी-केन्द्रित डिजिटल पहिचान प्लेटफर्म
          </p>
          
          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              Prove your identity attributes securely without revealing sensitive personal data. 
              Nepal's first zero-knowledge proof platform for secure digital verification.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin}
              size="lg"
              variant="primary"
              className="px-12 py-4 text-lg font-semibold"
              data-testid="button-get-started"
            >
              Get Started
            </Button>
            <Button 
              size="lg"
              variant="secondary"
              className="px-12 py-4 text-lg font-semibold"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 slide-in-right">
          <Card className="text-center card-base card-interactive elevation-sm">
            <CardContent className="p-8">
              <div className="w-16 h-16 brand-primary rounded-xl flex items-center justify-center mx-auto mb-6 elevation-sm">
                <Lock className="h-8 w-8 text-text-inverse" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-4">Zero-Knowledge Proofs</h3>
              <p className="text-text-secondary leading-relaxed">
                Prove claims about yourself without revealing the underlying data. 
                Your privacy is mathematically guaranteed.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center card-base card-interactive elevation-sm">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-success-600 rounded-xl flex items-center justify-center mx-auto mb-6 elevation-sm">
                <Smartphone className="h-8 w-8 text-text-inverse" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-4">Mobile-First Design</h3>
              <p className="text-text-secondary leading-relaxed">
                Works offline on typical Android devices. Perfect for Nepal's 
                connectivity challenges with rural-friendly design.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center card-base card-interactive elevation-sm">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-info-600 rounded-xl flex items-center justify-center mx-auto mb-6 elevation-sm">
                <Globe className="h-8 w-8 text-text-inverse" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-4">Bilingual Support</h3>
              <p className="text-text-secondary leading-relaxed">
                Full support for English and Nepali (Devanagari script) 
                to serve all citizens of Nepal.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Use Cases */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-12">Trusted by Organizations</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="card-base card-interactive p-6 elevation-xs">
              <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-brand-700" />
              </div>
              <h4 className="font-semibold text-text-primary">Government</h4>
              <p className="text-sm text-text-tertiary font-devanagari">सरकार</p>
            </Card>
            
            <Card className="card-base card-interactive p-6 elevation-xs">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-success-700" />
              </div>
              <h4 className="font-semibold text-text-primary">Universities</h4>
              <p className="text-sm text-text-tertiary font-devanagari">विश्वविद्यालयहरू</p>
            </Card>
            
            <Card className="card-base card-interactive p-6 elevation-xs">
              <div className="w-12 h-12 bg-info-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-info-700" />
              </div>
              <h4 className="font-semibold text-text-primary">Banks</h4>
              <p className="text-sm text-text-tertiary font-devanagari">बैंकहरू</p>
            </Card>
            
            <Card className="card-base card-interactive p-6 elevation-xs">
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-warning-700" />
              </div>
              <h4 className="font-semibold text-text-primary">Enterprises</h4>
              <p className="text-sm text-text-tertiary font-devanagari">व्यवसायिक संस्थाहरू</p>
            </Card>
          </div>
        </div>

        {/* Benefits */}
        <Card className="card-base elevation-sm border border-brand-200 bg-surface">
          <CardContent className="p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary text-center mb-12">
              Why Choose Veridity?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-brand-600 mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Privacy Guaranteed</h3>
                  <p className="text-text-secondary leading-relaxed">
                    Your personal data never leaves your device. Only cryptographic proofs are shared.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-brand-600 mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Lightning Fast</h3>
                  <p className="text-text-secondary leading-relaxed">
                    Generate proofs in under 3 seconds, verify in milliseconds.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-brand-600 mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Works Offline</h3>
                  <p className="text-text-secondary leading-relaxed">
                    Generate proofs without internet connection. Perfect for rural areas.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-brand-600 mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Cost Effective</h3>
                  <p className="text-text-secondary leading-relaxed">
                    Each verification costs less than $0.05 in computational resources.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-20 pt-8 border-t border-border-default">
          <p className="text-text-tertiary">
            Made with ❤️ for Nepal | Built on cutting-edge cryptography
          </p>
        </div>
      </div>
    </div>
  );
}
