import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, EyeOff, Key, RefreshCw, Trash2 } from "lucide-react";

interface ApiKeyGeneratorProps {
  onKeyGenerated?: (key: string, name: string) => void;
  className?: string;
}

export function ApiKeyGenerator({ onKeyGenerated, className }: ApiKeyGeneratorProps) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [keyName, setKeyName] = React.useState("");
  const [permissions, setPermissions] = React.useState<string[]>([]);
  const [generatedKey, setGeneratedKey] = React.useState("");
  const [keyVisible, setKeyVisible] = React.useState(false);

  const availablePermissions = [
    { id: "proof:read", label: "Read Proofs", description: "View proof data and metadata" },
    { id: "proof:verify", label: "Verify Proofs", description: "Validate proof authenticity" },
    { id: "proof:create", label: "Create Proofs", description: "Generate new proofs" },
    { id: "org:read", label: "Read Organization", description: "View organization details" },
  ];

  const handleGenerateKey = () => {
    // Generate a mock API key (in real app, this would be done securely on server)
    const key = `vdt_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    setGeneratedKey(key);
    setStep(3);
    onKeyGenerated?.(key, keyName);
  };

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(generatedKey);
    } catch (err) {
      console.error('Failed to copy API key');
    }
  };

  const resetForm = () => {
    setStep(1);
    setKeyName("");
    setPermissions([]);
    setGeneratedKey("");
    setKeyVisible(false);
  };

  // Step 1: Name the API Key
  if (step === 1) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Generate API Key - Step 1
          </CardTitle>
          <div className="w-full bg-border-default rounded-full h-1">
            <div className="bg-primary h-1 rounded-full w-1/3 transition-all" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              API Key Name
            </label>
            <Input
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g., Production Integration"
              data-testid="api-key-name-input"
            />
            <p className="text-xs text-text-secondary">
              Choose a descriptive name to identify this API key
            </p>
          </div>

          <Button
            onClick={() => setStep(2)}
            disabled={!keyName.trim()}
            className="w-full"
            data-testid="api-key-continue-step2"
          >
            Continue to Permissions
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Set Permissions
  if (step === 2) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Generate API Key - Step 2
          </CardTitle>
          <div className="w-full bg-border-default rounded-full h-1">
            <div className="bg-primary h-1 rounded-full w-2/3 transition-all" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium text-text-primary">
              Select Permissions
            </label>
            
            {availablePermissions.map((permission) => (
              <button
                key={permission.id}
                onClick={() => {
                  setPermissions(prev => 
                    prev.includes(permission.id)
                      ? prev.filter(p => p !== permission.id)
                      : [...prev, permission.id]
                  );
                }}
                className={cn(
                  "w-full p-3 text-left rounded-lg border transition-all",
                  permissions.includes(permission.id)
                    ? "border-primary bg-primary/5"
                    : "border-border-default hover:bg-surface-secondary/50"
                )}
                data-testid={`permission-${permission.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center",
                    permissions.includes(permission.id)
                      ? "border-primary bg-primary"
                      : "border-border-default"
                  )}>
                    {permissions.includes(permission.id) && (
                      <div className="w-2 h-2 rounded bg-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">
                      {permission.label}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {permission.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
              data-testid="api-key-back-step1"
            >
              Back
            </Button>
            <Button
              onClick={handleGenerateKey}
              disabled={permissions.length === 0}
              className="flex-1"
              data-testid="api-key-generate"
            >
              Generate Key
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 3: Show Generated Key
  return (
    <Card className={cn("border-success-border bg-success-bg/5", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-success-text">
          <Key className="h-5 w-5" />
          API Key Generated Successfully
        </CardTitle>
        <div className="w-full bg-border-default rounded-full h-1">
          <div className="bg-success-bg h-1 rounded-full w-full transition-all" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="p-4 bg-warning-bg/20 border border-warning-border rounded-lg">
          <div className="flex items-start gap-2">
            <div className="text-warning-text">⚠️</div>
            <div className="text-sm">
              <p className="font-medium text-warning-text">Save your API key now</p>
              <p className="text-text-secondary mt-1">
                This is the only time we'll show you the complete key. Store it securely.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Your API Key
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={generatedKey}
                type={keyVisible ? "text" : "password"}
                readOnly
                className="font-mono pr-10"
                data-testid="generated-api-key"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setKeyVisible(!keyVisible)}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1"
                data-testid="toggle-key-visibility"
              >
                {keyVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={copyKey}
              data-testid="copy-api-key"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Key Details
          </label>
          <div className="p-3 bg-surface-secondary rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Name:</span>
              <span className="text-text-primary font-medium">{keyName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Permissions:</span>
              <div className="flex gap-1">
                {permissions.slice(0, 2).map(permission => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission.split(':')[1]}
                  </Badge>
                ))}
                {permissions.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{permissions.length - 2}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Created:</span>
              <span className="text-text-primary">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={resetForm}
            className="flex-1"
            data-testid="create-another-key"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Create Another
          </Button>
          <Button
            onClick={() => {
              // In real app, navigate to API key management
              console.log('Navigate to API keys');
            }}
            className="flex-1"
            data-testid="manage-api-keys"
          >
            Manage Keys
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}