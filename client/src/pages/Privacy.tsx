import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppHeader } from "@/components/AppHeader";
import { useTranslation, type Language } from "@/lib/i18n";
import { Shield, Eye, Lock, Database, FileText, Globe, Calendar } from "lucide-react";

export default function Privacy() {
  const [language, setLanguage] = useState<Language>('en');
  const { t } = useTranslation(language);

  const lastUpdated = "September 1, 2025";

  return (
    <div className="min-h-screen bg-background apple-blur-bg">
      <AppHeader 
        title={language === 'np' ? 'गोपनीयता नीति' : 'Privacy Policy'}
        type="secondary"
        showLanguageSwitcher
        onLanguageChange={setLanguage}
        currentLanguage={language}
      />

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Last Updated */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardContent className="p-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              {language === 'np' ? 'अन्तिम अपडेट:' : 'Last updated:'} {lastUpdated}
            </div>
          </CardContent>
        </Card>

        {/* Introduction */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Shield className="mr-3 h-6 w-6 text-primary" />
              {language === 'np' ? 'हाम्रो प्रतिबद्धता' : 'Our Commitment'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            {language === 'np' ? (
              <>
                <p>
                  Veridity मा, तपाईंको गोपनीयता हाम्रो सर्वोच्च प्राथमिकता हो। हामी Zero-Knowledge Proof प्रविधि प्रयोग गरेर 
                  तपाईंको व्यक्तिगत जानकारी सुरक्षित राख्छौं र यो कहिल्यै हाम्रो सर्भरमा भण्डारण गर्दैनौं।
                </p>
                <p>
                  हाम्रो प्लेटफर्म नेपालको डाटा सुरक्षा कानून र अन्तर्राष्ट्रिय गोपनीयता मापदण्डहरूको पालना गर्छ।
                </p>
              </>
            ) : (
              <>
                <p>
                  At Veridity, your privacy is our highest priority. We use Zero-Knowledge Proof technology 
                  to protect your personal information and never store it on our servers.
                </p>
                <p>
                  Our platform complies with Nepal's data protection laws and international privacy standards 
                  to ensure your digital identity remains secure and private.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Zero-Knowledge Technology */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Lock className="mr-3 h-6 w-6 text-primary" />
              {language === 'np' ? 'Zero-Knowledge प्रविधि' : 'Zero-Knowledge Technology'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            {language === 'np' ? (
              <>
                <h4 className="font-medium text-foreground">तपाईंको डेटा कहिल्यै हाम्रो पास छैन:</h4>
                <ul className="space-y-2 ml-4">
                  <li>• व्यक्तिगत कागजातहरू तपाईंको उपकरणमै प्रशोधन गरिन्छ</li>
                  <li>• केवल गणितीय प्रमाणहरू सिर्जना गरिन्छ</li>
                  <li>• मूल डेटा तुरुन्तै मेटाइन्छ</li>
                  <li>• सर्भरले केवल "हो/होइन" जवाफ प्राप्त गर्छ</li>
                </ul>
              </>
            ) : (
              <>
                <h4 className="font-medium text-foreground">Your data never leaves your control:</h4>
                <ul className="space-y-2 ml-4">
                  <li>• Personal documents are processed on your device only</li>
                  <li>• Only mathematical proofs are generated</li>
                  <li>• Original data is immediately deleted</li>
                  <li>• Servers only receive "yes/no" answers</li>
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        {/* Data We Collect */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Database className="mr-3 h-6 w-6 text-primary" />
              {language === 'np' ? 'हामी के जम्मा गर्छौं' : 'What We Collect'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            {language === 'np' ? (
              <>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">✅ हामी जम्मा गर्ने:</h4>
                  <ul className="space-y-1 ml-4">
                    <li>• खाता जानकारी (इमेल, नाम)</li>
                    <li>• प्रमाण मेटाडेटा (प्रकार, मिति, अवस्था)</li>
                    <li>• उपयोग तथ्याङ्क (कुनै व्यक्तिगत डेटा बिना)</li>
                    <li>• डिभाइस जानकारी (सुरक्षाका लागि)</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">❌ हामी कहिल्यै जम्मा नगर्ने:</h4>
                  <ul className="space-y-1 ml-4">
                    <li>• व्यक्तिगत कागजातहरू</li>
                    <li>• नागरिकता नम्बर, जन्म मिति</li>
                    <li>• शैक्षिक प्रमाणपत्र विवरण</li>
                    <li>• आय वा बैंक खाता जानकारी</li>
                    <li>• ठेगाना वा स्थान डेटा</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">✅ What we collect:</h4>
                  <ul className="space-y-1 ml-4">
                    <li>• Account information (email, name)</li>
                    <li>• Proof metadata (type, date, status)</li>
                    <li>• Usage analytics (no personal data)</li>
                    <li>• Device information (for security)</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">❌ What we never collect:</h4>
                  <ul className="space-y-1 ml-4">
                    <li>• Personal documents or certificates</li>
                    <li>• Citizenship numbers, birth dates</li>
                    <li>• Educational certificate details</li>
                    <li>• Income or bank account information</li>
                    <li>• Address or location data</li>
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Eye className="mr-3 h-6 w-6 text-primary" />
              {language === 'np' ? 'तपाईंका अधिकारहरू' : 'Your Rights'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            {language === 'np' ? (
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <span className="font-medium text-primary">•</span>
                  <span><strong>पहुँच अधिकार:</strong> तपाईं कुनै पनि समयमा आफ्नो डेटा हेर्न र डाउनलोड गर्न सक्नुहुन्छ</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-medium text-primary">•</span>
                  <span><strong>मेटाउने अधिकार:</strong> तपाईं कुनै पनि समयमा आफ्नो खाता र सबै डेटा मेटाउन सक्नुहुन्छ</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-medium text-primary">•</span>
                  <span><strong>नियन्त्रण अधिकार:</strong> तपाईं को तपाईंका प्रमाणहरू पहुँच गर्न सक्छ त्यो नियन्त्रण गर्न सक्नुहुन्छ</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-medium text-primary">•</span>
                  <span><strong>पोर्टेबिलिटी अधिकार:</strong> तपाईं आफ्नो डेटा अन्य सेवाहरूमा स्थानान्तरण गर्न सक्नुहुन्छ</span>
                </li>
              </ul>
            ) : (
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <span className="font-medium text-primary">•</span>
                  <span><strong>Right to Access:</strong> View and download your data at any time</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-medium text-primary">•</span>
                  <span><strong>Right to Delete:</strong> Permanently remove your account and all data</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-medium text-primary">•</span>
                  <span><strong>Right to Control:</strong> Manage who can access your proofs</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-medium text-primary">•</span>
                  <span><strong>Right to Portability:</strong> Export your data to other services</span>
                </li>
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Security Measures */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Shield className="mr-3 h-6 w-6 text-primary" />
              {language === 'np' ? 'सुरक्षा उपायहरू' : 'Security Measures'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">
                  {language === 'np' ? 'डेटा सुरक्षा' : 'Data Protection'}
                </h4>
                <ul className="space-y-1 text-sm">
                  <li>• End-to-end encryption</li>
                  <li>• {language === 'np' ? 'स्थानीय प्रशोधन' : 'Local processing only'}</li>
                  <li>• {language === 'np' ? 'स्वचालित डेटा मेटाउने' : 'Automatic data deletion'}</li>
                  <li>• {language === 'np' ? 'कुनै तेस्रो पक्ष साझेदारी छैन' : 'No third-party sharing'}</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">
                  {language === 'np' ? 'पहुँच नियन्त्रण' : 'Access Control'}
                </h4>
                <ul className="space-y-1 text-sm">
                  <li>• {language === 'np' ? 'बायोमेट्रिक प्रमाणीकरण' : 'Biometric authentication'}</li>
                  <li>• {language === 'np' ? 'समय-सीमित साझेदारी' : 'Time-limited sharing'}</li>
                  <li>• {language === 'np' ? 'ऑडिट लगिङ' : 'Audit logging'}</li>
                  <li>• {language === 'np' ? 'पहुँच निगरानी' : 'Access monitoring'}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Compliance */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileText className="mr-3 h-6 w-6 text-primary" />
              {language === 'np' ? 'कानूनी अनुपालन' : 'Legal Compliance'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            {language === 'np' ? (
              <>
                <p>Veridity निम्न कानून र नियमहरूको पालना गर्छ:</p>
                <ul className="space-y-2 ml-4">
                  <li>• नेपाल सरकारको डेटा सुरक्षा ऐन</li>
                  <li>• अन्तर्राष्ट्रिय गोपनीयता मापदण्डहरू</li>
                  <li>• डिजिटल पहिचान नियमावली</li>
                  <li>• साइबर सुरक्षा नीतिहरू</li>
                </ul>
                <p className="text-sm mt-4">
                  कुनै प्रश्न वा चिन्ता भएमा हामीलाई privacy@veridity.np मा सम्पर्क गर्नुहोस्।
                </p>
              </>
            ) : (
              <>
                <p>Veridity complies with the following laws and regulations:</p>
                <ul className="space-y-2 ml-4">
                  <li>• Nepal Government Data Protection Act</li>
                  <li>• International privacy standards</li>
                  <li>• Digital identity regulations</li>
                  <li>• Cybersecurity policies</li>
                </ul>
                <p className="text-sm mt-4">
                  For any questions or concerns, contact us at privacy@veridity.np
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Globe className="mr-3 h-6 w-6 text-primary" />
              {language === 'np' ? 'सम्पर्क जानकारी' : 'Contact Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">
                  {language === 'np' ? 'गोपनीयता अधिकारी' : 'Privacy Officer'}
                </h4>
                <p className="text-sm">privacy@veridity.np</p>
                <p className="text-sm">+977-1-4444-0001</p>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">
                  {language === 'np' ? 'कानूनी विभाग' : 'Legal Department'}
                </h4>
                <p className="text-sm">legal@veridity.np</p>
                <p className="text-sm">+977-1-4444-0002</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm">
                {language === 'np' 
                  ? 'यो गोपनीयता नीति समय-समयमा अपडेट हुन सक्छ। महत्वपूर्ण परिवर्तनहरूका लागि हामी तपाईंलाई सूचना दिनेछौं।'
                  : 'This privacy policy may be updated periodically. We will notify you of significant changes.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}