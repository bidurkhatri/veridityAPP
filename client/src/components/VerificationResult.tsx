import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useTranslation, type Language } from "@/lib/i18n";

interface VerificationResultProps {
  result: {
    valid: boolean;
    proofType: string;
    details: {
      verificationTime: string;
      algorithm: string;
      circuitHash?: string;
    };
    verificationId?: string;
  };
  language: Language;
}

export function VerificationResult({ result, language }: VerificationResultProps) {
  const { t } = useTranslation(language);

  return (
    <Card className={`border-2 ${result.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              result.valid ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {result.valid ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {result.valid ? t('message.proofVerified') : t('message.proofFailed')}
              </h3>
              <p className="text-sm text-muted-foreground">{result.proofType}</p>
            </div>
          </div>
          <Badge variant={result.valid ? "default" : "destructive"}>
            {result.valid ? "VERIFIED" : "FAILED"}
          </Badge>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Verification Time:</span>
            <span className="text-foreground flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {new Date(result.details.verificationTime).toLocaleTimeString()}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Algorithm:</span>
            <span className="text-foreground">{result.details.algorithm}</span>
          </div>

          {result.details.circuitHash && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Circuit Hash:</span>
              <span className="text-foreground font-mono">
                {result.details.circuitHash.slice(0, 16)}...
              </span>
            </div>
          )}

          {result.verificationId && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Verification ID:</span>
              <span className="text-foreground font-mono">
                {result.verificationId.slice(0, 8)}...
              </span>
            </div>
          )}
        </div>

        {result.valid && (
          <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Proof is valid and trustworthy
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
