/**
 * International market expansion framework
 */

export interface CountryConfig {
  countryCode: string;
  name: string;
  languages: string[];
  currency: string;
  timezone: string;
  digitalIdSystems: DigitalIdSystem[];
  regulations: RegulatoryRequirement[];
  culturalAdaptations: CulturalAdaptation[];
  partnerOrganizations: PartnerOrganization[];
  active: boolean;
}

export interface DigitalIdSystem {
  name: string;
  type: 'national_id' | 'passport' | 'driving_license' | 'voter_id' | 'other';
  issuer: string;
  format: string;
  verificationMethod: 'api' | 'document_scan' | 'manual' | 'biometric';
  integrationStatus: 'planned' | 'in_progress' | 'completed' | 'not_applicable';
}

export interface RegulatoryRequirement {
  category: 'data_protection' | 'identity_verification' | 'financial_services' | 'healthcare';
  requirement: string;
  compliance_level: 'mandatory' | 'recommended' | 'optional';
  implementation_status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable';
  deadline?: Date;
}

export interface CulturalAdaptation {
  aspect: 'language' | 'numbering' | 'calendar' | 'naming' | 'address' | 'colors' | 'imagery';
  adaptation: string;
  priority: 'high' | 'medium' | 'low';
  implementation_status: 'completed' | 'in_progress' | 'planned';
}

export interface PartnerOrganization {
  name: string;
  type: 'government' | 'bank' | 'telecom' | 'university' | 'ngo';
  country: string;
  services: string[];
  partnership_status: 'active' | 'negotiating' | 'planned' | 'inactive';
  integration_level: 'full' | 'partial' | 'pilot' | 'none';
}

class MarketExpansionService {
  private countryConfigs: Map<string, CountryConfig> = new Map();

  constructor() {
    this.initializeCountryConfigs();
  }

  private initializeCountryConfigs() {
    // India - High priority expansion target
    const india: CountryConfig = {
      countryCode: 'IN',
      name: 'India',
      languages: ['hi', 'en', 'bn', 'te', 'ta', 'mr'],
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      digitalIdSystems: [
        {
          name: 'Aadhaar',
          type: 'national_id',
          issuer: 'Unique Identification Authority of India',
          format: '12-digit number',
          verificationMethod: 'api',
          integrationStatus: 'planned'
        },
        {
          name: 'PAN Card',
          type: 'other',
          issuer: 'Income Tax Department',
          format: 'ABCDE1234F',
          verificationMethod: 'document_scan',
          integrationStatus: 'planned'
        }
      ],
      regulations: [
        {
          category: 'data_protection',
          requirement: 'Digital Personal Data Protection Act 2023',
          compliance_level: 'mandatory',
          implementation_status: 'partial',
          deadline: new Date('2024-12-31')
        }
      ],
      culturalAdaptations: [
        {
          aspect: 'language',
          adaptation: 'Hindi and regional language support',
          priority: 'high',
          implementation_status: 'planned'
        },
        {
          aspect: 'numbering',
          adaptation: 'Devanagari numerals support',
          priority: 'medium',
          implementation_status: 'planned'
        }
      ],
      partnerOrganizations: [
        {
          name: 'State Bank of India',
          type: 'bank',
          country: 'IN',
          services: ['KYC verification', 'Account opening'],
          partnership_status: 'planned',
          integration_level: 'none'
        }
      ],
      active: false
    };

    // Bangladesh - Regional expansion
    const bangladesh: CountryConfig = {
      countryCode: 'BD',
      name: 'Bangladesh',
      languages: ['bn', 'en'],
      currency: 'BDT',
      timezone: 'Asia/Dhaka',
      digitalIdSystems: [
        {
          name: 'National ID Card',
          type: 'national_id',
          issuer: 'Election Commission Bangladesh',
          format: '13-17 digit number',
          verificationMethod: 'document_scan',
          integrationStatus: 'planned'
        }
      ],
      regulations: [
        {
          category: 'data_protection',
          requirement: 'Digital Security Act 2018',
          compliance_level: 'mandatory',
          implementation_status: 'non_compliant'
        }
      ],
      culturalAdaptations: [
        {
          aspect: 'language',
          adaptation: 'Bengali language support',
          priority: 'high',
          implementation_status: 'planned'
        }
      ],
      partnerOrganizations: [],
      active: false
    };

    // Sri Lanka - Regional expansion
    const sriLanka: CountryConfig = {
      countryCode: 'LK',
      name: 'Sri Lanka',
      languages: ['si', 'ta', 'en'],
      currency: 'LKR',
      timezone: 'Asia/Colombo',
      digitalIdSystems: [
        {
          name: 'Digital Identity Card',
          type: 'national_id',
          issuer: 'Department of Registration of Persons',
          format: '9-digit number + letter',
          verificationMethod: 'document_scan',
          integrationStatus: 'planned'
        }
      ],
      regulations: [],
      culturalAdaptations: [
        {
          aspect: 'language',
          adaptation: 'Sinhala and Tamil language support',
          priority: 'high',
          implementation_status: 'planned'
        }
      ],
      partnerOrganizations: [],
      active: false
    };

    this.countryConfigs.set('IN', india);
    this.countryConfigs.set('BD', bangladesh);
    this.countryConfigs.set('LK', sriLanka);
  }

  async getMarketOpportunities(): Promise<Array<{
    country: string;
    market_size: string;
    digital_readiness: number;
    regulatory_complexity: number;
    priority_score: number;
    recommended_approach: string;
  }>> {
    return [
      {
        country: 'India',
        market_size: '1.4B population, 750M smartphone users',
        digital_readiness: 85,
        regulatory_complexity: 70,
        priority_score: 95,
        recommended_approach: 'Government partnership + fintech integration'
      },
      {
        country: 'Bangladesh',
        market_size: '165M population, 100M smartphone users',
        digital_readiness: 65,
        regulatory_complexity: 60,
        priority_score: 75,
        recommended_approach: 'Mobile operator partnership'
      },
      {
        country: 'Sri Lanka',
        market_size: '22M population, 15M smartphone users',
        digital_readiness: 70,
        regulatory_complexity: 50,
        priority_score: 60,
        recommended_approach: 'Banking sector focus'
      }
    ];
  }

  async getCountryConfig(countryCode: string): Promise<CountryConfig | null> {
    return this.countryConfigs.get(countryCode) || null;
  }

  async getAllCountryConfigs(): Promise<CountryConfig[]> {
    return Array.from(this.countryConfigs.values());
  }

  async updateCountryConfig(countryCode: string, updates: Partial<CountryConfig>): Promise<boolean> {
    const config = this.countryConfigs.get(countryCode);
    if (!config) return false;

    const updatedConfig = { ...config, ...updates };
    this.countryConfigs.set(countryCode, updatedConfig);
    return true;
  }

  async activateCountry(countryCode: string): Promise<{
    success: boolean;
    requirements: string[];
    estimated_timeline: string;
  }> {
    const config = this.countryConfigs.get(countryCode);
    if (!config) {
      return {
        success: false,
        requirements: ['Country configuration not found'],
        estimated_timeline: 'N/A'
      };
    }

    const requirements: string[] = [];
    
    // Check language support
    const missingLanguages = config.languages.filter(lang => !this.isLanguageSupported(lang));
    if (missingLanguages.length > 0) {
      requirements.push(`Add support for languages: ${missingLanguages.join(', ')}`);
    }

    // Check regulatory compliance
    const nonCompliantRegs = config.regulations.filter(reg => 
      reg.compliance_level === 'mandatory' && reg.implementation_status === 'non_compliant'
    );
    if (nonCompliantRegs.length > 0) {
      requirements.push(`Achieve regulatory compliance for: ${nonCompliantRegs.map(r => r.requirement).join(', ')}`);
    }

    // Check digital ID integrations
    const pendingIntegrations = config.digitalIdSystems.filter(sys => 
      sys.integrationStatus === 'planned' || sys.integrationStatus === 'in_progress'
    );
    if (pendingIntegrations.length > 0) {
      requirements.push(`Complete digital ID integrations: ${pendingIntegrations.map(i => i.name).join(', ')}`);
    }

    const timeline = this.estimateTimeline(requirements.length);

    return {
      success: requirements.length === 0,
      requirements,
      estimated_timeline: timeline
    };
  }

  private isLanguageSupported(languageCode: string): boolean {
    // Check if language is already supported
    const supportedLanguages = ['en', 'ne']; // Currently supported
    return supportedLanguages.includes(languageCode);
  }

  private estimateTimeline(requirementCount: number): string {
    if (requirementCount === 0) return 'Ready for activation';
    if (requirementCount <= 2) return '3-6 months';
    if (requirementCount <= 5) return '6-12 months';
    return '12-18 months';
  }

  async getLocalizationRequirements(countryCode: string): Promise<{
    languages: string[];
    cultural_adaptations: CulturalAdaptation[];
    regulatory_requirements: RegulatoryRequirement[];
    technical_integrations: DigitalIdSystem[];
  }> {
    const config = this.countryConfigs.get(countryCode);
    if (!config) {
      throw new Error(`Country ${countryCode} not configured`);
    }

    return {
      languages: config.languages,
      cultural_adaptations: config.culturalAdaptations,
      regulatory_requirements: config.regulations,
      technical_integrations: config.digitalIdSystems
    };
  }

  async getPartnershipOpportunities(countryCode: string): Promise<PartnerOrganization[]> {
    const config = this.countryConfigs.get(countryCode);
    if (!config) return [];

    return config.partnerOrganizations.filter(org => 
      org.partnership_status === 'planned' || org.partnership_status === 'negotiating'
    );
  }

  async trackExpansionProgress(): Promise<{
    countries_active: number;
    countries_planned: number;
    total_integrations: number;
    compliance_rate: number;
  }> {
    const configs = Array.from(this.countryConfigs.values());
    
    const activeCountries = configs.filter(c => c.active).length;
    const plannedCountries = configs.filter(c => !c.active).length;
    
    const totalIntegrations = configs.reduce((sum, c) => 
      sum + c.digitalIdSystems.filter(sys => sys.integrationStatus === 'completed').length, 0
    );
    
    const totalRegs = configs.reduce((sum, c) => sum + c.regulations.length, 0);
    const compliantRegs = configs.reduce((sum, c) => 
      sum + c.regulations.filter(r => r.implementation_status === 'compliant').length, 0
    );
    
    const complianceRate = totalRegs > 0 ? (compliantRegs / totalRegs) * 100 : 100;

    return {
      countries_active: activeCountries,
      countries_planned: plannedCountries,
      total_integrations: totalIntegrations,
      compliance_rate: Math.round(complianceRate)
    };
  }
}

export const marketExpansionService = new MarketExpansionService();