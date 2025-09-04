import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTranslation, type Language } from '@/lib/i18n';
import {
  Upload,
  File,
  Image,
  CheckCircle,
  AlertTriangle,
  X,
  FileText,
  Camera,
  Shield
} from 'lucide-react';

interface DocumentUploadProps {
  documentType: string;
  onUploadSuccess?: (documents: any[]) => void;
  onClose?: () => void;
  language?: Language;
  maxFiles?: number;
}

export function DocumentUpload({ 
  documentType, 
  onUploadSuccess, 
  onClose, 
  language = 'en',
  maxFiles = 3 
}: DocumentUploadProps) {
  const { toast } = useToast();
  const { t } = useTranslation(language);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [metadata, setMetadata] = useState<Record<string, string>>({});

  // Document upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: { files: File[]; documentType: string; metadata: any }) => {
      const formData = new FormData();
      
      data.files.forEach(file => {
        formData.append('documents', file);
      });
      
      formData.append('documentType', data.documentType);
      formData.append('metadata', JSON.stringify(data.metadata));

      // Create custom fetch with progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(Math.round(progress));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.responseText || 'Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.open('POST', '/api/documents/upload');
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send(formData);
      });
    },
    onSuccess: (result: any) => {
      toast({
        title: "Upload Successful",
        description: `${result.documents.length} document(s) uploaded and queued for verification`
      });
      
      // Reset form
      setSelectedFiles([]);
      setUploadProgress(0);
      setMetadata({});
      
      if (onUploadSuccess) {
        onUploadSuccess(result.documents);
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
      setUploadProgress(0);
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: "Too Many Files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: `${file.name}: Only images and PDFs are allowed`,
          variant: "destructive"
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File Too Large",
          description: `${file.name}: Maximum size is 10MB`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to upload",
        variant: "destructive"
      });
      return;
    }

    uploadMutation.mutate({
      files: selectedFiles,
      documentType,
      metadata
    });
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type === 'application/pdf') return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getDocumentTypeInfo = () => {
    const types: Record<string, { name: string; description: string; icon: React.ElementType }> = {
      citizenship: {
        name: 'Citizenship Certificate',
        description: 'Upload your citizenship certificate or national ID',
        icon: Shield
      },
      education: {
        name: 'Education Documents',
        description: 'Upload academic certificates, transcripts, or degrees',
        icon: FileText
      },
      income: {
        name: 'Income Documents',
        description: 'Upload salary slips, tax documents, or income statements',
        icon: FileText
      },
      address: {
        name: 'Address Verification',
        description: 'Upload utility bills, bank statements, or rental agreements',
        icon: FileText
      }
    };
    
    return types[documentType] || types.citizenship;
  };

  const docTypeInfo = getDocumentTypeInfo();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="apple-card apple-glass border-0 apple-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl">
              <docTypeInfo.icon className="mr-3 h-6 w-6 text-primary" />
              Upload {docTypeInfo.name}
            </CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-upload">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {docTypeInfo.description}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* File Selection */}
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={triggerFileSelect}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm font-medium text-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Images (JPG, PNG, HEIC) or PDF files, max 10MB each
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-file-upload"
            />

            {/* Alternative upload methods */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={triggerFileSelect}
                className="flex items-center justify-center"
                data-testid="button-browse-files"
              >
                <File className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // TODO: Implement camera capture
                  toast({
                    title: "Camera Capture",
                    description: "Camera capture will be implemented next"
                  });
                }}
                data-testid="button-take-photo"
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <Label>Selected Files ({selectedFiles.length}/{maxFiles})</Label>
              {selectedFiles.map((file, index) => {
                const FileIcon = getFileIcon(file);
                return (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileIcon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      data-testid={`button-remove-file-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Additional Metadata */}
          <div className="space-y-4">
            <Label>Additional Information (Optional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Document reference number"
                  value={metadata.referenceNumber || ''}
                  onChange={(e) => setMetadata(prev => ({ ...prev, referenceNumber: e.target.value }))}
                  data-testid="input-reference-number"
                />
              </div>
              <div>
                <Input
                  placeholder="Issuing authority"
                  value={metadata.issuingAuthority || ''}
                  onChange={(e) => setMetadata(prev => ({ ...prev, issuingAuthority: e.target.value }))}
                  data-testid="input-issuing-authority"
                />
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadMutation.isPending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Upload Button */}
          <div className="flex space-x-3">
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploadMutation.isPending}
              className="flex-1 apple-gradient apple-button border-0 shadow-lg"
              data-testid="button-start-upload"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadMutation.isPending ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
            </Button>
            
            {onClose && (
              <Button
                variant="outline"
                onClick={onClose}
                disabled={uploadMutation.isPending}
                data-testid="button-cancel-upload"
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary">Secure Upload</p>
                <p className="text-xs text-muted-foreground">
                  Documents are encrypted during upload and processed locally. 
                  Sensitive data never leaves Nepal and is deleted after verification.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}