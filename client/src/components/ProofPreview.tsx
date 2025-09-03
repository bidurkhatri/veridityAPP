import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import {
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  Info,
  Users,
  Building,
  AlertTriangle
} from "lucide-react";

interface ProofPreviewProps {
  proofType: string;
  verifierName?: string;
  onProceed: () => void;
  onCancel: () => void;
}

interface PreviewData {
  whatTheyWillSee: string[];
  whatTheyWontSee: string[];
  expiresIn: string;
  estimatedTime: string;
  requiredData: string[];
}

export function ProofPreview({ proofType, verifierName = "Organization", onProceed, onCancel }: ProofPreviewProps) {
  const { t } = useTranslation('en');
  const [showDetails, setShowDetails] = useState(false);

  // Mock data based on proof type
  const getPreviewData = (type: string): PreviewData => {
    switch (type) {
      case 'age_over_18':
        return {
          whatTheyWillSee: [
            "✓ Age verified (18 or older)",
            "✓ Verification timestamp",
            "✓ Cryptographic proof validity"
          ],
          whatTheyWontSee: [
            "Your exact birth date",
            "Your full name",
            "Your address or location",
            "Any other personal information"
          ],
          expiresIn: "15 minutes",
          estimatedTime: "10-15 seconds",
          requiredData: ["Date of birth"]
        };
      case 'age_over_21':
        return {
          whatTheyWillSee: [
            "✓ Age verified (21 or older)",
            "✓ Verification timestamp",
            "✓ Cryptographic proof validity"
          ],
          whatTheyWontSee: [
            "Your exact birth date",
            "Your full name", 
            "Your address or location",
            "Any other personal information"
          ],
          expiresIn: "15 minutes",
          estimatedTime: "10-15 seconds",
          requiredData: ["Date of birth"]
        };
      case 'citizenship':
        return {
          whatTheyWillSee: [
            "✓ Nepali citizenship verified",
            "✓ Verification timestamp",
            "✓ Government-issued credential proof"
          ],
          whatTheyWontSee: [
            "Your citizenship number",
            "Your full name or address",
            "Issue or expiry dates",
            "District or ward information"
          ],
          expiresIn: "30 minutes",
          estimatedTime: "15-20 seconds",
          requiredData: ["Citizenship certificate"]
        };
      default:
        return {
          whatTheyWillSee: ["✓ Verification completed"],
          whatTheyWontSee: ["All personal details"],
          expiresIn: "15 minutes",
          estimatedTime: "10 seconds",
          requiredData: ["Required documents"]
        };
    }
  };

  const previewData = getPreviewData(proofType);

  return (
    <Card className="apple-card apple-glass border-0 apple-shadow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>Proof Preview</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Review what {verifierName} will and won't see
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Verifier Info */}
        <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{verifierName}</p>
              <p className="text-xs text-muted-foreground">Requesting verification</p>
            </div>
          </div>
          <Badge className="bg-success/10 text-success border-success/20 text-xs">
            Verified Partner
          </Badge>
        </div>

        {/* What They Will See */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-success" />
            <h4 className="font-semibold text-sm text-success">What They Will See</h4>
          </div>
          <div className="space-y-2">
            {previewData.whatTheyWillSee.map((item, index) => (
              <div key={index} className="flex items-start space-x-2 p-2 bg-success/5 rounded-lg">
                <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What They Won't See */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <EyeOff className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm text-primary">What Stays Private</h4>
          </div>
          <div className="space-y-2">
            {previewData.whatTheyWontSee.map((item, index) => (
              <div key={index} className="flex items-start space-x-2 p-2 bg-primary/5 rounded-lg">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Proof Details */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full justify-between apple-button"
          >
            <span>Proof Details</span>
            <Info className="h-4 w-4" />
          </Button>
          
          {showDetails && (
            <div className="space-y-3 p-3 bg-muted/5 rounded-lg border border-border/20">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Expires In</p>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-warning" />
                    <span>{previewData.expiresIn}</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Generation Time</p>
                  <span>{previewData.estimatedTime}</span>
                </div>
              </div>
              
              <div>
                <p className="font-medium text-muted-foreground text-sm mb-2">Required Data</p>
                <div className="flex flex-wrap gap-1">
                  {previewData.requiredData.map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-accent mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-accent mb-1">Zero-Knowledge Privacy</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                This proof is generated entirely on your device. Your personal data never leaves your phone
                and cannot be intercepted or accessed by anyone, including Veridity.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 apple-button"
          >
            Cancel
          </Button>
          <Button
            onClick={onProceed}
            className="flex-1 apple-gradient apple-button border-0"
          >
            Generate Proof
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}