/**
 * Example Enterprise Integration with Veridity SDK
 * 
 * This example demonstrates how a bank, university, or government agency
 * can integrate Veridity's zero-knowledge proof system into their applications.
 */

import { VeriditySDK, createVeriditySDK, type ProofRequest, type ProofResult } from './veridity-enterprise-sdk';

// Example: Bank loan application system
class BankLoanSystem {
  private veridity: VeriditySDK;
  
  constructor() {
    this.veridity = createVeriditySDK({
      apiKey: process.env.VERIDITY_API_KEY!,
      baseUrl: process.env.VERIDITY_BASE_URL || 'https://api.veridity.com',
      environment: 'production',
      webhookSecret: process.env.VERIDITY_WEBHOOK_SECRET,
      timeout: 30000
    });
  }

  async initialize() {
    try {
      await this.veridity.initialize();
      
      // Set up event listeners
      this.veridity.on('proof.verified', (result: ProofResult) => {
        console.log(`✅ Proof verified for loan application: ${result.id}`);
        this.processLoanApplication(result);
      });
      
      this.veridity.on('error', (error: Error) => {
        console.error('❌ Veridity SDK error:', error);
        // Handle error - maybe queue for retry
      });
      
      console.log('🏦 Bank loan system initialized with Veridity');
    } catch (error) {
      console.error('Failed to initialize Veridity SDK:', error);
      throw error;
    }
  }

  // Process loan application with KYC verification
  async processLoanApplication(applicationId: string, applicantData: any) {
    try {
      console.log(`📋 Processing loan application: ${applicationId}`);
      
      // Step 1: Age verification (must be 18+)
      const ageRequest: ProofRequest = {
        proofType: 'age_verification',
        requirements: {
          ageThreshold: 18
        },
        metadata: {
          applicationId,
          verificationType: 'age_check'
        },
        expiresIn: 3600 // 1 hour
      };
      
      const ageVerification = await this.veridity.requestProof(ageRequest);
      console.log(`📧 Age verification requested: ${ageVerification.sessionId}`);
      
      // Step 2: Income verification (based on loan amount)
      const requiredIncome = this.calculateRequiredIncome(applicantData.loanAmount);
      const incomeRequest: ProofRequest = {
        proofType: 'income_verification',
        requirements: {
          incomeThreshold: requiredIncome
        },
        metadata: {
          applicationId,
          loanAmount: applicantData.loanAmount,
          verificationType: 'income_check'
        },
        expiresIn: 7200 // 2 hours
      };
      
      const incomeVerification = await this.veridity.requestProof(incomeRequest);
      console.log(`💰 Income verification requested: ${incomeVerification.sessionId}`);
      
      // Step 3: Citizenship verification (for regulatory compliance)
      const citizenshipRequest: ProofRequest = {
        proofType: 'citizenship_verification',
        requirements: {
          citizenshipCountry: 'Nepal'
        },
        metadata: {
          applicationId,
          verificationType: 'citizenship_check'
        },
        expiresIn: 3600
      };
      
      const citizenshipVerification = await this.veridity.requestProof(citizenshipRequest);
      console.log(`🏛️ Citizenship verification requested: ${citizenshipVerification.sessionId}`);
      
      // Store verification session IDs for tracking
      await this.storeLoanApplicationVerifications(applicationId, {
        age: ageVerification.sessionId,
        income: incomeVerification.sessionId,
        citizenship: citizenshipVerification.sessionId
      });
      
      // Return verification URLs for customer
      return {
        ageVerificationUrl: ageVerification.verificationUrl,
        incomeVerificationUrl: incomeVerification.verificationUrl,
        citizenshipVerificationUrl: citizenshipVerification.verificationUrl,
        applicationId
      };
      
    } catch (error) {
      console.error(`❌ Failed to process loan application ${applicationId}:`, error);
      throw error;
    }
  }

  private calculateRequiredIncome(loanAmount: number): number {
    // Standard 3x income requirement
    return Math.ceil(loanAmount / 36); // Monthly income for 3 years loan
  }

  private async processLoanApplication(proofResult: ProofResult) {
    const applicationId = proofResult.metadata?.applicationId;
    if (!applicationId) return;
    
    try {
      // Check if all verifications are complete
      const allProofs = await this.getAllVerifications(applicationId);
      const allComplete = allProofs.every(proof => proof.status === 'verified' && proof.isValid);
      
      if (allComplete) {
        console.log(`✅ All verifications complete for application ${applicationId}`);
        await this.approveLoanApplication(applicationId);
      } else {
        console.log(`⏳ Waiting for remaining verifications for application ${applicationId}`);
      }
    } catch (error) {
      console.error(`Error processing loan application ${applicationId}:`, error);
    }
  }

  private async storeLoanApplicationVerifications(applicationId: string, sessions: any) {
    // Store in your database
    console.log(`💾 Storing verification sessions for ${applicationId}:`, sessions);
  }

  private async getAllVerifications(applicationId: string): Promise<ProofResult[]> {
    // Retrieve from your database and get results from Veridity
    // This is a simplified example
    return [];
  }

  private async approveLoanApplication(applicationId: string) {
    console.log(`🎉 Loan application ${applicationId} approved with ZK verification!`);
    // Update your loan application status
  }
}

// Example: University admission system
class UniversityAdmissionSystem {
  private veridity: VeriditySDK;
  
  constructor() {
    this.veridity = createVeriditySDK({
      apiKey: process.env.VERIDITY_API_KEY!,
      baseUrl: process.env.VERIDITY_BASE_URL || 'https://api.veridity.com',
      environment: 'production',
      webhookSecret: process.env.VERIDITY_WEBHOOK_SECRET
    });
  }

  async processAdmissionApplication(applicationId: string, programRequirements: any) {
    try {
      console.log(`🎓 Processing university admission: ${applicationId}`);
      
      // Education verification for previous qualifications
      const educationRequest: ProofRequest = {
        proofType: 'education_verification',
        requirements: {
          educationLevel: programRequirements.minimumEducation // e.g., 2 for +2, 3 for Bachelor
        },
        metadata: {
          applicationId,
          program: programRequirements.programName,
          verificationType: 'admission_check'
        },
        expiresIn: 86400 // 24 hours
      };
      
      const educationVerification = await this.veridity.requestProof(educationRequest);
      
      // Age verification if required
      let ageVerification = null;
      if (programRequirements.minimumAge) {
        const ageRequest: ProofRequest = {
          proofType: 'age_verification',
          requirements: {
            ageThreshold: programRequirements.minimumAge
          },
          metadata: {
            applicationId,
            verificationType: 'age_check'
          },
          expiresIn: 3600
        };
        
        ageVerification = await this.veridity.requestProof(ageRequest);
      }
      
      console.log(`📚 Education verification requested for ${applicationId}`);
      
      return {
        educationVerificationUrl: educationVerification.verificationUrl,
        ageVerificationUrl: ageVerification?.verificationUrl,
        applicationId
      };
      
    } catch (error) {
      console.error(`❌ Failed to process admission application ${applicationId}:`, error);
      throw error;
    }
  }
}

// Example: Government service access
class GovernmentServicePortal {
  private veridity: VeriditySDK;
  
  constructor() {
    this.veridity = createVeriditySDK({
      apiKey: process.env.VERIDITY_API_KEY!,
      baseUrl: process.env.VERIDITY_BASE_URL || 'https://api.veridity.com',
      environment: 'production'
    });
  }

  async requestServiceAccess(serviceType: string, citizenId: string) {
    try {
      console.log(`🏛️ Processing government service request: ${serviceType}`);
      
      // Always require citizenship verification for government services
      const citizenshipRequest: ProofRequest = {
        proofType: 'citizenship_verification',
        requirements: {
          citizenshipCountry: 'Nepal'
        },
        metadata: {
          serviceType,
          citizenId,
          verificationType: 'government_service'
        },
        expiresIn: 1800 // 30 minutes
      };
      
      const verification = await this.veridity.requestProof(citizenshipRequest);
      
      // Set up real-time monitoring
      const unsubscribe = this.veridity.subscribeToProofUpdates(
        verification.sessionId,
        (result: ProofResult) => {
          if (result.isValid) {
            console.log(`✅ Government service access granted for ${serviceType}`);
            this.grantServiceAccess(citizenId, serviceType);
          } else {
            console.log(`❌ Government service access denied for ${serviceType}`);
          }
          unsubscribe(); // Clean up subscription
        }
      );
      
      return {
        verificationUrl: verification.verificationUrl,
        serviceType
      };
      
    } catch (error) {
      console.error(`❌ Failed to process service request ${serviceType}:`, error);
      throw error;
    }
  }

  private async grantServiceAccess(citizenId: string, serviceType: string) {
    console.log(`🎫 Granting access to ${serviceType} for citizen ${citizenId}`);
    // Update service access permissions
  }
}

// Webhook handler example
export function handleVeridityWebhook(req: any, res: any) {
  try {
    const signature = req.headers['veridity-signature'];
    const payload = JSON.stringify(req.body);
    
    // Initialize SDK just for webhook verification
    const veridity = createVeriditySDK({
      apiKey: process.env.VERIDITY_API_KEY!,
      baseUrl: process.env.VERIDITY_BASE_URL!,
      environment: 'production',
      webhookSecret: process.env.VERIDITY_WEBHOOK_SECRET
    });
    
    // Verify webhook signature
    if (!veridity.verifyWebhookSignature(payload, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Parse webhook event
    const event = veridity.parseWebhookEvent(payload);
    
    console.log(`📨 Received webhook: ${event.type}`);
    
    // Handle different event types
    switch (event.type) {
      case 'proof.completed':
        console.log(`✅ Proof completed: ${event.data.id}`);
        // Update your application state
        break;
        
      case 'proof.failed':
        console.log(`❌ Proof failed: ${event.data.id}`);
        // Handle verification failure
        break;
        
      case 'proof.expired':
        console.log(`⏰ Proof expired: ${event.data.id}`);
        // Handle expired verification
        break;
    }
    
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Export example systems
export { BankLoanSystem, UniversityAdmissionSystem, GovernmentServicePortal };