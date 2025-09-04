import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface DocumentUpload {
  id: string;
  userId: string;
  documentType: 'citizenship' | 'education' | 'income' | 'address' | 'other';
  originalName: string;
  filename: string;
  size: number;
  mimeType: string;
  hash: string;
  encryptionKey?: string;
  uploadedAt: Date;
  expiresAt?: Date;
  isVerified: boolean;
  metadata?: Record<string, any>;
}

export interface DocumentVerificationResult {
  isValid: boolean;
  confidence: number;
  extractedData?: Record<string, any>;
  issues?: string[];
}

export class DocumentService {
  private uploadPath: string;
  private maxFileSize = 10 * 1024 * 1024; // 10MB
  private allowedMimeTypes = [
    'image/jpeg',
    'image/png', 
    'image/webp',
    'application/pdf',
    'image/heic',
    'image/heif'
  ];

  constructor() {
    this.uploadPath = path.join(process.cwd(), 'uploads', 'documents');
    this.ensureUploadDirectory();
  }

  // Configure multer for secure uploads
  getUploadMiddleware() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadPath);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}_${crypto.randomBytes(16).toString('hex')}${ext}`;
        cb(null, filename);
      }
    });

    return multer({
      storage,
      fileFilter: (req, file, cb) => {
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
          cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
          return;
        }
        cb(null, true);
      },
      limits: {
        fileSize: this.maxFileSize,
        files: 3 // Max 3 files per upload
      }
    });
  }

  // Process uploaded document
  async processDocument(
    file: Express.Multer.File,
    userId: string,
    documentType: string,
    metadata?: Record<string, any>
  ): Promise<DocumentUpload> {
    try {
      // Generate file hash for integrity verification
      const fileHash = await this.generateFileHash(file.path);
      
      // Encrypt sensitive documents
      let encryptionKey: string | undefined;
      if (this.isSensitiveDocument(documentType)) {
        encryptionKey = await this.encryptFile(file.path);
      }

      const document: DocumentUpload = {
        id: `doc_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
        userId,
        documentType: documentType as any,
        originalName: file.originalname,
        filename: file.filename,
        size: file.size,
        mimeType: file.mimetype,
        hash: fileHash,
        encryptionKey,
        uploadedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isVerified: false,
        metadata
      };

      // Store document metadata in database (implement with your storage layer)
      await this.storeDocumentMetadata(document);

      // Queue document for verification
      await this.queueDocumentVerification(document);

      return document;
    } catch (error: any) {
      // Clean up uploaded file on error
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new Error(`Document processing failed: ${error?.message || error}`);
    }
  }

  // Verify document authenticity and extract data
  async verifyDocument(documentId: string): Promise<DocumentVerificationResult> {
    try {
      const document = await this.getDocumentMetadata(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Perform document verification based on type
      switch (document.documentType) {
        case 'citizenship':
          return this.verifyCitizenshipDocument(document);
        case 'education':
          return this.verifyEducationDocument(document);
        case 'income':
          return this.verifyIncomeDocument(document);
        case 'address':
          return this.verifyAddressDocument(document);
        default:
          return this.verifyGenericDocument(document);
      }
    } catch (error: any) {
      return {
        isValid: false,
        confidence: 0,
        issues: [error?.message || 'Verification failed']
      };
    }
  }

  // Get document securely (decrypt if needed)
  async getDocument(documentId: string, userId: string): Promise<Buffer | null> {
    try {
      const document = await this.getDocumentMetadata(documentId);
      
      if (!document || document.userId !== userId) {
        throw new Error('Document not found or access denied');
      }

      const filePath = path.join(this.uploadPath, document.filename);
      
      if (!fs.existsSync(filePath)) {
        throw new Error('Document file not found');
      }

      let fileBuffer = fs.readFileSync(filePath);

      // Decrypt if encrypted
      if (document.encryptionKey) {
        fileBuffer = await this.decryptFile(fileBuffer, document.encryptionKey);
      }

      return fileBuffer;
    } catch (error) {
      console.error('Document retrieval failed:', error);
      return null;
    }
  }

  // Delete document securely
  async deleteDocument(documentId: string, userId: string): Promise<boolean> {
    try {
      const document = await this.getDocumentMetadata(documentId);
      
      if (!document || document.userId !== userId) {
        return false;
      }

      const filePath = path.join(this.uploadPath, document.filename);
      
      // Secure file deletion
      if (fs.existsSync(filePath)) {
        // Overwrite file with random data before deletion
        const fileSize = fs.statSync(filePath).size;
        const randomData = crypto.randomBytes(fileSize);
        fs.writeFileSync(filePath, randomData);
        fs.unlinkSync(filePath);
      }

      // Remove from database
      await this.removeDocumentMetadata(documentId);

      return true;
    } catch (error) {
      console.error('Document deletion failed:', error);
      return false;
    }
  }

  // Private helper methods
  private ensureUploadDirectory() {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  private async generateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private isSensitiveDocument(documentType: string): boolean {
    return ['citizenship', 'income', 'address'].includes(documentType);
  }

  private async encryptFile(filePath: string): Promise<string> {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', key);

    const input = fs.readFileSync(filePath);
    const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
    
    fs.writeFileSync(filePath, encrypted);
    
    return Buffer.concat([key, iv]).toString('base64');
  }

  private async decryptFile(encryptedBuffer: Buffer, encryptionKey: string): Promise<Buffer> {
    const keyIv = Buffer.from(encryptionKey, 'base64');
    const key = keyIv.slice(0, 32);
    const iv = keyIv.slice(32, 48);
    
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
  }

  private async storeDocumentMetadata(document: DocumentUpload): Promise<void> {
    // TODO: Implement with your database layer
    console.log('Storing document metadata:', document.id);
  }

  private async getDocumentMetadata(documentId: string): Promise<DocumentUpload | null> {
    // TODO: Implement with your database layer
    return null;
  }

  private async removeDocumentMetadata(documentId: string): Promise<void> {
    // TODO: Implement with your database layer
    console.log('Removing document metadata:', documentId);
  }

  private async queueDocumentVerification(document: DocumentUpload): Promise<void> {
    // TODO: Implement document verification queue
    console.log('Queuing document for verification:', document.id);
  }

  // Document verification implementations
  private async verifyCitizenshipDocument(document: DocumentUpload): Promise<DocumentVerificationResult> {
    // Mock verification for citizenship documents
    return {
      isValid: true,
      confidence: 0.95,
      extractedData: {
        citizenshipNumber: 'MOCK_' + crypto.randomBytes(4).toString('hex'),
        fullName: 'Mock User',
        dateOfBirth: '1990-01-01',
        district: 'Kathmandu'
      }
    };
  }

  private async verifyEducationDocument(document: DocumentUpload): Promise<DocumentVerificationResult> {
    // Mock verification for education documents
    return {
      isValid: true,
      confidence: 0.92,
      extractedData: {
        certificateId: 'EDU_' + crypto.randomBytes(4).toString('hex'),
        institution: 'Mock University',
        degree: 'Bachelor Degree',
        completionYear: '2020'
      }
    };
  }

  private async verifyIncomeDocument(document: DocumentUpload): Promise<DocumentVerificationResult> {
    // Mock verification for income documents
    return {
      isValid: true,
      confidence: 0.88,
      extractedData: {
        employerName: 'Mock Company',
        monthlyIncome: 75000,
        currency: 'NPR',
        issueDate: new Date().toISOString()
      }
    };
  }

  private async verifyAddressDocument(document: DocumentUpload): Promise<DocumentVerificationResult> {
    // Mock verification for address documents
    return {
      isValid: true,
      confidence: 0.91,
      extractedData: {
        fullAddress: 'Mock Address, Kathmandu',
        district: 'Kathmandu',
        municipality: 'Kathmandu Metropolitan City',
        wardNo: 1
      }
    };
  }

  private async verifyGenericDocument(document: DocumentUpload): Promise<DocumentVerificationResult> {
    return {
      isValid: true,
      confidence: 0.75,
      extractedData: {
        documentType: document.documentType,
        processedAt: new Date().toISOString()
      }
    };
  }
}

export const documentService = new DocumentService();