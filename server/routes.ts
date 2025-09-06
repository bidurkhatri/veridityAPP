import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { healthMonitor } from "./lib/health-monitor";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ZKPService } from "./services/zkpService";
import { insertProofSchema, insertVerificationSchema, insertOrganizationSchema } from "@shared/schema";
import { QRCodeService } from "./services/qrService";
import { documentService } from "./services/documentService";
import { apiRateLimit, verifyRateLimit } from "./middleware/rateLimit";
import { validateNonce, generateNonce } from "./middleware/nonce";
import { zkVerifier, circuitBuilder } from "./zkp/verifier";
import { verificationHandler } from "./websocket/verification-handler";
import { biometricService } from "./auth/biometric-service";
import { multiSigService } from "./services/multiSigService";
import { fraudDetectionService } from "./services/fraudDetectionService";
import { blockchainService } from "./blockchain/blockchain-service";
import { aiDocumentVerificationService } from "./ai/document-verification";
import { marketExpansionService } from "./internationalization/market-expansion";
import { WebSocketServer } from "ws";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Apply rate limiting to all API routes
  app.use('/api', apiRateLimit);

  // Voice API endpoints
  const { handleTTSRequest } = await import('./api/tts');
  const { handleASRRequest } = await import('./api/asr');
  
  app.post('/api/tts', isAuthenticated, handleTTSRequest);
  app.post('/api/asr', isAuthenticated, handleASRRequest);

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

  // Demo: Update user role
  app.post('/api/auth/update-role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      if (!['customer', 'client', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      
      await storage.updateUserRole(userId, role);
      const updatedUser = await storage.getUser(userId);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
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

  // Get user's proof history with verification details
  app.get('/api/proofs/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const historyData = await storage.getProofHistory(userId);
      res.json(historyData);
    } catch (error) {
      console.error("Error fetching proof history:", error);
      res.status(500).json({ message: "Failed to fetch proof history" });
    }
  });

  // V1 API - Enhanced verification with security
  app.post('/api/v1/verify', verifyRateLimit, validateNonce(), async (req: any, res) => {
    try {
      const { proof, publicSignals, proofType } = req.body;
      
      if (!proof || !publicSignals || !proofType) {
        return res.status(400).json({
          error: "INVALID_REQUEST",
          message: "Missing required fields: proof, publicSignals, proofType"
        });
      }
      
      // Verify the ZK proof
      const isValid = await zkVerifier.verifyProof(proofType, proof, publicSignals);
      
      if (!isValid) {
        return res.status(422).json({
          error: "INVALID_PROOF",
          message: "Proof verification failed"
        });
      }
      
      // Store verification result
      const verificationId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      res.json({
        id: verificationId,
        status: "verified",
        timestamp: new Date().toISOString(),
        nonce: req.nonce?.value
      });
      
    } catch (error) {
      console.error('V1 Verification error:', error);
      res.status(500).json({
        error: "VERIFICATION_ERROR",
        message: "Internal verification error"
      });
    }
  });
  
  // Legacy verification route (keeping backward compatibility)
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
  // V1 API - QR request endpoint for verifiers
  app.post('/api/v1/qr/request', apiRateLimit, async (req, res) => {
    try {
      const { aud, claim, exp } = req.body;
      
      const nonce = generateNonce();
      const qrRequest = {
        v: 1,
        aud: aud || 'veridity_demo',
        claim: claim || 'age_over_18',
        nonce,
        exp: exp || Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
      };
      
      res.json(qrRequest);
    } catch (error) {
      console.error('QR request error:', error);
      res.status(500).json({ message: 'Failed to generate QR request' });
    }
  });
  
  // V1 API - Status check endpoint
  app.get('/api/v1/status/:id', async (req, res) => {
    const { id } = req.params;
    
    // Mock status response
    res.json({
      id,
      status: 'verified',
      timestamp: new Date().toISOString()
    });
  });
  
  // V1 API - Mock proof generation for testing
  app.post('/api/v1/proof/generate', isAuthenticated, async (req: any, res) => {
    try {
      const { proofType, nonce } = req.body;
      const mockProof = zkVerifier.generateMockProof(proofType, nonce);
      
      res.json({
        proof: mockProof.proof,
        publicSignals: mockProof.publicSignals,
        proofType
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate proof' });
    }
  });

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

  // Admin organization statistics
  app.get('/api/admin/organization-stats', isAuthenticated, async (req: any, res) => {
    try {
      // In production, this would verify admin role
      const adminStats = await storage.getAdminOrganizationStats();
      res.json(adminStats);
    } catch (error) {
      console.error("Error fetching admin organization stats:", error);
      res.status(500).json({ message: "Failed to fetch admin organization stats" });
    }
  });

  // Admin recent verifications
  app.get('/api/admin/recent-verifications', isAuthenticated, async (req: any, res) => {
    try {
      // In production, this would verify admin role
      const recentVerifications = await storage.getRecentVerifications(10);
      res.json(recentVerifications);
    } catch (error) {
      console.error("Error fetching recent verifications:", error);
      res.status(500).json({ message: "Failed to fetch recent verifications" });
    }
  });

  // WebSocket server for real-time verification
  const httpServer = createServer(app);
  
  // Enhanced WebSocket server with better error handling
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws/verify',
    perMessageDeflate: false, // Disable for better compatibility
    clientTracking: true
  });
  
  // Handle WebSocket connections
  wss.on('connection', (ws, req) => {
    const clientId = req.headers['sec-websocket-key'] || 
                    `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    verificationHandler.handleConnection(ws, clientId);
  });

  // Enhanced WebSocket error handling
  wss.on('error', (error) => {
    console.error('WebSocket Server Error:', error);
  });

  // Graceful WebSocket shutdown
  const originalShutdown = httpServer.close.bind(httpServer);
  httpServer.close = function(callback?: (err?: Error) => void) {
    console.log('🔌 Closing WebSocket connections...');
    
    // Close all WebSocket connections
    wss.clients.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.close();
      }
    });
    
    // Close WebSocket server
    wss.close(() => {
      console.log('✅ WebSocket server closed');
      // Call original close method
      originalShutdown(callback);
    });
  };
  
  // ZK Circuit and verification status endpoints
  app.get('/api/zk/status', async (req, res) => {
    try {
      const buildStatus = circuitBuilder.getBuildStatus();
      const verificationStats = verificationHandler.getStats();
      
      res.json({
        circuits: buildStatus,
        realTimeVerification: verificationStats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get ZK status' });
    }
  });
  
  // Build circuits endpoint (development only)
  if (process.env.NODE_ENV === 'development') {
    app.post('/api/zk/build-circuits', async (req, res) => {
      try {
        await circuitBuilder.buildAllCircuits();
        res.json({ 
          success: true, 
          message: 'Circuits built successfully',
          status: circuitBuilder.getBuildStatus()
        });
      } catch (error: any) {
        res.status(500).json({ 
          success: false, 
          error: error.message 
        });
      }
    });
  }
  
  // Biometric authentication endpoints
  app.post('/api/biometric/register/challenge', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const challenge = await biometricService.generateRegistrationChallenge(userId);
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate challenge' });
    }
  });
  
  app.post('/api/biometric/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const registration = {
        userId,
        ...req.body
      };
      
      const success = await biometricService.registerBiometricCredential(registration);
      
      if (success) {
        res.json({ success: true, message: 'Biometric credential registered' });
      } else {
        res.status(400).json({ error: 'Registration failed' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to register biometric credential' });
    }
  });
  
  app.post('/api/biometric/authenticate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const auth = {
        userId,
        ...req.body
      };
      
      const isValid = await biometricService.authenticateBiometric(auth);
      
      if (isValid) {
        res.json({ success: true, message: 'Biometric authentication successful' });
      } else {
        res.status(401).json({ error: 'Authentication failed' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Authentication error' });
    }
  });
  
  app.get('/api/biometric/devices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const devices = await biometricService.getUserBiometricDevices(userId);
      res.json(devices);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get devices' });
    }
  });
  
  // QR Code generation endpoints
  app.post('/api/qr/generate', isAuthenticated, async (req: any, res) => {
    try {
      const { proofId, expiryMinutes = 15 } = req.body;
      
      if (!proofId) {
        return res.status(400).json({ message: "Proof ID is required" });
      }

      // Get proof details
      const proof = await storage.getProof(proofId);
      if (!proof) {
        return res.status(404).json({ message: "Proof not found" });
      }

      // Verify user owns this proof
      const userId = req.user.claims.sub;
      if (proof.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get proof type
      const proofTypes = await storage.getProofTypes();
      const proofType = proofTypes.find(pt => pt.id === proof.proofTypeId);
      
      if (!proofType) {
        return res.status(404).json({ message: "Proof type not found" });
      }

      const qrResult = await QRCodeService.generateProofQR(
        proofId,
        proofType.name,
        proof.publicSignals,
        expiryMinutes
      );

      res.json(qrResult);
    } catch (error: any) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  // Generate shareable QR code for user's latest proof
  app.get('/api/qr/generate-share', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user's most recent proof
      const proofs = await storage.getUserProofs(userId, 1);
      if (proofs.length === 0) {
        return res.status(404).json({ message: "No proofs found" });
      }

      const proof = proofs[0];
      
      // Get proof type
      const proofTypes = await storage.getProofTypes();
      const proofType = proofTypes.find(pt => pt.id === proof.proofTypeId);
      
      if (!proofType) {
        return res.status(404).json({ message: "Proof type not found" });
      }

      const qrResult = await QRCodeService.generateProofQR(
        proof.id,
        proofType.name,
        proof.publicSignals,
        15 // 15 minutes expiry
      );

      res.json(qrResult);
    } catch (error: any) {
      console.error("Error generating shareable QR code:", error);
      res.status(500).json({ message: "Failed to generate shareable QR code" });
    }
  });

  app.post('/api/qr/verification-request', async (req, res) => {
    try {
      const { organizationId, requiredProofType, callbackUrl, expiryMinutes = 10 } = req.body;
      
      if (!organizationId || !requiredProofType) {
        return res.status(400).json({ message: "Organization ID and proof type are required" });
      }

      const qrResult = await QRCodeService.generateVerificationRequestQR(
        organizationId,
        requiredProofType,
        callbackUrl,
        expiryMinutes
      );

      res.json(qrResult);
    } catch (error: any) {
      console.error("Error generating verification request QR:", error);
      res.status(500).json({ message: "Failed to generate verification request QR" });
    }
  });

  app.post('/api/qr/parse', async (req, res) => {
    try {
      const { qrData } = req.body;
      
      if (!qrData) {
        return res.status(400).json({ message: "QR data is required" });
      }

      const parsedData = QRCodeService.parseQRData(qrData);
      
      if (!parsedData) {
        return res.status(400).json({ message: "Invalid QR code format" });
      }

      const isValid = QRCodeService.isQRValid(parsedData);
      
      res.json({
        data: parsedData,
        isValid,
        expired: !isValid
      });
    } catch (error: any) {
      console.error("Error parsing QR code:", error);
      res.status(500).json({ message: "Failed to parse QR code" });
    }
  });

  // Document upload endpoints
  const upload = documentService.getUploadMiddleware();
  
  app.post('/api/documents/upload', isAuthenticated, upload.array('documents', 3), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = req.files as Express.Multer.File[];
      const { documentType, metadata } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const processedDocuments = [];
      
      for (const file of files) {
        try {
          const document = await documentService.processDocument(
            file,
            userId,
            documentType,
            metadata ? JSON.parse(metadata) : {}
          );
          processedDocuments.push(document);
        } catch (error: any) {
          console.error('Document processing failed:', error);
          // Continue processing other files
        }
      }

      if (processedDocuments.length === 0) {
        return res.status(500).json({ message: "Failed to process any documents" });
      }

      res.json({
        success: true,
        documents: processedDocuments,
        message: `${processedDocuments.length} document(s) uploaded successfully`
      });
    } catch (error: any) {
      console.error("Error uploading documents:", error);
      res.status(500).json({ message: "Failed to upload documents" });
    }
  });

  app.post('/api/documents/verify/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const result = await documentService.verifyDocument(id);
      
      res.json(result);
    } catch (error: any) {
      console.error("Error verifying document:", error);
      res.status(500).json({ message: "Failed to verify document" });
    }
  });

  app.delete('/api/documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const success = await documentService.deleteDocument(id, userId);
      
      if (success) {
        res.json({ success: true, message: "Document deleted securely" });
      } else {
        res.status(404).json({ message: "Document not found or access denied" });
      }
    } catch (error: any) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Proof sharing endpoints
  app.post('/api/proofs/share', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { proofId, expiryDuration, usageLimit, requireAuth, allowedDomains, notifyOnAccess } = req.body;

      // Generate secure share link
      const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
      const shareUrl = `${req.protocol}://${req.get('host')}/share/${shareId}`;
      
      // Calculate expiry time
      const expiresAt = new Date();
      if (expiryDuration === '1h') expiresAt.setHours(expiresAt.getHours() + 1);
      else if (expiryDuration === '24h') expiresAt.setHours(expiresAt.getHours() + 24);
      else if (expiryDuration === '7d') expiresAt.setDate(expiresAt.getDate() + 7);
      else if (expiryDuration === '30d') expiresAt.setDate(expiresAt.getDate() + 30);

      const shareLink = {
        id: shareId,
        proofId,
        userId,
        url: shareUrl,
        expiresAt: expiresAt.toISOString(),
        usageLimit: usageLimit || null,
        usedCount: 0,
        isActive: true,
        requireAuth: requireAuth || false,
        allowedDomains: allowedDomains || [],
        notifyOnAccess: notifyOnAccess || false,
        createdAt: new Date().toISOString()
      };

      // TODO: Store shareLink in database
      
      res.json({
        success: true,
        shareUrl,
        shareLink: {
          id: shareId,
          url: shareUrl,
          expiresAt: shareLink.expiresAt,
          usageLimit: shareLink.usageLimit,
          usedCount: 0,
          isActive: true,
          createdAt: shareLink.createdAt
        }
      });
    } catch (error: any) {
      console.error("Error generating share link:", error);
      res.status(500).json({ message: "Failed to generate share link" });
    }
  });

  app.delete('/api/proofs/share/:shareId', isAuthenticated, async (req: any, res) => {
    try {
      const { shareId } = req.params;
      const userId = req.user.claims.sub;
      
      // TODO: Revoke share link in database
      
      res.json({ success: true, message: "Share link revoked" });
    } catch (error: any) {
      console.error("Error revoking share link:", error);
      res.status(500).json({ message: "Failed to revoke share link" });
    }
  });

  // Organization management endpoints
  app.get('/api/organizations/my', isAuthenticated, async (req: any, res) => {
    try {
      // Mock organization data for development
      const organizations = [
        {
          id: 'org_demo_123',
          name: 'Demo Bank Nepal',
          domain: 'demobank.np',
          apiKey: 'vty_dev_1234567890abcdef',
          isActive: true,
          createdAt: new Date().toISOString(),
          verificationCount: 42,
          lastUsed: new Date().toISOString()
        }
      ];
      
      res.json(organizations);
    } catch (error: any) {
      console.error("Error fetching organizations:", error);
      res.status(500).json({ message: "Failed to fetch organizations" });
    }
  });

  app.get('/api/organizations/stats', isAuthenticated, async (req: any, res) => {
    try {
      // Mock statistics data for development
      const stats = {
        totalVerifications: 156,
        successfulVerifications: 142,
        failedVerifications: 14,
        uniqueUsers: 89,
        topProofTypes: [
          { type: 'age', count: 45 },
          { type: 'citizenship', count: 38 },
          { type: 'education', count: 23 }
        ],
        recentActivity: [
          {
            id: 'act_1',
            type: 'age',
            result: 'success',
            timestamp: new Date().toISOString(),
            userHash: 'abc123...'
          },
          {
            id: 'act_2',
            type: 'citizenship',
            result: 'success',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            userHash: 'def456...'
          }
        ]
      };
      
      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  console.log('🔐 Real-time verification WebSocket server running on /ws/verify');
  console.log('📱 Biometric authentication endpoints enabled');
  console.log('📱 QR code generation and scanning endpoints enabled');
  console.log('📄 Document upload and verification endpoints enabled');
  console.log('🏢 Organization dashboard endpoints enabled');
  console.log('🔗 Proof sharing endpoints enabled');
  
  // Multi-signature proof endpoints
  app.post('/api/multisig/initiate', isAuthenticated, async (req: any, res) => {
    try {
      const { proofId } = req.body;
      const multiSigProofId = await multiSigService.initiateMultiSigProof(proofId);
      res.json({ multiSigProofId, status: 'initiated' });
    } catch (error) {
      console.error('Error initiating multi-sig proof:', error);
      res.status(500).json({ message: 'Failed to initiate multi-sig proof' });
    }
  });

  app.post('/api/multisig/sign', isAuthenticated, async (req: any, res) => {
    try {
      const { multiSigProofId, entityId, signature, metadata } = req.body;
      const result = await multiSigService.addSignature(multiSigProofId, entityId, signature, metadata);
      res.json(result);
    } catch (error) {
      console.error('Error adding signature:', error);
      res.status(500).json({ message: 'Failed to add signature' });
    }
  });

  app.get('/api/multisig/requirements', isAuthenticated, async (req, res) => {
    try {
      const requirements = await multiSigService.getAllRequirements();
      res.json(requirements);
    } catch (error) {
      console.error('Error fetching multi-sig requirements:', error);
      res.status(500).json({ message: 'Failed to fetch requirements' });
    }
  });

  // Fraud detection endpoints
  app.post('/api/fraud/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { proofTypeId, organizationId } = req.body;
      
      const riskScore = await fraudDetectionService.analyzeProofGeneration(userId, proofTypeId, organizationId);
      
      // Update user profile
      await fraudDetectionService.updateUserProfile(userId, proofTypeId);
      
      res.json(riskScore);
    } catch (error) {
      console.error('Error analyzing fraud risk:', error);
      res.status(500).json({ message: 'Failed to analyze risk' });
    }
  });

  app.get('/api/fraud/alerts', isAuthenticated, async (req, res) => {
    try {
      const { severity } = req.query;
      const alerts = await fraudDetectionService.getAlerts(severity as any);
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
      res.status(500).json({ message: 'Failed to fetch alerts' });
    }
  });

  app.get('/api/fraud/statistics', isAuthenticated, async (req, res) => {
    try {
      const stats = await fraudDetectionService.getStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching fraud statistics:', error);
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  });

  // SDK API endpoints for third-party integrations
  app.post('/api/sdk/proof/request', async (req, res) => {
    try {
      const { type, requiredFields, organizationId, callbackUrl, metadata } = req.body;
      
      // Generate proof request
      const proofId = `sdk-proof-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      res.json({
        proofId,
        status: 'pending',
        qrCode: `veridity://verify/${proofId}`,
        expiresAt: expiresAt.toISOString()
      });
    } catch (error) {
      console.error('Error creating SDK proof request:', error);
      res.status(500).json({ message: 'Failed to create proof request' });
    }
  });

  app.get('/api/sdk/proof/verify/:proofId', async (req, res) => {
    try {
      const { proofId } = req.params;
      
      // Mock verification result
      res.json({
        proofId,
        verified: true,
        claims: { age_over_18: true },
        confidence: 0.95,
        timestamp: new Date().toISOString(),
        organizationId: 'sdk-org'
      });
    } catch (error) {
      console.error('Error verifying SDK proof:', error);
      res.status(500).json({ message: 'Failed to verify proof' });
    }
  });

  app.get('/api/sdk/proof/types', async (req, res) => {
    try {
      const proofTypes = await storage.getProofTypes();
      res.json({ proofTypes });
    } catch (error) {
      console.error('Error fetching proof types for SDK:', error);
      res.status(500).json({ message: 'Failed to fetch proof types' });
    }
  });

  // Blockchain integration endpoints
  app.post('/api/blockchain/store', isAuthenticated, async (req: any, res) => {
    try {
      const { proofId, proofData } = req.body;
      const transactionHash = await blockchainService.storeProofOnChain(proofId, proofData);
      res.json({ transactionHash, status: 'pending' });
    } catch (error) {
      console.error('Error storing proof on blockchain:', error);
      res.status(500).json({ message: 'Failed to store proof on blockchain' });
    }
  });

  app.get('/api/blockchain/verify/:proofId', isAuthenticated, async (req, res) => {
    try {
      const { proofId } = req.params;
      const result = await blockchainService.verifyProofOnChain(proofId);
      res.json(result);
    } catch (error) {
      console.error('Error verifying proof on blockchain:', error);
      res.status(500).json({ message: 'Failed to verify proof on blockchain' });
    }
  });

  app.get('/api/blockchain/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await blockchainService.getNetworkStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching blockchain stats:', error);
      res.status(500).json({ message: 'Failed to fetch blockchain stats' });
    }
  });

  // AI Document verification endpoints
  app.post('/api/ai/analyze-document', isAuthenticated, async (req: any, res) => {
    try {
      const { documentData, documentType } = req.body;
      
      // Convert base64 to buffer (in real implementation)
      const documentBuffer = Buffer.from(documentData || '', 'base64');
      
      const analysis = await aiDocumentVerificationService.analyzeDocument(documentBuffer, documentType);
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing document:', error);
      res.status(500).json({ message: 'Failed to analyze document' });
    }
  });

  app.get('/api/ai/document-templates', isAuthenticated, async (req, res) => {
    try {
      const templates = await aiDocumentVerificationService.getDocumentTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Error fetching document templates:', error);
      res.status(500).json({ message: 'Failed to fetch document templates' });
    }
  });

  app.post('/api/ai/validate-template', isAuthenticated, async (req: any, res) => {
    try {
      const { analysis, templateId } = req.body;
      const validation = await aiDocumentVerificationService.validateAgainstTemplate(analysis, templateId);
      res.json(validation);
    } catch (error) {
      console.error('Error validating against template:', error);
      res.status(500).json({ message: 'Failed to validate against template' });
    }
  });

  // International expansion endpoints
  app.get('/api/expansion/opportunities', isAuthenticated, async (req, res) => {
    try {
      const opportunities = await marketExpansionService.getMarketOpportunities();
      res.json(opportunities);
    } catch (error) {
      console.error('Error fetching market opportunities:', error);
      res.status(500).json({ message: 'Failed to fetch market opportunities' });
    }
  });

  app.get('/api/expansion/countries', isAuthenticated, async (req, res) => {
    try {
      const countries = await marketExpansionService.getAllCountryConfigs();
      res.json(countries);
    } catch (error) {
      console.error('Error fetching country configs:', error);
      res.status(500).json({ message: 'Failed to fetch country configs' });
    }
  });

  app.get('/api/expansion/progress', isAuthenticated, async (req, res) => {
    try {
      const progress = await marketExpansionService.trackExpansionProgress();
      res.json(progress);
    } catch (error) {
      console.error('Error fetching expansion progress:', error);
      res.status(500).json({ message: 'Failed to fetch expansion progress' });
    }
  });

  // Add health monitoring endpoints
  await addHealthEndpoints(app);
  console.log('💊 Health monitoring endpoints enabled');
  console.log('🔐 Multi-signature proof endpoints enabled');
  console.log('🛡️ Fraud detection endpoints enabled');
  console.log('🛠️ SDK API endpoints enabled');
  console.log('🌍 International expansion endpoints enabled');
  
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

// Add health check endpoints before returning server
async function addHealthEndpoints(app: Express) {
  // Health check endpoints
  app.get('/api/health', async (req, res) => {
    try {
      const health = await healthMonitor.getHealth();
      const statusCode = health.status === 'healthy' ? 200 : 
                        health.status === 'degraded' ? 206 : 503;
      
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  });

  app.get('/api/health/metrics', async (req, res) => {
    try {
      const metrics = healthMonitor.getMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get metrics' });
    }
  });
}
