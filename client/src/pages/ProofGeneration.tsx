import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation, type Language } from "@/lib/i18n";
import { Shield, Settings, Lock, Calendar, Flag, GraduationCap, Banknote, MapPin, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function ProofGeneration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [language, setLanguage] = useState<Language>('en');
  const { t } = useTranslation(language);

  // Form state
  const [selectedProofType, setSelectedProofType] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch proof types
  const { data: proofTypes = [] } = useQuery<any[]>({
    queryKey: ['/api/proof-types'],
  });

  // Proof generation mutation
  const generateProofMutation = useMutation({
    mutationFn: async (data: { proofTypeId: string; privateInputs: any }) => {
      const response = await apiRequest('POST', '/api/proofs/generate', data);
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: t('message.proofGenerated'),
        description: `Proof ID: ${result.id.slice(0, 8)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/proofs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/user'] });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProofTypeChange = (proofTypeId: string) => {
    setSelectedProofType(proofTypeId);
    setFormData({});
    setCurrentStep(2);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!selectedProofType) {
      toast({
        title: "Error",
        description: "Please select a proof type",
        variant: "destructive",
      });
      return;
    }

    generateProofMutation.mutate({
      proofTypeId: selectedProofType,
      privateInputs: formData,
    });
  };

  const selectedType = proofTypes.find((pt: any) => pt.id === selectedProofType);

  const proofIcons = {
    age_verification: Calendar,
    citizenship_verification: Flag,
    education_verification: GraduationCap,
    income_verification: Banknote,
    address_verification: MapPin,
  };

  const renderInputFields = () => {
    if (!selectedType) return null;

    const IconComponent = proofIcons[selectedType.circuitId as keyof typeof proofIcons] || Calendar;

    switch (selectedType.circuitId) {
      case 'age_verification':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <IconComponent className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">
                {language === 'np' ? selectedType.nameNepali : selectedType.name}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">{t('form.dateOfBirth')}</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  data-testid="input-date-of-birth"
                />
              </div>
              
              <div>
                <Label htmlFor="minimumAge">{t('form.minimumAge')}</Label>
                <Select 
                  value={formData.minimumAge || '18'} 
                  onValueChange={(value) => handleInputChange('minimumAge', value)}
                >
                  <SelectTrigger data-testid="select-minimum-age">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18">18 years</SelectItem>
                    <SelectItem value="21">21 years</SelectItem>
                    <SelectItem value="25">25 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'citizenship_verification':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <IconComponent className="h-5 w-5 text-secondary" />
              <h3 className="font-medium text-foreground">
                {language === 'np' ? selectedType.nameNepali : selectedType.name}
              </h3>
            </div>
            
            <div>
              <Label htmlFor="citizenshipNumber">Citizenship Number</Label>
              <Input
                id="citizenshipNumber"
                placeholder="Enter citizenship number"
                value={formData.citizenshipNumber || ''}
                onChange={(e) => handleInputChange('citizenshipNumber', e.target.value)}
                data-testid="input-citizenship-number"
              />
            </div>
            
            <div>
              <Label htmlFor="issueDistrict">Issue District</Label>
              <Input
                id="issueDistrict"
                placeholder="e.g., Kathmandu"
                value={formData.issueDistrict || ''}
                onChange={(e) => handleInputChange('issueDistrict', e.target.value)}
                data-testid="input-issue-district"
              />
            </div>
          </div>
        );

      case 'education_verification':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <IconComponent className="h-5 w-5 text-accent" />
              <h3 className="font-medium text-foreground">
                {language === 'np' ? selectedType.nameNepali : selectedType.name}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="educationLevel">Education Level</Label>
                <Select 
                  value={formData.educationLevel || ''} 
                  onValueChange={(value) => handleInputChange('educationLevel', value)}
                >
                  <SelectTrigger data-testid="select-education-level">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                    <SelectItem value="master">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  placeholder="e.g., Tribhuvan University"
                  value={formData.institution || ''}
                  onChange={(e) => handleInputChange('institution', e.target.value)}
                  data-testid="input-institution"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="graduationYear">Graduation Year</Label>
              <Input
                id="graduationYear"
                type="number"
                placeholder="e.g., 2020"
                value={formData.graduationYear || ''}
                onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                data-testid="input-graduation-year"
              />
            </div>
          </div>
        );

      case 'income_verification':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <IconComponent className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-foreground">
                {language === 'np' ? selectedType.nameNepali : selectedType.name}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="annualIncome">Annual Income (NPR)</Label>
                <Input
                  id="annualIncome"
                  type="number"
                  placeholder="e.g., 500000"
                  value={formData.annualIncome || ''}
                  onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                  data-testid="input-annual-income"
                />
              </div>
              
              <div>
                <Label htmlFor="incomeRange">Income Range</Label>
                <Select 
                  value={formData.incomeRange || ''} 
                  onValueChange={(value) => handleInputChange('incomeRange', value)}
                >
                  <SelectTrigger data-testid="select-income-range">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="below_500k">Below NPR 5,00,000</SelectItem>
                    <SelectItem value="500k_to_1m">NPR 5,00,000 - 10,00,000</SelectItem>
                    <SelectItem value="above_1m">Above NPR 10,00,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'address_verification':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <IconComponent className="h-5 w-5 text-purple-600" />
              <h3 className="font-medium text-foreground">
                {language === 'np' ? selectedType.nameNepali : selectedType.name}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="province">Province</Label>
                <Select 
                  value={formData.province || ''} 
                  onValueChange={(value) => handleInputChange('province', value)}
                >
                  <SelectTrigger data-testid="select-province">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bagmati">Bagmati Province</SelectItem>
                    <SelectItem value="gandaki">Gandaki Province</SelectItem>
                    <SelectItem value="lumbini">Lumbini Province</SelectItem>
                    <SelectItem value="karnali">Karnali Province</SelectItem>
                    <SelectItem value="sudurpaschim">Sudurpaschim Province</SelectItem>
                    <SelectItem value="province1">Province 1</SelectItem>
                    <SelectItem value="madhesh">Madhesh Province</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  placeholder="e.g., Kathmandu"
                  value={formData.district || ''}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  data-testid="input-district"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="municipality">Municipality/VDC</Label>
              <Input
                id="municipality"
                placeholder="e.g., Kathmandu Metropolitan City"
                value={formData.municipality || ''}
                onChange={(e) => handleInputChange('municipality', e.target.value)}
                data-testid="input-municipality"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-muted-foreground">
            No specific fields required for this proof type.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background apple-blur-bg">
      {/* Header */}
      <header className="apple-glass border-b border-border/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="text-primary-foreground text-lg" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-foreground">Generate Proof</h1>
                <p className="text-xs text-muted-foreground">Create zero-knowledge proof</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher 
                currentLanguage={language} 
                onLanguageChange={setLanguage} 
              />
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 mr-1 inline" />
                  {t('message.dataStaysLocal')}
                </span>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Step Indicator */}
        <div className="flex items-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} rounded-full flex items-center justify-center text-sm font-medium`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium text-foreground">Select Type</span>
          </div>
          <div className="flex-1 mx-4 h-0.5 bg-border"></div>
          <div className="flex items-center">
            <div className={`w-8 h-8 ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} rounded-full flex items-center justify-center text-sm font-medium`}>
              2
            </div>
            <span className="ml-2 text-sm text-muted-foreground">Enter Data</span>
          </div>
          <div className="flex-1 mx-4 h-0.5 bg-border"></div>
          <div className="flex items-center">
            <div className={`w-8 h-8 ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} rounded-full flex items-center justify-center text-sm font-medium`}>
              3
            </div>
            <span className="ml-2 text-sm text-muted-foreground">Generate</span>
          </div>
        </div>

        {currentStep === 1 && (
          <Card className="apple-card apple-glass border-0 apple-shadow apple-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl">{t('form.proofType')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(proofTypes as any[]).map((proofType: any) => {
                  const IconComponent = proofIcons[proofType.circuitId as keyof typeof proofIcons] || Calendar;
                  return (
                    <Card 
                      key={proofType.id}
                      className="cursor-pointer apple-card apple-glass border-0 group"
                      onClick={() => handleProofTypeChange(proofType.id)}
                      data-testid={`card-proof-type-${proofType.circuitId}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center apple-shadow group-hover:scale-105 transition-transform">
                            <IconComponent className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-lg">
                              {language === 'np' ? proofType.nameNepali : proofType.name}
                            </h3>
                          </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {language === 'np' ? proofType.descriptionNepali : proofType.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && selectedType && (
          <Card className="apple-card apple-glass border-0 apple-shadow apple-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl">Enter Proof Details</CardTitle>
              <p className="text-muted-foreground">
                Your data is processed locally and never shared in plaintext.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {renderInputFields()}

                <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                  <div className="flex items-start space-x-2">
                    <Lock className="h-5 w-5 text-accent mt-0.5" />
                    <div className="text-sm">
                      <p className="text-accent-foreground font-medium">Privacy Notice</p>
                      <p className="text-accent-foreground/80">
                        Your data will be processed locally to generate a proof. 
                        The actual data will never be shared with any organization.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                    data-testid="button-back-to-selection"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(3)}
                    disabled={!Object.keys(formData).length}
                    data-testid="button-proceed-generate"
                  >
                    Proceed to Generate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="apple-card apple-glass border-0 apple-shadow apple-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl">Generate Zero-Knowledge Proof</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">Proof Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Proof Type:</span>
                      <span className="text-foreground">
                        {language === 'np' ? selectedType?.nameNepali : selectedType?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Algorithm:</span>
                      <span className="text-foreground">Groth16 (Mock)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Security:</span>
                      <span className="text-foreground">256-bit</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(2)}
                    data-testid="button-back-to-details"
                  >
                    Back to Details
                  </Button>
                  <Button 
                    onClick={handleGenerate}
                    disabled={generateProofMutation.isPending}
                    className="apple-gradient apple-button border-0 shadow-lg px-8 py-3"
                    data-testid="button-generate-proof"
                  >
                    {generateProofMutation.isPending ? t('common.loading') : t('form.generate')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
