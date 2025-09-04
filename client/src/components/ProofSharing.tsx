import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { QRGenerator } from '@/components/QRGenerator';
import {
  Share,
  Copy,
  Link,
  Clock,
  Shield,
  QrCode,
  Mail,
  MessageSquare,
  Settings,
  Eye,
  Calendar,
  Users
} from 'lucide-react';

interface ProofSharingProps {
  proofId: string;
  proofType: string;
  onClose?: () => void;
}

interface ShareLink {
  id: string;
  url: string;
  expiresAt: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export function ProofSharing({ proofId, proofType, onClose }: ProofSharingProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [shareOptions, setShareOptions] = useState({
    expiryDuration: '24h',
    usageLimit: '',
    requireAuth: false,
    allowedDomains: '',
    notifyOnAccess: true
  });
  
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [currentShareUrl, setCurrentShareUrl] = useState('');

  // Generate secure sharing link
  const generateLinkMutation = useMutation({
    mutationFn: async (options: any) => {
      const response = await fetch('/api/proofs/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proofId,
          ...options
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate share link');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentShareUrl(data.shareUrl);
      setShareLinks(prev => [data.shareLink, ...prev]);
      setShowQR(true);
      
      toast({
        title: "Share Link Created",
        description: "Secure sharing link generated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Revoke share link
  const revokeLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      const response = await fetch(`/api/proofs/share/${linkId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to revoke link');
      }
      
      return response.json();
    },
    onSuccess: (_, linkId) => {
      setShareLinks(prev => prev.filter(link => link.id !== linkId));
      toast({
        title: "Link Revoked",
        description: "Share link has been deactivated"
      });
    }
  });

  const handleGenerateLink = () => {
    const options = {
      expiryDuration: shareOptions.expiryDuration,
      usageLimit: shareOptions.usageLimit ? parseInt(shareOptions.usageLimit) : undefined,
      requireAuth: shareOptions.requireAuth,
      allowedDomains: shareOptions.allowedDomains ? shareOptions.allowedDomains.split(',').map(d => d.trim()) : [],
      notifyOnAccess: shareOptions.notifyOnAccess
    };

    generateLinkMutation.mutate(options);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Link copied to clipboard"
    });
  };

  const shareViaEmail = () => {
    const subject = `Identity Verification Request - ${proofType}`;
    const body = `Please verify my ${proofType} proof using this secure link: ${currentShareUrl}

This link is secure and expires automatically. No personal data is shared.

Powered by Veridity - Privacy-First Identity Verification`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const shareViaWhatsApp = () => {
    const message = `Please verify my ${proofType} proof using this secure link: ${currentShareUrl}

This link expires automatically and protects my privacy.`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  const formatExpiryTime = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      return `${Math.floor(hours / 24)} days`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes} minutes`;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="apple-card apple-glass border-0 apple-shadow">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Share className="mr-3 h-6 w-6 text-primary" />
            Share {proofType} Proof
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Sharing Options */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Sharing Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry Time</Label>
                <Select value={shareOptions.expiryDuration} onValueChange={(value) => 
                  setShareOptions(prev => ({ ...prev, expiryDuration: value }))
                }>
                  <SelectTrigger data-testid="select-expiry-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Usage Limit (optional)</Label>
                <Input
                  type="number"
                  placeholder="Unlimited"
                  value={shareOptions.usageLimit}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, usageLimit: e.target.value }))}
                  data-testid="input-usage-limit"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Require Organization Authentication</Label>
                <Switch
                  checked={shareOptions.requireAuth}
                  onCheckedChange={(checked) => setShareOptions(prev => ({ ...prev, requireAuth: checked }))}
                  data-testid="switch-require-auth"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Notify Me When Accessed</Label>
                <Switch
                  checked={shareOptions.notifyOnAccess}
                  onCheckedChange={(checked) => setShareOptions(prev => ({ ...prev, notifyOnAccess: checked }))}
                  data-testid="switch-notify-access"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Allowed Domains (optional)</Label>
              <Input
                placeholder="company.com, bank.np (comma separated)"
                value={shareOptions.allowedDomains}
                onChange={(e) => setShareOptions(prev => ({ ...prev, allowedDomains: e.target.value }))}
                data-testid="input-allowed-domains"
              />
            </div>
          </div>

          {/* Generate Link Button */}
          <Button
            onClick={handleGenerateLink}
            disabled={generateLinkMutation.isPending}
            className="w-full apple-gradient apple-button border-0 shadow-lg"
            data-testid="button-generate-share-link"
          >
            <Link className="h-4 w-4 mr-2" />
            {generateLinkMutation.isPending ? 'Generating...' : 'Generate Secure Share Link'}
          </Button>

          {/* QR Code Display */}
          {showQR && currentShareUrl && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6 text-center">
                <div className="space-y-4">
                  <QRGenerator 
                    proofId={proofId}
                    proofType={proofType}
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Secure Sharing Link</p>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={currentShareUrl}
                        readOnly
                        className="text-xs"
                        data-testid="input-share-url"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(currentShareUrl)}
                        data-testid="button-copy-share-url"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Quick Share Options */}
                  <div className="flex space-x-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareViaEmail}
                      data-testid="button-share-email"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareViaWhatsApp}
                      data-testid="button-share-whatsapp"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Share Links */}
          {shareLinks.length > 0 && (
            <Card className="border-border/20">
              <CardHeader>
                <CardTitle className="text-lg">Active Share Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shareLinks.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={link.isActive ? "default" : "secondary"}>
                          {link.isActive ? 'Active' : 'Expired'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Expires in {formatExpiryTime(link.expiresAt)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Used: {link.usedCount}{link.usageLimit ? `/${link.usageLimit}` : ''}</span>
                        <span>Created: {new Date(link.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(link.url)}
                        data-testid={`button-copy-link-${link.id}`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeLinkMutation.mutate(link.id)}
                        data-testid={`button-revoke-link-${link.id}`}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Privacy Notice */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary">Privacy Protected</p>
                <p className="text-xs text-muted-foreground">
                  Share links contain only cryptographic proofs. No personal information is accessible through these links.
                  Links automatically expire and can be revoked at any time.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}