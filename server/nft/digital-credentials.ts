/**
 * NFT-Based Digital Credentials Marketplace
 * Blockchain-backed verifiable credentials as non-fungible tokens
 */

export interface NFTCredential {
  tokenId: string;
  contractAddress: string;
  blockchain: 'ethereum' | 'polygon' | 'avalanche' | 'bsc' | 'solana';
  credentialType: 'education' | 'professional' | 'identity' | 'achievement' | 'certification';
  metadata: CredentialMetadata;
  issuer: CredentialIssuer;
  holder: string; // wallet address
  status: 'active' | 'revoked' | 'expired' | 'transferred';
  mintedAt: Date;
  expiresAt?: Date;
  transferHistory: TransferRecord[];
  verificationProof: string;
  ipfsHash: string;
}

export interface CredentialMetadata {
  name: string;
  description: string;
  image: string;
  attributes: CredentialAttribute[];
  properties: Record<string, any>;
  external_url?: string;
  animation_url?: string;
}

export interface CredentialAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'string' | 'number' | 'date' | 'boost_number' | 'boost_percentage';
  max_value?: number;
}

export interface CredentialIssuer {
  id: string;
  name: string;
  type: 'university' | 'company' | 'government' | 'certification_body' | 'individual';
  walletAddress: string;
  verified: boolean;
  reputation: number; // 0-100
  totalIssued: number;
  website?: string;
  logo?: string;
}

export interface TransferRecord {
  from: string;
  to: string;
  transactionHash: string;
  timestamp: Date;
  price?: number;
  currency?: string;
}

export interface MarketplaceListing {
  id: string;
  tokenId: string;
  seller: string;
  price: number;
  currency: 'ETH' | 'MATIC' | 'AVAX' | 'BNB' | 'SOL' | 'USDC';
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  description?: string;
  featured: boolean;
}

export interface CredentialTemplate {
  id: string;
  name: string;
  category: string;
  issuerType: string[];
  schema: Record<string, any>;
  requiredFields: string[];
  optionalFields: string[];
  verificationRequirements: string[];
  mintingCost: number;
  estimatedValue: { min: number; max: number };
}

class NFTCredentialMarketplace {
  private credentials: Map<string, NFTCredential> = new Map();
  private issuers: Map<string, CredentialIssuer> = new Map();
  private listings: Map<string, MarketplaceListing> = new Map();
  private templates: Map<string, CredentialTemplate> = new Map();
  private collections: Map<string, string[]> = new Map(); // issuer -> token IDs

  constructor() {
    this.initializeCredentialTemplates();
    this.initializeIssuers();
  }

  private initializeCredentialTemplates() {
    const templates: CredentialTemplate[] = [
      {
        id: 'university-degree',
        name: 'University Degree',
        category: 'education',
        issuerType: ['university'],
        schema: {
          degree_type: 'string',
          field_of_study: 'string',
          graduation_date: 'date',
          gpa: 'number',
          honors: 'string'
        },
        requiredFields: ['degree_type', 'field_of_study', 'graduation_date'],
        optionalFields: ['gpa', 'honors'],
        verificationRequirements: ['academic_transcript', 'registrar_verification'],
        mintingCost: 0.05, // ETH
        estimatedValue: { min: 0.1, max: 2.0 }
      },
      {
        id: 'professional-certification',
        name: 'Professional Certification',
        category: 'professional',
        issuerType: ['certification_body', 'company'],
        schema: {
          certification_name: 'string',
          skill_level: 'string',
          issue_date: 'date',
          expiry_date: 'date',
          score: 'number'
        },
        requiredFields: ['certification_name', 'skill_level', 'issue_date'],
        optionalFields: ['expiry_date', 'score'],
        verificationRequirements: ['exam_results', 'issuer_verification'],
        mintingCost: 0.02,
        estimatedValue: { min: 0.05, max: 0.5 }
      },
      {
        id: 'identity-verification',
        name: 'Identity Verification',
        category: 'identity',
        issuerType: ['government', 'certification_body'],
        schema: {
          verification_level: 'string',
          document_types: 'array',
          biometric_verified: 'boolean',
          issue_date: 'date',
          jurisdiction: 'string'
        },
        requiredFields: ['verification_level', 'document_types', 'issue_date'],
        optionalFields: ['biometric_verified', 'jurisdiction'],
        verificationRequirements: ['government_id', 'biometric_verification'],
        mintingCost: 0.01,
        estimatedValue: { min: 0.02, max: 0.2 }
      },
      {
        id: 'work-experience',
        name: 'Work Experience Certificate',
        category: 'professional',
        issuerType: ['company'],
        schema: {
          company_name: 'string',
          position: 'string',
          start_date: 'date',
          end_date: 'date',
          responsibilities: 'array',
          performance_rating: 'number'
        },
        requiredFields: ['company_name', 'position', 'start_date'],
        optionalFields: ['end_date', 'responsibilities', 'performance_rating'],
        verificationRequirements: ['hr_verification', 'manager_approval'],
        mintingCost: 0.015,
        estimatedValue: { min: 0.03, max: 0.3 }
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });

    console.log(`🎨 Initialized ${templates.length} credential templates`);
  }

  private initializeIssuers() {
    const issuers: CredentialIssuer[] = [
      {
        id: 'stanford-university',
        name: 'Stanford University',
        type: 'university',
        walletAddress: '0x1234567890123456789012345678901234567890',
        verified: true,
        reputation: 98,
        totalIssued: 15000,
        website: 'https://stanford.edu',
        logo: 'https://stanford.edu/logo.png'
      },
      {
        id: 'google-cloud',
        name: 'Google Cloud',
        type: 'company',
        walletAddress: '0x2345678901234567890123456789012345678901',
        verified: true,
        reputation: 95,
        totalIssued: 50000,
        website: 'https://cloud.google.com',
        logo: 'https://cloud.google.com/logo.png'
      },
      {
        id: 'nepal-government',
        name: 'Government of Nepal',
        type: 'government',
        walletAddress: '0x3456789012345678901234567890123456789012',
        verified: true,
        reputation: 92,
        totalIssued: 100000,
        website: 'https://www.gov.np',
        logo: 'https://www.gov.np/logo.png'
      },
      {
        id: 'cisco-systems',
        name: 'Cisco Systems',
        type: 'certification_body',
        walletAddress: '0x4567890123456789012345678901234567890123',
        verified: true,
        reputation: 94,
        totalIssued: 75000,
        website: 'https://cisco.com',
        logo: 'https://cisco.com/logo.png'
      }
    ];

    issuers.forEach(issuer => {
      this.issuers.set(issuer.id, issuer);
      this.collections.set(issuer.id, []);
    });
  }

  // NFT Credential Minting
  async mintCredential(
    issuerId: string,
    holderAddress: string,
    templateId: string,
    credentialData: Record<string, any>,
    blockchain: NFTCredential['blockchain'] = 'ethereum'
  ): Promise<string> {
    const issuer = this.issuers.get(issuerId);
    if (!issuer) {
      throw new Error(`Issuer not found: ${issuerId}`);
    }

    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Validate required fields
    for (const field of template.requiredFields) {
      if (!credentialData[field]) {
        throw new Error(`Required field missing: ${field}`);
      }
    }

    const tokenId = this.generateTokenId();
    const contractAddress = this.getContractAddress(blockchain);
    
    // Generate metadata
    const metadata = await this.generateCredentialMetadata(template, credentialData, issuer);
    
    // Upload metadata to IPFS
    const ipfsHash = await this.uploadToIPFS(metadata);
    
    // Generate verification proof
    const verificationProof = await this.generateVerificationProof(credentialData, issuer);

    const credential: NFTCredential = {
      tokenId,
      contractAddress,
      blockchain,
      credentialType: template.category as NFTCredential['credentialType'],
      metadata,
      issuer,
      holder: holderAddress,
      status: 'active',
      mintedAt: new Date(),
      transferHistory: [],
      verificationProof,
      ipfsHash
    };

    // Set expiry if applicable
    if (credentialData.expiry_date) {
      credential.expiresAt = new Date(credentialData.expiry_date);
    }

    this.credentials.set(tokenId, credential);
    
    // Add to issuer's collection
    const collection = this.collections.get(issuerId)!;
    collection.push(tokenId);

    // Update issuer stats
    issuer.totalIssued++;

    console.log(`🎭 Minted NFT credential: ${tokenId} for ${holderAddress}`);
    return tokenId;
  }

  private generateTokenId(): string {
    return `nft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getContractAddress(blockchain: NFTCredential['blockchain']): string {
    const contracts: Record<string, string> = {
      ethereum: '0x1111111111111111111111111111111111111111',
      polygon: '0x2222222222222222222222222222222222222222',
      avalanche: '0x3333333333333333333333333333333333333333',
      bsc: '0x4444444444444444444444444444444444444444',
      solana: 'VeridityCredentialsProgram123456789'
    };

    return contracts[blockchain];
  }

  private async generateCredentialMetadata(
    template: CredentialTemplate,
    data: Record<string, any>,
    issuer: CredentialIssuer
  ): Promise<CredentialMetadata> {
    const attributes: CredentialAttribute[] = [];

    // Add template-specific attributes
    for (const [key, value] of Object.entries(data)) {
      if (template.schema[key] && value !== undefined) {
        attributes.push({
          trait_type: this.formatTraitType(key),
          value: value,
          display_type: this.getDisplayType(template.schema[key])
        });
      }
    }

    // Add issuer information
    attributes.push({
      trait_type: 'Issuer',
      value: issuer.name
    });

    attributes.push({
      trait_type: 'Issuer Reputation',
      value: issuer.reputation,
      display_type: 'number',
      max_value: 100
    });

    return {
      name: `${template.name} - ${data[template.requiredFields[0]] || 'Credential'}`,
      description: `A verified ${template.name.toLowerCase()} credential issued by ${issuer.name}`,
      image: await this.generateCredentialImage(template, data, issuer),
      attributes,
      properties: {
        template_id: template.id,
        issuer_id: issuer.id,
        verification_level: 'high',
        blockchain_verified: true
      },
      external_url: `https://veridity.app/credential/${this.generateTokenId()}`
    };
  }

  private formatTraitType(key: string): string {
    return key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private getDisplayType(schemaType: string): CredentialAttribute['display_type'] {
    switch (schemaType) {
      case 'date': return 'date';
      case 'number': return 'number';
      default: return 'string';
    }
  }

  private async generateCredentialImage(
    template: CredentialTemplate,
    data: Record<string, any>,
    issuer: CredentialIssuer
  ): Promise<string> {
    // In a real implementation, this would generate a unique credential image
    // For now, return a placeholder URL
    return `https://api.veridity.app/credential-image/${template.id}/${this.generateTokenId()}.png`;
  }

  private async uploadToIPFS(metadata: CredentialMetadata): Promise<string> {
    // Simulate IPFS upload
    const hash = `Qm${Math.random().toString(36).substr(2, 44)}`;
    console.log(`📦 Uploaded metadata to IPFS: ${hash}`);
    return hash;
  }

  private async generateVerificationProof(
    data: Record<string, any>,
    issuer: CredentialIssuer
  ): Promise<string> {
    // Generate a cryptographic proof of the credential's authenticity
    const proofData = {
      issuer: issuer.walletAddress,
      timestamp: Date.now(),
      data: JSON.stringify(data)
    };
    
    return `proof-${Buffer.from(JSON.stringify(proofData)).toString('base64')}`;
  }

  // Marketplace Functions
  async listCredentialForSale(
    tokenId: string,
    sellerAddress: string,
    price: number,
    currency: MarketplaceListing['currency'],
    durationDays: number = 30
  ): Promise<string> {
    const credential = this.credentials.get(tokenId);
    if (!credential) {
      throw new Error('Credential not found');
    }

    if (credential.holder !== sellerAddress) {
      throw new Error('Only the credential holder can list it for sale');
    }

    const listingId = `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const listing: MarketplaceListing = {
      id: listingId,
      tokenId,
      seller: sellerAddress,
      price,
      currency,
      status: 'active',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      featured: price > 1.0 // Feature expensive credentials
    };

    this.listings.set(listingId, listing);
    
    console.log(`🏪 Listed credential ${tokenId} for ${price} ${currency}`);
    return listingId;
  }

  async purchaseCredential(
    listingId: string,
    buyerAddress: string
  ): Promise<{ success: boolean; transactionHash?: string }> {
    const listing = this.listings.get(listingId);
    if (!listing || listing.status !== 'active') {
      throw new Error('Listing not found or not active');
    }

    const credential = this.credentials.get(listing.tokenId);
    if (!credential) {
      throw new Error('Credential not found');
    }

    // Simulate blockchain transaction
    const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    // Transfer credential
    const transferRecord: TransferRecord = {
      from: credential.holder,
      to: buyerAddress,
      transactionHash,
      timestamp: new Date(),
      price: listing.price,
      currency: listing.currency
    };

    credential.holder = buyerAddress;
    credential.transferHistory.push(transferRecord);

    // Mark listing as sold
    listing.status = 'sold';

    console.log(`💰 Credential ${listing.tokenId} sold to ${buyerAddress} for ${listing.price} ${listing.currency}`);
    
    return {
      success: true,
      transactionHash
    };
  }

  // Verification Functions
  async verifyCredential(tokenId: string): Promise<{
    valid: boolean;
    issuerVerified: boolean;
    onChain: boolean;
    metadata: CredentialMetadata;
    issuer: CredentialIssuer;
  }> {
    const credential = this.credentials.get(tokenId);
    if (!credential) {
      return {
        valid: false,
        issuerVerified: false,
        onChain: false,
        metadata: {} as CredentialMetadata,
        issuer: {} as CredentialIssuer
      };
    }

    const issuerVerified = credential.issuer.verified;
    const onChain = await this.verifyOnChain(credential);

    return {
      valid: credential.status === 'active' && (!credential.expiresAt || credential.expiresAt > new Date()),
      issuerVerified,
      onChain,
      metadata: credential.metadata,
      issuer: credential.issuer
    };
  }

  private async verifyOnChain(credential: NFTCredential): Promise<boolean> {
    // Simulate blockchain verification
    // In reality, this would check the token exists on the specified blockchain
    return Math.random() > 0.05; // 95% success rate
  }

  // Query Functions
  getCredentialsByHolder(holderAddress: string): NFTCredential[] {
    return Array.from(this.credentials.values())
      .filter(credential => credential.holder === holderAddress);
  }

  getCredentialsByIssuer(issuerId: string): NFTCredential[] {
    const tokenIds = this.collections.get(issuerId) || [];
    return tokenIds.map(id => this.credentials.get(id)!).filter(Boolean);
  }

  getMarketplaceListings(filters?: {
    category?: string;
    priceRange?: { min: number; max: number };
    issuerType?: string;
    featured?: boolean;
  }): MarketplaceListing[] {
    let listings = Array.from(this.listings.values())
      .filter(listing => listing.status === 'active');

    if (filters) {
      if (filters.featured !== undefined) {
        listings = listings.filter(listing => listing.featured === filters.featured);
      }

      if (filters.priceRange) {
        listings = listings.filter(listing => 
          listing.price >= filters.priceRange!.min && 
          listing.price <= filters.priceRange!.max
        );
      }

      if (filters.category) {
        listings = listings.filter(listing => {
          const credential = this.credentials.get(listing.tokenId);
          return credential?.credentialType === filters.category;
        });
      }
    }

    return listings.sort((a, b) => {
      // Sort by featured first, then by creation date
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  // Analytics
  async getMarketplaceAnalytics(): Promise<{
    totalCredentials: number;
    totalIssuers: number;
    totalListings: number;
    totalVolume: number;
    averagePrice: number;
    topCategories: Array<{ category: string; count: number }>;
    topIssuers: Array<{ issuer: string; credentials: number; reputation: number }>;
  }> {
    const credentials = Array.from(this.credentials.values());
    const listings = Array.from(this.listings.values());
    const soldListings = listings.filter(l => l.status === 'sold');

    const totalVolume = soldListings.reduce((sum, listing) => sum + listing.price, 0);
    const averagePrice = soldListings.length > 0 ? totalVolume / soldListings.length : 0;

    // Category distribution
    const categoryCount = credentials.reduce((acc, cred) => {
      acc[cred.credentialType] = (acc[cred.credentialType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Issuer statistics
    const issuerStats = Array.from(this.issuers.values())
      .map(issuer => ({
        issuer: issuer.name,
        credentials: issuer.totalIssued,
        reputation: issuer.reputation
      }))
      .sort((a, b) => b.credentials - a.credentials);

    return {
      totalCredentials: credentials.length,
      totalIssuers: this.issuers.size,
      totalListings: listings.filter(l => l.status === 'active').length,
      totalVolume,
      averagePrice,
      topCategories,
      topIssuers: issuerStats.slice(0, 10)
    };
  }

  // Administrative Functions
  async registerIssuer(issuerData: Omit<CredentialIssuer, 'totalIssued'>): Promise<string> {
    const issuer: CredentialIssuer = {
      ...issuerData,
      totalIssued: 0
    };

    this.issuers.set(issuer.id, issuer);
    this.collections.set(issuer.id, []);

    console.log(`🏛️ Registered new issuer: ${issuer.name}`);
    return issuer.id;
  }

  async revokeCredential(tokenId: string, reason: string): Promise<boolean> {
    const credential = this.credentials.get(tokenId);
    if (!credential) {
      return false;
    }

    credential.status = 'revoked';
    
    console.log(`❌ Revoked credential ${tokenId}: ${reason}`);
    return true;
  }

  getCredentialTemplates(): CredentialTemplate[] {
    return Array.from(this.templates.values());
  }

  getRegisteredIssuers(): CredentialIssuer[] {
    return Array.from(this.issuers.values());
  }
}

export const nftCredentialMarketplace = new NFTCredentialMarketplace();