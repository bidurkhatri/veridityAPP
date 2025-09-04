import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Flag, GraduationCap, Banknote, MapPin, Share, Download, QrCode } from "lucide-react";
import { useTranslation, type Language } from "@/lib/i18n";
import { QRGenerator } from "./QRGenerator";

interface ProofCardProps {
  proof: {
    id: string;
    proofType: {
      name: string;
      nameNepali: string;
      circuitId: string;
    };
    status: string;
    createdAt: string;
    expiresAt?: string;
  };
  language: Language;
}

const proofIcons = {
  age_verification: CalendarCheck,
  citizenship_verification: Flag,
  education_verification: GraduationCap,
  income_verification: Banknote,
  address_verification: MapPin,
};

export function ProofCard({ proof, language }: ProofCardProps) {
  const { t } = useTranslation(language);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const IconComponent = proofIcons[proof.proofType.circuitId as keyof typeof proofIcons] || CalendarCheck;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                {language === 'np' ? proof.proofType.nameNepali : proof.proofType.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {new Date(proof.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge className={`${getStatusColor(proof.status)} text-white`}>
            {proof.status.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="text-sm">
            <span className="text-muted-foreground">Proof ID: </span>
            <span className="font-mono text-foreground">{proof.id.slice(0, 8)}...</span>
          </div>
          
          {proof.expiresAt && (
            <div className="text-sm">
              <span className="text-muted-foreground">Expires: </span>
              <span className="text-foreground">
                {new Date(proof.expiresAt).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1" 
              onClick={() => setShowQRGenerator(true)}
              data-testid="button-share-proof"
            >
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1" 
              onClick={() => {
                // TODO: Implement PDF download
                console.log('Download PDF for proof:', proof.id);
              }}
              data-testid="button-download-proof"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowQRGenerator(true)}
              data-testid="button-qr-proof"
            >
              <QrCode className="h-4 w-4" />
            </Button>
          </div>

          {/* QR Generator Modal */}
          {showQRGenerator && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <QRGenerator
                proofId={proof.id}
                proofType={proof.proofType.name}
                language={language}
                onClose={() => setShowQRGenerator(false)}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
