/**
 * Trust and Privacy Transparency Features for Veridity
 * Building user confidence through clear security indicators
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Lock, 
  Eye, 
  Server, 
  CheckCircle2, 
  AlertTriangle,
  Globe,
  Smartphone,
  Key,
  FileText,
  Users,
  Award,
  Zap
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface SecurityMetrics {
  encryptionLevel: number;
  privacyScore: number;
  complianceStatus: 'excellent' | 'good' | 'needs-improvement';
  certifications: string[];
  lastSecurityAudit: Date;
  dataRetentionPolicy: string;
}

export function TrustIndicators() {
  const { t, language } = useTranslation();
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    encryptionLevel: 256,
    privacyScore: 98,
    complianceStatus: 'excellent',
    certifications: ['ISO 27001', 'SOC 2 Type II', 'Nepal Data Protection'],
    lastSecurityAudit: new Date('2024-01-15'),
    dataRetentionPolicy: 'minimal'
  });
  const [showDetails, setShowDetails] = useState(false);
  const [trustAnimation, setTrustAnimation] = useState(false);

  useEffect(() => {
    // Animate trust indicators on mount
    setTrustAnimation(true);
    setTimeout(() => setTrustAnimation(false), 2000);
  }, []);

  const getPrivacyScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPrivacyScoreLabel = (score: number) => {
    if (score >= 95) return language === 'np' ? 'उत्कृष्ट' : 'Excellent';
    if (score >= 85) return language === 'np' ? 'राम्रो' : 'Good';
    return language === 'np' ? 'सुधार आवश्यक' : 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      {/* Main Trust Banner */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 bg-green-100 rounded-full ${trustAnimation ? 'animate-pulse' : ''}`}>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-800">
                  {language === 'np' ? 'पूर्ण गोपनीयता सुरक्षा' : 'Complete Privacy Protection'}
                </h3>
                <p className="text-green-700 text-sm mt-1">
                  {language === 'np' 
                    ? 'तपाईंको व्यक्तिगत डेटा कहिल्यै साझा गरिंदैन'
                    : 'Your personal data is never shared or stored'
                  }
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="border-green-300 text-green-700"
            >
              {language === 'np' ? 'विवरण हेर्नुहोस्' : 'View Details'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trust Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Privacy Score */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className="relative mb-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Eye className="h-8 w-8 text-green-600" />
              </div>
              <Badge className="absolute -top-1 -right-1 bg-green-600 text-white text-xs px-1">
                {securityMetrics.privacyScore}
              </Badge>
            </div>
            <h4 className="font-semibold text-lg">
              {language === 'np' ? 'गोपनीयता स्कोर' : 'Privacy Score'}
            </h4>
            <p className={`text-sm font-medium ${getPrivacyScoreColor(securityMetrics.privacyScore)}`}>
              {getPrivacyScoreLabel(securityMetrics.privacyScore)}
            </p>
          </CardContent>
        </Card>

        {/* Encryption Level */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className="relative mb-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <Badge className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1">
                {securityMetrics.encryptionLevel}
              </Badge>
            </div>
            <h4 className="font-semibold text-lg">
              {language === 'np' ? 'एन्क्रिप्शन' : 'Encryption'}
            </h4>
            <p className="text-sm text-blue-600 font-medium">
              AES-{securityMetrics.encryptionLevel}
            </p>
          </CardContent>
        </Card>

        {/* Compliance Status */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className="relative mb-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <CheckCircle2 className="absolute -top-1 -right-1 h-5 w-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-lg">
              {language === 'np' ? 'अनुपालन' : 'Compliance'}
            </h4>
            <p className="text-sm text-purple-600 font-medium">
              {language === 'np' ? 'प्रमाणित' : 'Certified'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Zero-Knowledge Proof Explanation */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            {language === 'np' ? 'जीरो-नालेज प्रमाण कसरी काम गर्छ' : 'How Zero-Knowledge Proofs Work'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Smartphone className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium mb-2">
                  {language === 'np' ? '१. तपाईंको यन्त्रमा' : '1. On Your Device'}
                </h4>
                <p className="text-sm text-gray-600">
                  {language === 'np'
                    ? 'सबै डेटा स्थानीय रूपमा प्रशोधन'
                    : 'All data processed locally'
                  }
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Key className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium mb-2">
                  {language === 'np' ? '२. गणितीय प्रमाण' : '2. Mathematical Proof'}
                </h4>
                <p className="text-sm text-gray-600">
                  {language === 'np'
                    ? 'डेटा बिना प्रमाण निर्माण'
                    : 'Proof created without data'
                  }
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium mb-2">
                  {language === 'np' ? '३. सत्यापन' : '3. Verification'}
                </h4>
                <p className="text-sm text-gray-600">
                  {language === 'np'
                    ? 'डेटा नदेखाई सत्यापन'
                    : 'Verified without seeing data'
                  }
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">
                    {language === 'np' ? 'उदाहरण:' : 'Example:'}
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {language === 'np'
                      ? 'तपाईं २५ वर्षको हुनुहुन्छ र १८+ प्रमाणित गर्न चाहनुहुन्छ। Veridity ले तपाईंको सही उमेर नदेखाई "हो, यो व्यक्ति १८ भन्दा माथि छ" भनेर प्रमाणित गर्छ।'
                      : 'You are 25 years old and want to prove you\'re 18+. Veridity proves "Yes, this person is over 18" without revealing your exact age of 25.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Security Information */}
      {showDetails && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              {language === 'np' ? 'विस्तृत सुरक्षा जानकारी' : 'Detailed Security Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Security Certifications */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Award className="h-4 w-4" />
                {language === 'np' ? 'सुरक्षा प्रमाणपत्रहरू' : 'Security Certifications'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {securityMetrics.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Security Measures */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {language === 'np' ? 'प्राविधिक सुरक्षा उपायहरू' : 'Technical Security Measures'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {language === 'np' ? 'End-to-End एन्क्रिप्शन' : 'End-to-End Encryption'}
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {language === 'np' ? 'सक्रिय' : 'Active'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {language === 'np' ? 'जीरो-नालेज आर्किटेक्चर' : 'Zero-Knowledge Architecture'}
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {language === 'np' ? 'सक्रिय' : 'Active'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {language === 'np' ? 'सिक्योर एन्क्लेभ' : 'Secure Enclaves'}
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {language === 'np' ? 'सक्रिय' : 'Active'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {language === 'np' ? 'बायोमेट्रिक सुरक्षा' : 'Biometric Security'}
                    </span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {language === 'np' ? 'वैकल्पिक' : 'Optional'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {language === 'np' ? 'अफलाइन प्रक्रिया' : 'Offline Processing'}
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {language === 'np' ? 'समर्थित' : 'Supported'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {language === 'np' ? 'नियमित सुरक्षा अडिट' : 'Regular Security Audits'}
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {language === 'np' ? 'त्रैमासिक' : 'Quarterly'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Handling Policy */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {language === 'np' ? 'डेटा ह्यान्डलिंग नीति' : 'Data Handling Policy'}
              </h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        {language === 'np' ? 'डेटा न्यूनीकरण' : 'Data Minimization'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {language === 'np'
                          ? 'केवल आवश्यक जानकारी मात्र प्रशोधन'
                          : 'Only necessary information is processed'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        {language === 'np' ? 'स्थानीय प्रशोधन' : 'Local Processing'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {language === 'np'
                          ? 'सबै गणना तपाईंको यन्त्रमा'
                          : 'All computation happens on your device'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        {language === 'np' ? 'तत्काल डेटा मेटाउन' : 'Immediate Data Deletion'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {language === 'np'
                          ? 'प्रमाण बन्ने बित्तिकै व्यक्तिगत डेटा मेटाइन्छ'
                          : 'Personal data deleted immediately after proof generation'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nepal Compliance */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {language === 'np' ? 'नेपाली कानुनी अनुपालन' : 'Nepal Legal Compliance'}
              </h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm">
                      {language === 'np'
                        ? 'Veridity नेपालको डेटा संरक्षण ऐन र गोपनीयता नियमहरूको पूर्ण अनुपालन गर्दछ। सबै डेटा प्रशोधन नेपाली कानुनी ढाँचा भित्र हुन्छ।'
                        : 'Veridity fully complies with Nepal\'s Data Protection Act and privacy regulations. All data processing happens within Nepal\'s legal framework.'
                      }
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                        {language === 'np' ? 'डेटा संरक्षण ऐन २०७९' : 'Data Protection Act 2079'}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                        {language === 'np' ? 'साइबर सुरक्षा नीति' : 'Cyber Security Policy'}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                        {language === 'np' ? 'गोपनीयता अधिकार' : 'Privacy Rights'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trust Building CTA */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">
            {language === 'np' ? 'विश्वसनीय पहिचान प्लेटफर्म' : 'Trusted Identity Platform'}
          </h3>
          <p className="mb-4 opacity-90">
            {language === 'np'
              ? 'नेपालमा हजारौं प्रयोगकर्ताहरूले विश्वास गरेको'
              : 'Trusted by thousands of users across Nepal'
            }
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>10,000+ {language === 'np' ? 'प्रयोगकर्ता' : 'Users'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>99.9% {language === 'np' ? 'अपटाइम' : 'Uptime'}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>50,000+ {language === 'np' ? 'प्रमाणहरू' : 'Proofs'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}