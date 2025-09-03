import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ZKPService } from "./services/zkpService";
import { insertProofSchema, insertVerificationSchema, insertOrganizationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize default data
  await initializeDefaultData();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Proof type routes
  app.get('/api/proof-types', async (req, res) => {
    try {
      const proofTypes = await storage.getProofTypes();
      res.json(proofTypes);
    } catch (error) {
      console.error("Error fetching proof types:", error);
      res.status(500).json({ message: "Failed to fetch proof types" });
    }
  });

  // Proof generation routes
  app.post('/api/proofs/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { proofTypeId, privateInputs } = req.body;

      if (!proofTypeId || !privateInputs) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get proof type to determine circuit
      const proofTypes = await storage.getProofTypes();
      const proofType = proofTypes.find(pt => pt.id === proofTypeId);
      
      if (!proofType) {
        return res.status(404).json({ message: "Proof type not found" });
      }

      // Generate ZKP proof
      const zkpResult = await ZKPService.generateProof(proofType.circuitId, privateInputs);
      
      if (!zkpResult.success) {
        return res.status(400).json({ message: "Proof generation failed" });
      }

      // Create proof record
      const proof = await storage.createProof({
        userId,
        proofTypeId,
        proofData: { proof: zkpResult.proof, privateInputs }, // In reality, privateInputs would not be stored
        publicSignals: zkpResult.publicSignals,
        status: 'verified',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      // Create audit log
      await storage.createAuditLog({
        action: 'proof_generated',
        entityType: 'proof',
        entityId: proof.id,
        userId,
        metadata: { proofType: proofType.name }
      });

      res.json({
        id: proof.id,
        proofType: proofType.name,
        status: proof.status,
        publicSignals: proof.publicSignals,
        createdAt: proof.createdAt,
        expiresAt: proof.expiresAt
      });
    } catch (error) {
      console.error("Error generating proof:", error);
      res.status(500).json({ message: "Failed to generate proof" });
    }
  });

  // Get user's proofs
  app.get('/api/proofs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const proofs = await storage.getUserProofs(userId);
      res.json(proofs);
    } catch (error) {
      console.error("Error fetching proofs:", error);
      res.status(500).json({ message: "Failed to fetch proofs" });
    }
  });

  // Proof verification routes
  app.post('/api/verify', async (req, res) => {
    try {
      const { proofId, organizationApiKey } = req.body;

      if (!proofId) {
        return res.status(400).json({ message: "Proof ID is required" });
      }

      // Verify organization if API key provided
      let organization = null;
      if (organizationApiKey) {
        organization = await storage.getOrganizationByApiKey(organizationApiKey);
        if (!organization) {
          return res.status(401).json({ message: "Invalid organization API key" });
        }
      }

      // Get proof
      const proof = await storage.getProof(proofId);
      if (!proof) {
        return res.status(404).json({ message: "Proof not found" });
      }

      // Check if proof has expired
      if (proof.expiresAt && new Date() > proof.expiresAt) {
        return res.status(400).json({ message: "Proof has expired" });
      }

      // Get proof type
      const proofTypes = await storage.getProofTypes();
      const proofType = proofTypes.find(pt => pt.id === proof.proofTypeId);

      if (!proofType) {
        return res.status(404).json({ message: "Proof type not found" });
      }

      // Verify the ZKP proof
      const proofData = proof.proofData as any;
      const verificationResult = await ZKPService.verifyProof(
        proofData.proof,
        proof.publicSignals,
        proofType.circuitId
      );

      // Create verification record if organization is provided
      let verification = null;
      if (organization) {
        verification = await storage.createVerification({
          proofId: proof.id,
          organizationId: organization.id,
          status: verificationResult.valid ? 'verified' : 'failed',
          result: verificationResult.details
        });

        if (verificationResult.valid) {
          await storage.updateVerificationResult(verification.id, verificationResult.details);
        }

        // Create audit log
        await storage.createAuditLog({
          action: 'proof_verified',
          entityType: 'verification',
          entityId: verification.id,
          organizationId: organization.id,
          metadata: { 
            proofId, 
            valid: verificationResult.valid,
            proofType: proofType.name 
          }
        });
      }

      res.json({
        valid: verificationResult.valid,
        proofType: proofType.name,
        details: verificationResult.details,
        verificationId: verification?.id
      });
    } catch (error) {
      console.error("Error verifying proof:", error);
      res.status(500).json({ message: "Failed to verify proof" });
    }
  });

  // User statistics
  app.get('/api/stats/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Organization routes
  app.get('/api/organizations', async (req, res) => {
    try {
      const organizations = await storage.getOrganizations();
      res.json(organizations);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      res.status(500).json({ message: "Failed to fetch organizations" });
    }
  });

  // Organization statistics (requires API key)
  app.get('/api/stats/organization', async (req, res) => {
    try {
      const apiKey = req.headers['x-api-key'] as string;
      
      if (!apiKey) {
        return res.status(401).json({ message: "API key required" });
      }

      const organization = await storage.getOrganizationByApiKey(apiKey);
      if (!organization) {
        return res.status(401).json({ message: "Invalid API key" });
      }

      const stats = await storage.getOrganizationStats(organization.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching organization stats:", error);
      res.status(500).json({ message: "Failed to fetch organization stats" });
    }
  });

  // Admin routes (for demo purposes - in production would need proper admin auth)
  app.post('/api/admin/organizations', async (req, res) => {
    try {
      const organizationData = insertOrganizationSchema.parse(req.body);
      
      // Generate API key
      const apiKey = `veri_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const organization = await storage.createOrganization({
        ...organizationData,
        apiKey
      });

      res.json(organization);
    } catch (error) {
      console.error("Error creating organization:", error);
      res.status(500).json({ message: "Failed to create organization" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Initialize default data
async function initializeDefaultData() {
  try {
    // Check if proof types already exist
    const existingProofTypes = await storage.getProofTypes();
    
    if (existingProofTypes.length === 0) {
      // Create default proof types
      const defaultProofTypes = ZKPService.getAvailableCircuits();
      
      for (const circuit of defaultProofTypes) {
        await storage.createProofType({
          name: circuit.name,
          nameNepali: circuit.nameNepali,
          description: circuit.description,
          descriptionNepali: circuit.descriptionNepali,
          circuitId: circuit.id,
          isActive: true
        });
      }
      
      console.log("Initialized default proof types");
    }

    // Check if organizations exist
    const existingOrganizations = await storage.getOrganizations();
    
    if (existingOrganizations.length === 0) {
      // Create default organizations
      const defaultOrganizations = [
        {
          name: "Nepal Government",
          nameNepali: "नेपाल सरकार",
          type: "government",
          apiKey: "veri_gov_nepal_demo_key",
          allowedProofTypes: ["age_verification", "citizenship_verification"]
        },
        {
          name: "Tribhuvan University",
          nameNepali: "त्रिभुवन विश्वविद्यालय",
          type: "university",
          apiKey: "veri_tu_demo_key",
          allowedProofTypes: ["education_verification", "age_verification"]
        },
        {
          name: "Nepal Rastra Bank",
          nameNepali: "नेपाल राष्ट्र बैंक",
          type: "bank",
          apiKey: "veri_nrb_demo_key",
          allowedProofTypes: ["income_verification", "citizenship_verification", "age_verification"]
        }
      ];

      for (const org of defaultOrganizations) {
        await storage.createOrganization(org);
      }
      
      console.log("Initialized default organizations");
    }
  } catch (error) {
    console.error("Error initializing default data:", error);
  }
}
