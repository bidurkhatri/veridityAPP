/**
 * Progressive Disclosure Proof Generation Wizard
 * Step-by-step guidance with contextual help and validation
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shield,
  Eye,
  FileText,
  Smartphone,
  Zap
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface WizardStep {
  id: string;
  title: string;
  titleNepali: string;
  description: string;
  descriptionNepali: string;
  icon: React.ReactNode;
  required: boolean;
  component: React.ComponentType<any>;
}

interface ProofFormData {
  proofType: string;
  personalInfo: {
    name: string;
    dateOfBirth: string;
    citizenshipNumber: string;
    province: string;
  };
  proofSpecific: {
    [key: string]: any;
  };
  privacyConsent: boolean;
  dataRetention: string;
}

export function ProofGenerationWizard({ onComplete, initialData }: {
  onComplete: (data: ProofFormData) => void;
  initialData?: Partial<ProofFormData>;
}) {
  const { t, language } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProofFormData>({
    proofType: '',
    personalInfo: {
      name: '',
      dateOfBirth: '',
      citizenshipNumber: '',
      province: ''
    },
    proofSpecific: {},
    privacyConsent: false,
    dataRetention: '1-year',
    ...initialData
  });
  const [stepValidation, setStepValidation] = useState<{ [key: number]: boolean }>({});
  const [showHelp, setShowHelp] = useState<{ [key: string]: boolean }>({});

  const wizardSteps: WizardStep[] = [
    {
      id: 'proof-type',
      title: 'Choose Proof Type',
      titleNepali: 'प्रमाण प्रकार छान्नुहोस्',
      description: 'Select the type of identity verification you need',
      descriptionNepali: 'तपाईंलाई चाहिने पहिचान प्रमाणीकरणको प्रकार चयन गर्नुहोस्',
      icon: <FileText className="h-5 w-5" />,
      required: true,
      component: ProofTypeStep
    },
    {
      id: 'basic-info',
      title: 'Basic Information',
      titleNepali: 'आधारभूत जानकारी',
      description: 'Provide your basic identity information',
      descriptionNepali: 'तपाईंको आधारभूत पहिचान जानकारी प्रदान गर्नुहोस्',
      icon: <Shield className="h-5 w-5" />,
      required: true,
      component: BasicInfoStep
    },
    {
      id: 'proof-details',
      title: 'Proof Details',
      titleNepali: 'प्रमाण विवरण',
      description: 'Specific details for your chosen proof type',
      descriptionNepali: 'तपाईंले चयन गर्नुभएको प्रमाण प्रकारका विशिष्ट विवरणहरू',
      icon: <Zap className="h-5 w-5" />,
      required: true,
      component: ProofDetailsStep
    },
    {
      id: 'privacy-consent',
      title: 'Privacy & Consent',
      titleNepali: 'गोपनीयता र सहमति',
      description: 'Review privacy policy and give consent',
      descriptionNepali: 'गोपनीयता नीति समीक्षा गर्नुहोस् र सहमति दिनुहोस्',
      icon: <Eye className="h-5 w-5" />,
      required: true,
      component: PrivacyConsentStep
    },
    {
      id: 'review-generate',
      title: 'Review & Generate',
      titleNepali: 'समीक्षा र उत्पादन',
      description: 'Review your information and generate proof',
      descriptionNepali: 'तपाईंको जानकारी समीक्षा गर्नुहोस् र प्रमाण उत्पादन गर्नुहोस्',
      icon: <CheckCircle2 className="h-5 w-5" />,
      required: true,
      component: ReviewGenerateStep
    }
  ];

  useEffect(() => {
    // Validate current step whenever form data changes
    validateCurrentStep();
  }, [formData, currentStep]);

  const validateCurrentStep = () => {
    const step = wizardSteps[currentStep];
    let isValid = false;

    switch (step.id) {
      case 'proof-type':
        isValid = !!formData.proofType;
        break;
      case 'basic-info':
        isValid = !!(formData.personalInfo.name && 
                     formData.personalInfo.dateOfBirth && 
                     formData.personalInfo.citizenshipNumber && 
                     formData.personalInfo.province);
        break;
      case 'proof-details':
        isValid = validateProofSpecificData();
        break;
      case 'privacy-consent':
        isValid = formData.privacyConsent;
        break;
      case 'review-generate':
        isValid = true; // Always valid at review stage
        break;
    }

    setStepValidation(prev => ({ ...prev, [currentStep]: isValid }));
  };

  const validateProofSpecificData = () => {
    switch (formData.proofType) {
      case 'age_verification':
        return !!formData.proofSpecific.minimumAge;
      case 'income_verification':
        return !!(formData.proofSpecific.monthlyIncome && formData.proofSpecific.incomeThreshold);
      case 'education_verification':
        return !!(formData.proofSpecific.educationLevel && formData.proofSpecific.institution);
      case 'citizenship_verification':
        return true; // Basic info is sufficient
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < wizardSteps.length - 1 && stepValidation[currentStep]) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof ProofFormData], ...data }
    }));
  };

  const toggleHelp = (stepId: string) => {
    setShowHelp(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const progress = ((currentStep + 1) / wizardSteps.length) * 100;
  const currentStepData = wizardSteps[currentStep];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">
            {language === 'np' ? 'प्रमाण बनाउने गाइड' : 'Proof Generation Guide'}
          </h1>
          <Badge variant="outline" className="px-3 py-1">
            {currentStep + 1} / {wizardSteps.length}
          </Badge>
        </div>
        
        <Progress value={progress} className="h-2 mb-4" />
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <currentStepData.icon />
          <span>
            {language === 'np' ? currentStepData.titleNepali : currentStepData.title}
          </span>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {wizardSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  index < currentStep
                    ? 'bg-green-600 text-white'
                    : index === currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < wizardSteps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {currentStepData.icon}
                {language === 'np' ? currentStepData.titleNepali : currentStepData.title}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {language === 'np' ? currentStepData.descriptionNepali : currentStepData.description}
              </p>
            </div>
            <Button
              variant="quiet"
              size="sm"
              onClick={() => toggleHelp(currentStepData.id)}
              className="text-blue-600"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Help Section */}
          {showHelp[currentStepData.id] && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <HelpContent stepId={currentStepData.id} />
              </AlertDescription>
            </Alert>
          )}

          {/* Step Component */}
          <currentStepData.component
            formData={formData}
            updateFormData={updateFormData}
            language={language}
          />

          {/* Validation Error */}
          {currentStepData.required && stepValidation[currentStep] === false && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {language === 'np' 
                  ? 'कृपया सबै आवश्यक फिल्डहरू भर्नुहोस्'
                  : 'Please fill in all required fields to continue'
                }
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          {language === 'np' ? 'पछाडि' : 'Back'}
        </Button>

        {currentStep === wizardSteps.length - 1 ? (
          <Button
            onClick={() => onComplete(formData)}
            disabled={!stepValidation[currentStep]}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Shield className="h-4 w-4" />
            {language === 'np' ? 'प्रमाण बनाउनुहोस्' : 'Generate Proof'}
          </Button>
        ) : (
          <Button
            onClick={nextStep}
            disabled={!stepValidation[currentStep]}
            className="flex items-center gap-2"
          >
            {language === 'np' ? 'अगाडि' : 'Next'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Step Components
function ProofTypeStep({ formData, updateFormData, language }: any) {
  const proofTypes = [
    {
      id: 'age_verification',
      title: 'Age Verification',
      titleNepali: 'उमेर प्रमाणीकरण',
      description: 'Prove you meet age requirements without revealing exact age',
      descriptionNepali: 'सही उमेर प्रकट नगरी उमेर आवश्यकता पूरा गरेको प्रमाणित गर्नुहोस्',
      icon: '🎂',
      useCase: 'Banking, Government services, Online platforms'
    },
    {
      id: 'citizenship_verification',
      title: 'Citizenship Verification',
      titleNepali: 'नागरिकता प्रमाणीकरण',
      description: 'Verify Nepali citizenship for government services',
      descriptionNepali: 'सरकारी सेवाहरूको लागि नेपाली नागरिकता प्रमाणित गर्नुहोस्',
      icon: '🏛️',
      useCase: 'Government services, Voting, Official documents'
    },
    {
      id: 'income_verification',
      title: 'Income Verification',
      titleNepali: 'आम्दानी प्रमाणीकरण',
      description: 'Prove income eligibility for loans and services',
      descriptionNepali: 'ऋण र सेवाहरूको लागि आम्दानी योग्यता प्रमाणित गर्नुहोस्',
      icon: '💰',
      useCase: 'Bank loans, Credit cards, Housing'
    },
    {
      id: 'education_verification',
      title: 'Education Verification',
      titleNepali: 'शिक्षा प्रमाणीकरण',
      description: 'Verify academic qualifications privately',
      descriptionNepali: 'शैक्षिक योग्यताहरू निजी रूपमा प्रमाणित गर्नुहोस्',
      icon: '🎓',
      useCase: 'Job applications, University admissions, Scholarships'
    }
  ];

  return (
    <div className="space-y-4">
      {proofTypes.map((type) => (
        <Card
          key={type.id}
          className={`cursor-pointer transition-all border-2 ${
            formData.proofType === type.id
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
          onClick={() => updateFormData('proofType', type.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="text-3xl">{type.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {language === 'np' ? type.titleNepali : type.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {language === 'np' ? type.descriptionNepali : type.description}
                </p>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {language === 'np' ? 'उपयोग:' : 'Use case:'} {type.useCase}
                  </Badge>
                </div>
              </div>
              {formData.proofType === type.id && (
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BasicInfoStep({ formData, updateFormData, language }: any) {
  const nepalProvinces = [
    { id: 'province1', name: 'Province 1', nameNepali: 'प्रदेश नं. १' },
    { id: 'madhesh', name: 'Madhesh Pradesh', nameNepali: 'मधेस प्रदेश' },
    { id: 'bagmati', name: 'Bagmati Pradesh', nameNepali: 'बागमती प्रदेश' },
    { id: 'gandaki', name: 'Gandaki Pradesh', nameNepali: 'गण्डकी प्रदेश' },
    { id: 'lumbini', name: 'Lumbini Pradesh', nameNepali: 'लुम्बिनी प्रदेश' },
    { id: 'karnali', name: 'Karnali Pradesh', nameNepali: 'कर्णाली प्रदेश' },
    { id: 'sudurpaschim', name: 'Sudurpashchim Pradesh', nameNepali: 'सुदूरपश्चिम प्रदेश' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="name">
          {language === 'np' ? 'पूरा नाम' : 'Full Name'} *
        </Label>
        <Input
          id="name"
          value={formData.personalInfo.name}
          onChange={(e) => updateFormData('personalInfo', { name: e.target.value })}
          placeholder={language === 'np' ? 'तपाईंको पूरा नाम' : 'Your full name'}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="dob">
          {language === 'np' ? 'जन्म मिति' : 'Date of Birth'} *
        </Label>
        <Input
          id="dob"
          type="date"
          value={formData.personalInfo.dateOfBirth}
          onChange={(e) => updateFormData('personalInfo', { dateOfBirth: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="citizenship">
          {language === 'np' ? 'नागरिकता नम्बर' : 'Citizenship Number'} *
        </Label>
        <Input
          id="citizenship"
          value={formData.personalInfo.citizenshipNumber}
          onChange={(e) => updateFormData('personalInfo', { citizenshipNumber: e.target.value })}
          placeholder={language === 'np' ? '१२३४५६७८९' : '123456789'}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="province">
          {language === 'np' ? 'प्रदेश' : 'Province'} *
        </Label>
        <Select
          value={formData.personalInfo.province}
          onValueChange={(value) => updateFormData('personalInfo', { province: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={language === 'np' ? 'प्रदेश चयन गर्नुहोस्' : 'Select province'} />
          </SelectTrigger>
          <SelectContent>
            {nepalProvinces.map((province) => (
              <SelectItem key={province.id} value={province.id}>
                {language === 'np' ? province.nameNepali : province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function ProofDetailsStep({ formData, updateFormData, language }: any) {
  const renderProofSpecificFields = () => {
    switch (formData.proofType) {
      case 'age_verification':
        return (
          <div>
            <Label htmlFor="minAge">
              {language === 'np' ? 'न्यूनतम उमेर आवश्यकता' : 'Minimum Age Requirement'} *
            </Label>
            <Input
              id="minAge"
              type="number"
              value={formData.proofSpecific.minimumAge || ''}
              onChange={(e) => updateFormData('proofSpecific', { minimumAge: parseInt(e.target.value) })}
              placeholder="18"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              {language === 'np' 
                ? 'तपाईंले यो उमेर भन्दा माथि भएको प्रमाणित गर्नुहुनेछ'
                : 'You will prove you are above this age'
              }
            </p>
          </div>
        );

      case 'income_verification':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="monthlyIncome">
                {language === 'np' ? 'मासिक आम्दानी (रु.)' : 'Monthly Income (NPR)'} *
              </Label>
              <Input
                id="monthlyIncome"
                type="number"
                value={formData.proofSpecific.monthlyIncome || ''}
                onChange={(e) => updateFormData('proofSpecific', { monthlyIncome: parseInt(e.target.value) })}
                placeholder="50000"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="incomeThreshold">
                {language === 'np' ? 'आवश्यक न्यूनतम आम्दानी (रु.)' : 'Required Minimum Income (NPR)'} *
              </Label>
              <Input
                id="incomeThreshold"
                type="number"
                value={formData.proofSpecific.incomeThreshold || ''}
                onChange={(e) => updateFormData('proofSpecific', { incomeThreshold: parseInt(e.target.value) })}
                placeholder="30000"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'education_verification':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="educationLevel">
                {language === 'np' ? 'शिक्षाको तह' : 'Education Level'} *
              </Label>
              <Select
                value={formData.proofSpecific.educationLevel || ''}
                onValueChange={(value) => updateFormData('proofSpecific', { educationLevel: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={language === 'np' ? 'शिक्षाको तह चयन गर्नुहोस्' : 'Select education level'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slc">{language === 'np' ? 'SLC/SEE (कक्षा १०)' : 'SLC/SEE (Class 10)'}</SelectItem>
                  <SelectItem value="plus2">{language === 'np' ? '+२ (कक्षा १२)' : '+2 (Class 12)'}</SelectItem>
                  <SelectItem value="bachelor">{language === 'np' ? 'स्नातक' : 'Bachelor'}</SelectItem>
                  <SelectItem value="master">{language === 'np' ? 'स्नातकोत्तर' : 'Master'}</SelectItem>
                  <SelectItem value="phd">{language === 'np' ? 'पीएचडी' : 'PhD'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="institution">
                {language === 'np' ? 'शिक्षण संस्था' : 'Educational Institution'} *
              </Label>
              <Input
                id="institution"
                value={formData.proofSpecific.institution || ''}
                onChange={(e) => updateFormData('proofSpecific', { institution: e.target.value })}
                placeholder={language === 'np' ? 'त्रिभुवन विश्वविद्यालय' : 'Tribhuvan University'}
                className="mt-1"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            {language === 'np' 
              ? 'यो प्रमाण प्रकारका लागि अतिरिक्त जानकारी आवश्यक छैन'
              : 'No additional information required for this proof type'
            }
          </div>
        );
    }
  };

  return (
    <div>
      {renderProofSpecificFields()}
    </div>
  );
}

function PrivacyConsentStep({ formData, updateFormData, language }: any) {
  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <strong>
            {language === 'np' ? 'गोपनीयता आश्वासन:' : 'Privacy Guarantee:'}
          </strong>{' '}
          {language === 'np' 
            ? 'तपाईंको व्यक्तिगत डेटा कहिल्यै साझा गरिंदैन। केवल प्रमाण परिणाम मात्र साझा गरिन्छ।'
            : 'Your personal data is never shared. Only proof results are shared.'
          }
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">
            {language === 'np' ? 'डेटा प्रयोग नीति' : 'Data Usage Policy'}
          </h3>
          <div className="text-sm space-y-2 text-gray-600">
            <p>
              {language === 'np' 
                ? '• तपाईंको डेटा तपाईंको यन्त्रमा नै रहन्छ'
                : '• Your data stays on your device'
              }
            </p>
            <p>
              {language === 'np' 
                ? '• केवल जीरो-नालेज प्रमाण मात्र उत्पन्न गरिन्छ'
                : '• Only zero-knowledge proofs are generated'
              }
            </p>
            <p>
              {language === 'np' 
                ? '• कुनै व्यक्तिगत जानकारी भण्डारण गरिंदैन'
                : '• No personal information is stored'
              }
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="retention">
            {language === 'np' ? 'प्रमाण भण्डारण अवधि' : 'Proof Storage Duration'}
          </Label>
          <Select
            value={formData.dataRetention}
            onValueChange={(value) => updateFormData('dataRetention', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-week">
                {language === 'np' ? '१ हप्ता' : '1 Week'}
              </SelectItem>
              <SelectItem value="1-month">
                {language === 'np' ? '१ महिना' : '1 Month'}
              </SelectItem>
              <SelectItem value="1-year">
                {language === 'np' ? '१ वर्ष' : '1 Year'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="consent"
            checked={formData.privacyConsent}
            onCheckedChange={(checked) => updateFormData('privacyConsent', checked)}
          />
          <Label htmlFor="consent" className="text-sm leading-5">
            {language === 'np' 
              ? 'मैले गोपनीयता नीति पढेको छु र Zero-Knowledge प्रमाणीकरण प्रक्रियामा सहमत छु। मलाई थाहा छ कि मेरो व्यक्तिगत डेटा साझा गरिंदैन।'
              : 'I have read the privacy policy and agree to the Zero-Knowledge verification process. I understand that my personal data will not be shared.'
            }
          </Label>
        </div>
      </div>
    </div>
  );
}

function ReviewGenerateStep({ formData, language }: any) {
  const getProofTypeName = (type: string) => {
    const names: { [key: string]: { en: string; np: string } } = {
      'age_verification': { en: 'Age Verification', np: 'उमेर प्रमाणीकरण' },
      'citizenship_verification': { en: 'Citizenship Verification', np: 'नागरिकता प्रमाणीकरण' },
      'income_verification': { en: 'Income Verification', np: 'आम्दानी प्रमाणीकरण' },
      'education_verification': { en: 'Education Verification', np: 'शिक्षा प्रमाणीकरण' }
    };
    return language === 'np' ? names[type]?.np : names[type]?.en;
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription>
          {language === 'np' 
            ? 'सबै जानकारी पूरा भएको छ। अब प्रमाण उत्पादन गर्न तयार छ।'
            : 'All information is complete. Ready to generate proof.'
          }
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'np' ? 'प्रमाण प्रकार' : 'Proof Type'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{getProofTypeName(formData.proofType)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'np' ? 'व्यक्तिगत जानकारी' : 'Personal Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>{language === 'np' ? 'नाम:' : 'Name:'}</strong> {formData.personalInfo.name}</p>
            <p><strong>{language === 'np' ? 'प्रदेश:' : 'Province:'}</strong> {formData.personalInfo.province}</p>
          </CardContent>
        </Card>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Smartphone className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          {language === 'np' 
            ? '🔐 प्रमाण उत्पादन गर्दा तपाईंको व्यक्तिगत डेटा तपाईंको यन्त्रमा नै रहनेछ। केवल प्रमाणीकरण परिणाम मात्र साझा गरिनेछ।'
            : '🔐 During proof generation, your personal data stays on your device. Only verification results will be shared.'
          }
        </AlertDescription>
      </Alert>
    </div>
  );
}

function HelpContent({ stepId }: { stepId: string }) {
  const { language } = useTranslation();
  
  const helpContent: { [key: string]: { en: React.ReactNode; np: React.ReactNode } } = {
    'proof-type': {
      en: (
        <div>
          <p className="mb-2"><strong>Choosing the right proof type:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Age Verification:</strong> For services requiring minimum age (18+, 21+, etc.)</li>
            <li><strong>Citizenship:</strong> For government services and official processes</li>
            <li><strong>Income:</strong> For loans, credit applications, and financial services</li>
            <li><strong>Education:</strong> For job applications and academic opportunities</li>
          </ul>
        </div>
      ),
      np: (
        <div>
          <p className="mb-2"><strong>सही प्रमाण प्रकार छान्न:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>उमेर प्रमाणीकरण:</strong> न्यूनतम उमेर चाहिने सेवाहरूको लागि (१८+, २१+, आदि)</li>
            <li><strong>नागरिकता:</strong> सरकारी सेवाहरू र आधिकारिक प्रक्रियाहरूको लागि</li>
            <li><strong>आम्दानी:</strong> ऋण, क्रेडिट आवेदन र वित्तीय सेवाहरूको लागि</li>
            <li><strong>शिक्षा:</strong> जागिरको आवेदन र शैक्षिक अवसरहरूको लागि</li>
          </ul>
        </div>
      )
    },
    'basic-info': {
      en: (
        <div>
          <p className="mb-2"><strong>Required Information:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Use your legal name as it appears on official documents</li>
            <li>Date of birth should match your citizenship certificate</li>
            <li>Citizenship number from your official citizenship certificate</li>
            <li>Province where your citizenship was issued</li>
          </ul>
        </div>
      ),
      np: (
        <div>
          <p className="mb-2"><strong>आवश्यक जानकारी:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>आधिकारिक कागजातहरूमा भएको जस्तै कानुनी नाम प्रयोग गर्नुहोस्</li>
            <li>जन्म मिति तपाईंको नागरिकता प्रमाणपत्रसँग मेल खान्छ</li>
            <li>तपाईंको आधिकारिक नागरिकता प्रमाणपत्रको नागरिकता नम्बर</li>
            <li>तपाईंको नागरिकता जारी भएको प्रदेश</li>
          </ul>
        </div>
      )
    },
    'proof-details': {
      en: (
        <div>
          <p className="mb-2"><strong>Proof Details:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Age Range:</strong> Select the minimum age threshold required</li>
            <li><strong>Income Range:</strong> Choose from predefined income brackets</li>
            <li><strong>Education Level:</strong> Select highest completed level</li>
            <li><strong>Additional Requirements:</strong> Specify any other criteria needed</li>
          </ul>
          <p className="mt-2 text-sm text-muted-foreground">
            Only the minimum required information for verification will be processed.
          </p>
        </div>
      ),
      np: (
        <div>
          <p className="mb-2"><strong>प्रमाण विवरणहरू:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>उमेर दायरा:</strong> चाहिएको न्यूनतम उमेर सीमा छान्नुहोस्</li>
            <li><strong>आम्दानी दायरा:</strong> पूर्वनिर्धारित आम्दानी समूहहरूबाट छान्नुहोस्</li>
            <li><strong>शिक्षा स्तर:</strong> सबैभन्दा उच्च पूरा गरेको स्तर छान्नुहोस्</li>
            <li><strong>अतिरिक्त आवश्यकताहरू:</strong> अन्य चाहिने मापदण्डहरू निर्दिष्ट गर्नुहोस्</li>
          </ul>
          <p className="mt-2 text-sm text-muted-foreground">
            प्रमाणीकरणको लागि न्यूनतम आवश्यक जानकारी मात्र प्रशोधन गरिनेछ।
          </p>
        </div>
      )
    },
    'privacy-consent': {
      en: (
        <div>
          <p className="mb-2"><strong>Privacy & Consent:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Zero-Knowledge:</strong> Your personal data never leaves your device</li>
            <li><strong>Minimal Disclosure:</strong> Only the required proof result is shared</li>
            <li><strong>Consent Control:</strong> You decide what information to verify</li>
            <li><strong>Data Expiry:</strong> Proofs expire automatically for security</li>
          </ul>
          <p className="mt-2 text-sm text-blue-600 font-medium">
            💡 Remember: You're only sharing the fact that you meet the criteria, not your actual data.
          </p>
        </div>
      ),
      np: (
        <div>
          <p className="mb-2"><strong>गोपनीयता र सहमति:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>शून्य-ज्ञान:</strong> तपाईंको व्यक्तिगत डेटा तपाईंको यन्त्रबाट बाहिर जाँदैन</li>
            <li><strong>न्यूनतम खुलासा:</strong> केवल आवश्यक प्रमाण परिणाम साझा गरिन्छ</li>
            <li><strong>सहमति नियन्त्रण:</strong> तपाईं के जानकारी प्रमाणित गर्ने निर्णय गर्नुहुन्छ</li>
            <li><strong>डेटा समाप्ति:</strong> सुरक्षाको लागि प्रमाणहरू स्वचालित रूपमा समाप्त हुन्छन्</li>
          </ul>
          <p className="mt-2 text-sm text-blue-600 font-medium">
            💡 सम्झनुहोस्: तपाईं केवल मापदण्ड पूरा गर्ने तथ्य साझा गर्दै हुनुहुन्छ, तपाईंको वास्तविक डेटा होइन।
          </p>
        </div>
      )
    },
    'review-generate': {
      en: (
        <div>
          <p className="mb-2"><strong>Review & Generate:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Final Check:</strong> Verify all information is correct</li>
            <li><strong>Processing Time:</strong> Usually takes 10-30 seconds</li>
            <li><strong>QR Code:</strong> Your proof will be generated as a secure QR code</li>
            <li><strong>Sharing:</strong> Present the QR code to the requesting organization</li>
          </ul>
          <p className="mt-2 text-sm text-green-600 font-medium">
            ✅ Once generated, your proof is cryptographically secure and verifiable.
          </p>
        </div>
      ),
      np: (
        <div>
          <p className="mb-2"><strong>समीक्षा र उत्पादन:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>अन्तिम जाँच:</strong> सबै जानकारी सही छ भनेर प्रमाणित गर्नुहोस्</li>
            <li><strong>प्रशोधन समय:</strong> सामान्यतया १०-३० सेकेन्ड लाग्छ</li>
            <li><strong>QR कोड:</strong> तपाईंको प्रमाण सुरक्षित QR कोडको रूपमा उत्पन्न हुनेछ</li>
            <li><strong>साझाकरण:</strong> अनुरोध गर्ने संस्थालाई QR कोड प्रस्तुत गर्नुहोस्</li>
          </ul>
          <p className="mt-2 text-sm text-green-600 font-medium">
            ✅ एक पटक उत्पन्न भएपछि, तपाईंको प्रमाण क्रिप्टोग्राफिक रूपमा सुरक्षित र प्रमाणित गर्न मिल्ने छ।
          </p>
        </div>
      )
    }
  };

  const content = helpContent[stepId];
  return content ? (language === 'np' ? content.np : content.en) : null;
}