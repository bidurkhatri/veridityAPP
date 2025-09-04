import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AppHeader } from "@/components/AppHeader";
import { useTranslation, type Language } from "@/lib/i18n";
import { 
  HelpCircle, 
  Book, 
  MessageSquare, 
  Phone, 
  Mail, 
  Shield, 
  FileText,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Clock
} from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  questionNepali: string;
  answer: string;
  answerNepali: string;
  category: string;
}

export default function Help() {
  const [language, setLanguage] = useState<Language>('en');
  const { t } = useTranslation(language);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'What is Zero-Knowledge Proof and how does it protect my privacy?',
      questionNepali: 'Zero-Knowledge Proof के हो र यसले मेरो गोपनीयतालाई कसरी सुरक्षा गर्छ?',
      answer: 'Zero-Knowledge Proof allows you to prove something is true without revealing the actual information. For example, you can prove you are over 18 without sharing your exact age or birth date.',
      answerNepali: 'Zero-Knowledge Proof ले तपाईंलाई वास्तविक जानकारी नखुलाई केहि सत्य छ भनेर प्रमाणित गर्न अनुमति दिन्छ। उदाहरणका लागि, तपाईं आफ्नो सही उमेर वा जन्म मिति नभनी १८ वर्ष भन्दा माथि छु भनेर प्रमाणित गर्न सक्नुहुन्छ।',
      category: 'privacy'
    },
    {
      id: '2',
      question: 'How do I generate my first identity proof?',
      questionNepali: 'मैले मेरो पहिलो पहिचान प्रमाण कसरी बनाउने?',
      answer: 'Go to "Generate Proof" from the dashboard, select the type of proof you need (age, citizenship, education, etc.), upload required documents, and follow the guided steps.',
      answerNepali: 'ड्यासबोर्डबाट "Generate Proof" मा जानुहोस्, तपाईंलाई चाहिने प्रमाणको प्रकार छान्नुहोस् (उमेर, नागरिकता, शिक्षा, आदि), आवश्यक कागजातहरू अपलोड गर्नुहोस्, र निर्देशित चरणहरू पछ्याउनुहोस्।',
      category: 'getting-started'
    },
    {
      id: '3',
      question: 'How do organizations verify my proofs?',
      questionNepali: 'संस्थाहरूले मेरा प्रमाणहरू कसरी प्रमाणित गर्छन्?',
      answer: 'You can share a QR code or secure link. Organizations scan the code or access the link to instantly verify your proof without seeing your personal data.',
      answerNepali: 'तपाईं QR कोड वा सुरक्षित लिङ्क साझा गर्न सक्नुहुन्छ। संस्थाहरूले कोड स्क्यान गर्छन् वा लिङ्कमा पहुँच गरेर तपाईंको व्यक्तिगत डेटा नहेरी तुरुन्तै तपाईंको प्रमाण प्रमाणित गर्छन्।',
      category: 'verification'
    },
    {
      id: '4',
      question: 'Is my data stored on Veridity servers?',
      questionNepali: 'के मेरो डेटा Veridity सर्भरहरूमा भण्डारण गरिएको छ?',
      answer: 'No. Your personal documents and data are processed locally on your device and deleted immediately after proof generation. Only cryptographic proofs are stored, which cannot reveal your personal information.',
      answerNepali: 'होइन। तपाईंको व्यक्तिगत कागजातहरू र डेटा तपाईंको उपकरणमा स्थानीय रूपमा प्रशोधन गरिन्छ र प्रमाण उत्पादन पछि तुरुन्तै मेटाइन्छ। केवल cryptographic प्रमाणहरू भण्डारण गरिन्छ, जसले तपाईंको व्यक्तिगत जानकारी खुलाउन सक्दैन।',
      category: 'privacy'
    },
    {
      id: '5',
      question: 'What if I lose access to my proofs?',
      questionNepali: 'यदि मैले मेरा प्रमाणहरूमा पहुँच गुमाएँ भने के हुन्छ?',
      answer: 'You can use the backup and recovery feature in Settings to restore your proofs. We recommend enabling automatic backups for seamless access across devices.',
      answerNepali: 'तपाईं आफ्ना प्रमाणहरू पुनर्स्थापना गर्न सेटिङहरूमा ब्याकअप र रिकभरी सुविधा प्रयोग गर्न सक्नुहुन्छ। हामी उपकरणहरूमा निर्बाध पहुँचका लागि स्वचालित ब्याकअप सक्षम गर्न सिफारिस गर्छौं।',
      category: 'troubleshooting'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const searchText = searchQuery.toLowerCase();
    const question = (language === 'np' ? faq.questionNepali : faq.question).toLowerCase();
    const answer = (language === 'np' ? faq.answerNepali : faq.answer).toLowerCase();
    return question.includes(searchText) || answer.includes(searchText);
  });

  const handleContactSubmit = () => {
    // TODO: Implement contact form submission
    console.log('Contact form submitted:', contactForm);
  };

  return (
    <div className="min-h-screen bg-background apple-blur-bg">
      <AppHeader 
        title={t('nav.help')}
        type="secondary"
        showLanguageSwitcher
        onLanguageChange={setLanguage}
        currentLanguage={language}
      />

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-8">
        {/* Search */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'np' ? 'प्रश्न खोज्नुहोस्...' : 'Search for help...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-help"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="apple-card apple-glass border-0 apple-shadow cursor-pointer hover:scale-105 transition-transform">
            <CardContent className="p-6 text-center">
              <Book className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-2">User Guide</h3>
              <p className="text-sm text-muted-foreground">Step-by-step tutorials</p>
            </CardContent>
          </Card>

          <Card className="apple-card apple-glass border-0 apple-shadow cursor-pointer hover:scale-105 transition-transform">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-secondary mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Get instant help</p>
            </CardContent>
          </Card>

          <Card className="apple-card apple-glass border-0 apple-shadow cursor-pointer hover:scale-105 transition-transform">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-2">Security Guide</h3>
              <p className="text-sm text-muted-foreground">Privacy best practices</p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <HelpCircle className="mr-3 h-6 w-6 text-primary" />
              {language === 'np' ? 'बारम्बार सोधिने प्रश्नहरू' : 'Frequently Asked Questions'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="border border-border/20 rounded-lg">
                <button
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/20 transition-colors"
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  data-testid={`faq-question-${faq.id}`}
                >
                  <span className="font-medium text-foreground">
                    {language === 'np' ? faq.questionNepali : faq.question}
                  </span>
                  {expandedFAQ === faq.id ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                
                {expandedFAQ === faq.id && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border/20">
                    <div className="pt-3">
                      {language === 'np' ? faq.answerNepali : faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <MessageSquare className="mr-3 h-6 w-6 text-primary" />
              {language === 'np' ? 'सम्पर्क सहायता' : 'Contact Support'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contact Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-muted/20 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Email Support</p>
                  <p className="text-sm text-muted-foreground">help@veridity.np</p>
                  <Badge variant="secondary" className="mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    24-48 hours
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-muted/20 rounded-lg">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+977-1-4444-5555</p>
                  <Badge variant="secondary" className="mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    9 AM - 6 PM
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">
                {language === 'np' ? 'हामीलाई सन्देश पठाउनुहोस्' : 'Send us a message'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder={language === 'np' ? 'तपाईंको नाम' : 'Your name'}
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  data-testid="input-contact-name"
                />
                <Input
                  type="email"
                  placeholder={language === 'np' ? 'तपाईंको इमेल' : 'Your email'}
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  data-testid="input-contact-email"
                />
              </div>
              
              <Input
                placeholder={language === 'np' ? 'विषय' : 'Subject'}
                value={contactForm.subject}
                onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                data-testid="input-contact-subject"
              />
              
              <Textarea
                placeholder={language === 'np' ? 'तपाईंको सन्देश...' : 'Your message...'}
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                data-testid="textarea-contact-message"
              />
              
              <Button 
                onClick={handleContactSubmit}
                className="apple-gradient apple-button border-0 shadow-lg"
                data-testid="button-send-message"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {language === 'np' ? 'सन्देश पठाउनुहोस्' : 'Send Message'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Book className="mr-3 h-6 w-6 text-primary" />
              {language === 'np' ? 'उपयोगी स्रोतहरू' : 'Helpful Resources'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="justify-start h-auto p-3"
                  data-testid="link-user-guide"
                >
                  <FileText className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">User Guide</div>
                    <div className="text-xs text-muted-foreground">Complete setup and usage</div>
                  </div>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>

                <Button 
                  variant="ghost" 
                  className="justify-start h-auto p-3"
                  data-testid="link-privacy-policy"
                >
                  <Shield className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Privacy Policy</div>
                    <div className="text-xs text-muted-foreground">How we protect your data</div>
                  </div>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
              </div>

              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="justify-start h-auto p-3"
                  data-testid="link-security-guide"
                >
                  <Shield className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Security Best Practices</div>
                    <div className="text-xs text-muted-foreground">Keep your identity safe</div>
                  </div>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>

                <Button 
                  variant="ghost" 
                  className="justify-start h-auto p-3"
                  data-testid="link-developer-docs"
                >
                  <FileText className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Developer Documentation</div>
                    <div className="text-xs text-muted-foreground">Integration guides for organizations</div>
                  </div>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'np' ? 'प्रणाली स्थिति' : 'System Status'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Identity Verification</span>
                <Badge className="bg-green-500 text-white">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Government Integration</span>
                <Badge className="bg-green-500 text-white">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mobile App</span>
                <Badge className="bg-green-500 text-white">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">QR Code Service</span>
                <Badge className="bg-green-500 text-white">Operational</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}