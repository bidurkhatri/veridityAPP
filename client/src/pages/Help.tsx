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
    <div className="min-h-screen bg-canvas bg-gradient-subtle">
      <AppHeader 
        title={t('nav.help')}
        type="secondary"
        showLanguageSwitcher
        onLanguageChange={setLanguage}
        currentLanguage={language}
      />

      <main className="container mx-auto px-6 py-8 max-w-4xl space-y-12 fade-in">
        {/* Search */}
        <Card className="card-base elevation-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <Input
                placeholder={language === 'np' ? 'प्रश्न खोज्नुहोस्...' : 'Search for help...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-surface border-border-default focus:border-brand-600 focus:ring-2 focus:ring-brand-200 focus:ring-opacity-50"
                data-testid="input-search-help"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-base card-interactive elevation-sm cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Book className="h-6 w-6 text-brand-700" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">User Guide</h3>
              <p className="text-sm text-text-secondary">Step-by-step tutorials</p>
            </CardContent>
          </Card>

          <Card className="card-base card-interactive elevation-sm cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-success-700" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Live Chat</h3>
              <p className="text-sm text-text-secondary">Get instant help</p>
            </CardContent>
          </Card>

          <Card className="card-base card-interactive elevation-sm cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-info-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-info-700" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Security Guide</h3>
              <p className="text-sm text-text-secondary">Privacy best practices</p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="card-base elevation-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center mr-3">
                <HelpCircle className="h-5 w-5 text-brand-700" />
              </div>
              {language === 'np' ? 'बारम्बार सोधिने प्रश्नहरू' : 'Frequently Asked Questions'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="border border-border-subtle rounded-lg overflow-hidden">
                <button
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-surface-secondary transition-all btn-base"
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  data-testid={`faq-question-${faq.id}`}
                >
                  <span className="font-medium text-text-primary">
                    {language === 'np' ? faq.questionNepali : faq.question}
                  </span>
                  {expandedFAQ === faq.id ? (
                    <ChevronDown className="h-4 w-4 text-text-tertiary" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-text-tertiary" />
                  )}
                </button>
                
                {expandedFAQ === faq.id && (
                  <div className="px-4 pb-4 text-sm text-text-secondary border-t border-border-subtle bg-surface-secondary/50">
                    <div className="pt-3 leading-relaxed">
                      {language === 'np' ? faq.answerNepali : faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="card-base elevation-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center mr-3">
                <MessageSquare className="h-5 w-5 text-success-700" />
              </div>
              {language === 'np' ? 'सम्पर्क सहायता' : 'Contact Support'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Contact Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4 p-4 bg-surface-secondary rounded-xl border border-border-subtle">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-brand-700" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-text-primary">Email Support</p>
                  <p className="text-sm text-text-secondary">help@veridity.np</p>
                  <Badge variant="secondary" className="mt-2 bg-neutral-100 text-neutral-700 border-neutral-200">
                    <Clock className="h-3 w-3 mr-1" />
                    24-48 hours
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-surface-secondary rounded-xl border border-border-subtle">
                <div className="w-10 h-10 bg-info-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-info-700" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-text-primary">Phone Support</p>
                  <p className="text-sm text-text-secondary">+977-1-4444-5555</p>
                  <Badge variant="secondary" className="mt-2 bg-neutral-100 text-neutral-700 border-neutral-200">
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
                className="btn-base brand-primary elevation-sm hover:elevation-md transition-all"
                data-testid="button-send-message"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {language === 'np' ? 'सन्देश पठाउनुहोस्' : 'Send Message'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card className="card-base elevation-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <div className="w-8 h-8 bg-info-100 rounded-lg flex items-center justify-center mr-3">
                <Book className="h-5 w-5 text-info-700" />
              </div>
              {language === 'np' ? 'उपयोगी स्रोतहरू' : 'Helpful Resources'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="justify-start h-auto p-4 hover:bg-surface-secondary transition-all btn-base"
                  data-testid="link-user-guide"
                >
                  <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="h-4 w-4 text-brand-600" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-text-primary">User Guide</div>
                    <div className="text-xs text-text-tertiary">Complete setup and usage</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-text-quaternary" />
                </Button>

                <Button 
                  variant="ghost" 
                  className="justify-start h-auto p-4 hover:bg-surface-secondary transition-all btn-base"
                  data-testid="link-privacy-policy"
                >
                  <div className="w-8 h-8 bg-success-50 rounded-lg flex items-center justify-center mr-3">
                    <Shield className="h-4 w-4 text-success-600" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-text-primary">Privacy Policy</div>
                    <div className="text-xs text-text-tertiary">How we protect your data</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-text-quaternary" />
                </Button>
              </div>

              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="justify-start h-auto p-4 hover:bg-surface-secondary transition-all btn-base"
                  data-testid="link-security-guide"
                >
                  <div className="w-8 h-8 bg-warning-50 rounded-lg flex items-center justify-center mr-3">
                    <Shield className="h-4 w-4 text-warning-600" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-text-primary">Security Best Practices</div>
                    <div className="text-xs text-text-tertiary">Keep your identity safe</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-text-quaternary" />
                </Button>

                <Button 
                  variant="ghost" 
                  className="justify-start h-auto p-4 hover:bg-surface-secondary transition-all btn-base"
                  data-testid="link-developer-docs"
                >
                  <div className="w-8 h-8 bg-info-50 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="h-4 w-4 text-info-600" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-text-primary">Developer Documentation</div>
                    <div className="text-xs text-text-tertiary">Integration guides for organizations</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-text-quaternary" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="card-base elevation-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center mr-3">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
              </div>
              {language === 'np' ? 'प्रणाली स्थिति' : 'System Status'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                <span className="text-sm font-medium text-text-primary">Identity Verification</span>
                <Badge className="bg-success-500 text-text-inverse border-0 px-3 py-1">Operational</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                <span className="text-sm font-medium text-text-primary">Government Integration</span>
                <Badge className="bg-success-500 text-text-inverse border-0 px-3 py-1">Operational</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                <span className="text-sm font-medium text-text-primary">Mobile App</span>
                <Badge className="bg-success-500 text-text-inverse border-0 px-3 py-1">Operational</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                <span className="text-sm font-medium text-text-primary">QR Code Service</span>
                <Badge className="bg-success-500 text-text-inverse border-0 px-3 py-1">Operational</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}