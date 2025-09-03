import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, CheckCircle, Globe, Smartphone, Lock, Users } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background apple-blur-bg relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-accent/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16 apple-fade-in">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 apple-gradient rounded-3xl flex items-center justify-center apple-shadow apple-scale-in">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold apple-gradient-text mb-6">
            Veridity
          </h1>
          <p className="text-2xl text-muted-foreground mb-3 font-medium">
            Privacy-First Digital Identity Platform
          </p>
          <p className="text-xl text-muted-foreground mb-12 font-devanagari font-medium">
            प्राइभेसी-केन्द्रित डिजिटल पहिचान प्लेटफर्म
          </p>
          
          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-xl text-muted-foreground leading-relaxed">
              Prove your identity attributes securely without revealing sensitive personal data. 
              Nepal's first zero-knowledge proof platform for secure digital verification.
            </p>
          </div>

          <Button 
            onClick={handleLogin}
            size="lg"
            className="px-12 py-6 text-lg font-medium apple-gradient apple-button border-0 shadow-lg"
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 apple-fade-in">
          <Card className="text-center apple-card apple-glass border-0">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 apple-shadow">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Zero-Knowledge Proofs</h3>
              <p className="text-muted-foreground leading-relaxed">
                Prove claims about yourself without revealing the underlying data. 
                Your privacy is mathematically guaranteed.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center apple-card apple-glass border-0">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 apple-shadow">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Mobile-First Design</h3>
              <p className="text-muted-foreground leading-relaxed">
                Works offline on typical Android devices. Perfect for Nepal's 
                connectivity challenges with rural-friendly design.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center apple-card apple-glass border-0">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto mb-6 apple-shadow">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Bilingual Support</h3>
              <p className="text-muted-foreground leading-relaxed">
                Full support for English and Nepali (Devanagari script) 
                to serve all citizens of Nepal.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Use Cases */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Trusted by Organizations</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="p-6 hover:bg-muted/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium text-foreground">Government</h4>
              <p className="text-sm text-muted-foreground">सरकार</p>
            </Card>
            
            <Card className="p-6 hover:bg-muted/50 transition-colors">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h4 className="font-medium text-foreground">Universities</h4>
              <p className="text-sm text-muted-foreground">विश्वविद्यालयहरू</p>
            </Card>
            
            <Card className="p-6 hover:bg-muted/50 transition-colors">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h4 className="font-medium text-foreground">Banks</h4>
              <p className="text-sm text-muted-foreground">बैंकहरू</p>
            </Card>
            
            <Card className="p-6 hover:bg-muted/50 transition-colors">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium text-foreground">Enterprises</h4>
              <p className="text-sm text-muted-foreground">व्यवसायिक संस्थाहरू</p>
            </Card>
          </div>
        </div>

        {/* Benefits */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Why Choose Veridity?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium text-foreground">Privacy Guaranteed</h3>
                  <p className="text-sm text-muted-foreground">
                    Your personal data never leaves your device. Only cryptographic proofs are shared.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium text-foreground">Lightning Fast</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate proofs in under 3 seconds, verify in milliseconds.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium text-foreground">Works Offline</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate proofs without internet connection. Perfect for rural areas.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium text-foreground">Cost Effective</h3>
                  <p className="text-sm text-muted-foreground">
                    Each verification costs less than $0.05 in computational resources.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-border">
          <p className="text-muted-foreground">
            Made with ❤️ for Nepal | Built on cutting-edge cryptography
          </p>
        </div>
      </div>
    </div>
  );
}
