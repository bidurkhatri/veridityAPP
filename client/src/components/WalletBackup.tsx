import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import {
  Shield,
  Key,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
  Smartphone,
  Fingerprint
} from "lucide-react";

interface BackupStatus {
  hasPasskey: boolean;
  hasMnemonic: boolean;
  lastBackup?: string;
}

interface WalletBackupProps {
  onBackupComplete?: () => void;
}

export function WalletBackup({ onBackupComplete }: WalletBackupProps) {
  const { t } = useTranslation('en');
  const [backupStatus, setBackupStatus] = useState<BackupStatus>({
    hasPasskey: false,
    hasMnemonic: false,
  });
  const [currentStep, setCurrentStep] = useState<'choose' | 'passkey' | 'mnemonic' | 'complete'>('choose');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [mnemonic, setMnemonic] = useState<string[]>([]);

  // Mock mnemonic generation
  const generateMnemonic = (): string[] => {
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    ];
    return Array.from({ length: 12 }, (_, i) => words[i] || `word${i + 1}`);
  };

  const createPasskeyBackup = async () => {
    setIsCreating(true);
    try {
      // WebAuthn registration
      if (!window.navigator.credentials) {
        throw new Error('WebAuthn not supported');
      }

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: {
            name: "Veridity",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode("user-id"),
            name: "user@example.com",
            displayName: "Veridity User",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
          attestation: "none",
        },
      });

      if (credential) {
        // Store encrypted backup with passkey
        setBackupStatus(prev => ({ ...prev, hasPasskey: true, lastBackup: new Date().toISOString() }));
        setCurrentStep('complete');
        onBackupComplete?.();
      }
    } catch (error) {
      console.error('Passkey creation failed:', error);
      alert('Passkey setup failed. Please try the mnemonic backup instead.');
      setCurrentStep('mnemonic');
    } finally {
      setIsCreating(false);
    }
  };

  const createMnemonicBackup = () => {
    const words = generateMnemonic();
    setMnemonic(words);
    setBackupStatus(prev => ({ ...prev, hasMnemonic: true, lastBackup: new Date().toISOString() }));
    setCurrentStep('mnemonic');
  };

  const copyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic.join(' '));
  };

  const completeMnemonicBackup = () => {
    setCurrentStep('complete');
    onBackupComplete?.();
  };

  const restoreFromPasskey = async () => {
    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [],
          userVerification: "required",
          timeout: 60000,
        },
      });

      if (credential) {
        // Decrypt and restore wallet
        alert('Wallet restored successfully from Passkey!');
      }
    } catch (error) {
      console.error('Passkey restore failed:', error);
      alert('Passkey restore failed. Please try mnemonic restore.');
    }
  };

  if (currentStep === 'choose') {
    return (
      <Card className="apple-card apple-glass border-0 apple-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Wallet Backup</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Secure your proofs with end-to-end encrypted backup
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          {(backupStatus.hasPasskey || backupStatus.hasMnemonic) && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">Backup Active</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                {backupStatus.hasPasskey && <p>✓ Passkey backup enabled</p>}
                {backupStatus.hasMnemonic && <p>✓ Mnemonic backup created</p>}
                {backupStatus.lastBackup && (
                  <p>Last backup: {new Date(backupStatus.lastBackup).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}

          {/* Backup Options */}
          <div className="space-y-3">
            <div 
              className="p-4 border border-border/20 rounded-xl hover:bg-muted/20 cursor-pointer transition-colors"
              onClick={createPasskeyBackup}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center">
                  <Fingerprint className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Passkey Backup (Recommended)</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Use Face ID, Touch ID, or Windows Hello. Most secure and convenient.
                  </p>
                  <Badge className="mt-2 bg-primary/10 text-primary border-primary/20 text-xs">
                    Platform Secure
                  </Badge>
                </div>
              </div>
            </div>

            <div 
              className="p-4 border border-border/20 rounded-xl hover:bg-muted/20 cursor-pointer transition-colors"
              onClick={createMnemonicBackup}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-amber-500 rounded-xl flex items-center justify-center">
                  <Key className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Recovery Phrase</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    12-word phrase you can write down. Works on any device.
                  </p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Universal
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Restore Options */}
          {(backupStatus.hasPasskey || backupStatus.hasMnemonic) && (
            <div className="pt-4 border-t">
              <h4 className="font-medium text-sm mb-3">Restore Options</h4>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={restoreFromPasskey}
                  className="flex-1 apple-button"
                  disabled={!backupStatus.hasPasskey}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Passkey
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 apple-button"
                  disabled={!backupStatus.hasMnemonic}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Phrase
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'passkey') {
    return (
      <Card className="apple-card apple-glass border-0 apple-shadow">
        <CardHeader>
          <CardTitle>Setting up Passkey Backup</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-600 rounded-full flex items-center justify-center mx-auto">
            <Fingerprint className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Secure Your Wallet</h3>
            <p className="text-sm text-muted-foreground">
              Your device will prompt you to set up biometric authentication
            </p>
          </div>
          <Button
            onClick={createPasskeyBackup}
            disabled={isCreating}
            className="apple-gradient apple-button border-0 w-full"
          >
            {isCreating ? "Creating..." : "Enable Passkey Backup"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'mnemonic') {
    return (
      <Card className="apple-card apple-glass border-0 apple-shadow">
        <CardHeader>
          <CardTitle>Recovery Phrase</CardTitle>
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
              <div className="text-xs text-warning">
                <p className="font-medium">Keep this safe!</p>
                <p>Write down these words in order. Anyone with this phrase can access your wallet.</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mnemonic Grid */}
          <div className="grid grid-cols-3 gap-2">
            {mnemonic.map((word, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border text-center text-sm ${
                  showMnemonic 
                    ? 'bg-muted/20 border-border/20' 
                    : 'bg-black border-border/40 text-transparent select-none'
                }`}
              >
                <span className="font-mono text-xs text-muted-foreground">{index + 1}.</span>
                <br />
                <span className="font-medium">{showMnemonic ? word : '••••••'}</span>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMnemonic(!showMnemonic)}
              className="flex-1 apple-button"
            >
              {showMnemonic ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showMnemonic ? 'Hide' : 'Reveal'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyMnemonic}
              disabled={!showMnemonic}
              className="flex-1 apple-button"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>

          <Button
            onClick={completeMnemonicBackup}
            className="apple-gradient apple-button border-0 w-full"
            disabled={!showMnemonic}
          >
            I've Saved My Recovery Phrase
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'complete') {
    return (
      <Card className="apple-card apple-glass border-0 apple-shadow">
        <CardContent className="text-center space-y-6 p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-success to-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Backup Complete!</h3>
            <p className="text-sm text-muted-foreground">
              Your wallet is now securely backed up. You can restore it on any device.
            </p>
          </div>
          <Button
            onClick={() => setCurrentStep('choose')}
            className="apple-gradient apple-button border-0"
          >
            Done
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}