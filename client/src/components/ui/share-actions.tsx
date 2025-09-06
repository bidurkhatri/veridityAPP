import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Share, Download, Link2, FileText, QrCode, Shield, CheckCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareActionsProps {
  proofUrl: string;
  proofTitle: string;
  privacyLevel: 'minimal' | 'standard' | 'detailed';
  className?: string;
  onShareComplete?: () => void;
}

const privacyInfo = {
  minimal: {
    label: 'Minimal sharing',
    description: 'Only proof validity and type',
    icon: Shield,
    color: 'text-success-text bg-success-bg border-success-border',
  },
  standard: {
    label: 'Standard sharing', 
    description: 'Proof details without personal data',
    icon: Shield,
    color: 'text-info-text bg-info-bg border-info-border',
  },
  detailed: {
    label: 'Detailed sharing',
    description: 'Full verification data',
    icon: Shield,
    color: 'text-warning-text bg-warning-bg border-warning-border',
  },
};

export function ShareActions({
  proofUrl,
  proofTitle,
  privacyLevel,
  className,
  onShareComplete,
}: ShareActionsProps) {
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();
  const privacy = privacyInfo[privacyLevel];
  const PrivacyIcon = privacy.icon;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(proofUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Proof link copied to clipboard",
        variant: "success",
      });
      setTimeout(() => setCopied(false), 2000);
      onShareComplete?.();
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Veridity Proof: ${proofTitle}`,
          text: `Verify my identity proof: ${proofTitle}`,
          url: proofUrl,
        });
        onShareComplete?.();
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast({
            title: "Share failed",
            description: "Could not share proof",
            variant: "destructive",
          });
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSavePDF = () => {
    // In a real implementation, this would generate a PDF
    const link = document.createElement('a');
    link.href = `${proofUrl}/pdf`;
    link.download = `${proofTitle.replace(/\s+/g, '_')}_proof.pdf`;
    link.click();
    
    toast({
      title: "PDF downloaded",
      description: "Proof saved as PDF file",
      variant: "success",
    });
    onShareComplete?.();
  };

  const handleViewQR = () => {
    // This would typically open a QR code modal
    toast({
      title: "QR Code",
      description: "QR code generated for easy sharing",
      variant: "default",
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Privacy Information Card */}
      <Card className="bg-surface-secondary/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <PrivacyIcon className="h-4 w-4" />
            Privacy Protected
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Badge className={cn("text-xs", privacy.color)}>
                {privacy.label}
              </Badge>
              <p className="text-xs text-text-tertiary mt-1">
                {privacy.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              data-testid="privacy-details-link"
            >
              What's shared?
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Share Actions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-text-primary">Share your proof</h4>
        
        <div className="grid grid-cols-1 gap-2">
          {/* Copy Link - Primary Action */}
          <Button
            onClick={handleCopyLink}
            className="justify-start gap-3 h-auto py-3"
            data-testid="copy-link-button"
          >
            {copied ? (
              <CheckCircle className="h-4 w-4 text-success-text" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <div className="flex-1 text-left">
              <div className="font-medium">
                {copied ? 'Copied!' : 'Copy link'}
              </div>
              <div className="text-xs opacity-80">
                Share via messaging or email
              </div>
            </div>
          </Button>

          {/* Native Share */}
          <Button
            variant="outline"
            onClick={handleNativeShare}
            className="justify-start gap-3 h-auto py-3"
            data-testid="share-button"
          >
            <Share className="h-4 w-4" />
            <div className="flex-1 text-left">
              <div className="font-medium">Share</div>
              <div className="text-xs opacity-70">
                Use device sharing options
              </div>
            </div>
          </Button>

          {/* Save PDF */}
          <Button
            variant="outline"
            onClick={handleSavePDF}
            className="justify-start gap-3 h-auto py-3"
            data-testid="save-pdf-button"
          >
            <Download className="h-4 w-4" />
            <div className="flex-1 text-left">
              <div className="font-medium">Save PDF</div>
              <div className="text-xs opacity-70">
                Download printable version
              </div>
            </div>
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-2 pt-2 border-t border-border-default">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewQR}
            data-testid="qr-code-button"
            className="flex-1"
          >
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            data-testid="add-to-wallet-button"
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            Add to Wallet
          </Button>
        </div>
      </div>
    </div>
  );
}