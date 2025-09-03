import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Clock,
  Users,
  Link,
  Calendar,
  Shield,
  Combine,
  Timer,
  Group,
  Settings,
  Plus,
  Trash2,
  Edit,
  Lock,
  Unlock,
  AlertTriangle
} from "lucide-react";

interface CompositeProof {
  id: string;
  name: string;
  components: ProofComponent[];
  logic: 'AND' | 'OR' | 'THRESHOLD';
  threshold?: number;
  createdAt: string;
  expiresAt?: string;
  status: 'draft' | 'active' | 'expired';
}

interface ProofComponent {
  id: string;
  type: string;
  weight: number;
  required: boolean;
  condition?: string;
}

interface TimeLockProof {
  id: string;
  type: string;
  unlockDate: string;
  conditions: string[];
  status: 'locked' | 'unlocked' | 'expired';
  autoReveal: boolean;
}

interface ThresholdShare {
  id: string;
  proofId: string;
  shareCount: number;
  threshold: number;
  shares: ShareFragment[];
  status: 'incomplete' | 'complete' | 'reconstructed';
}

interface ShareFragment {
  id: string;
  holder: string;
  fragment: string;
  used: boolean;
}

export function AdvancedProofFeatures() {
  const { t } = useTranslation('en');
  const [activeTab, setActiveTab] = useState<'composite' | 'timelock' | 'threshold'>('composite');
  const [compositeProofs, setCompositeProofs] = useState<CompositeProof[]>([]);
  const [timeLockProofs, setTimeLockProofs] = useState<TimeLockProof[]>([]);
  const [thresholdShares, setThresholdShares] = useState<ThresholdShare[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data initialization
  useEffect(() => {
    const mockComposite: CompositeProof[] = [
      {
        id: '1',
        name: 'Complete Identity Package',
        components: [
          { id: '1', type: 'Age Verification (18+)', weight: 1, required: true },
          { id: '2', type: 'Citizenship Verification', weight: 1, required: true },
          { id: '3', type: 'Address Verification', weight: 0.5, required: false }
        ],
        logic: 'AND',
        createdAt: '2025-01-02T10:30:00Z',
        status: 'active'
      }
    ];

    const mockTimelock: TimeLockProof[] = [
      {
        id: '1',
        type: 'Education Verification',
        unlockDate: '2025-06-15T00:00:00Z',
        conditions: ['Graduation date reached', 'Certificate issued'],
        status: 'locked',
        autoReveal: true
      }
    ];

    const mockThreshold: ThresholdShare[] = [
      {
        id: '1',
        proofId: 'sensitive-medical-proof',
        shareCount: 5,
        threshold: 3,
        shares: [
          { id: '1', holder: 'Family Member 1', fragment: 'encrypted-fragment-1', used: false },
          { id: '2', holder: 'Doctor', fragment: 'encrypted-fragment-2', used: false },
          { id: '3', holder: 'Legal Guardian', fragment: 'encrypted-fragment-3', used: false },
          { id: '4', holder: 'Trusted Friend', fragment: 'encrypted-fragment-4', used: false },
          { id: '5', holder: 'Backup Service', fragment: 'encrypted-fragment-5', used: false }
        ],
        status: 'incomplete'
      }
    ];

    setCompositeProofs(mockComposite);
    setTimeLockProofs(mockTimelock);
    setThresholdShares(mockThreshold);
  }, []);

  const CompositeProofManager = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Composite Proofs</h3>
          <p className="text-sm text-muted-foreground">Combine multiple proofs with logic conditions</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="apple-gradient apple-button border-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Composite
        </Button>
      </div>

      <div className="space-y-3">
        {compositeProofs.map(proof => (
          <motion.div
            key={proof.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="apple-card apple-glass border-0 apple-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center">
                      <Combine className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{proof.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {proof.components.length} components • {proof.logic} logic
                      </p>
                    </div>
                  </div>
                  <Badge className={`${
                    proof.status === 'active' ? 'bg-success/10 text-success border-success/20' :
                    proof.status === 'draft' ? 'bg-warning/10 text-warning border-warning/20' :
                    'bg-muted/10 text-muted-foreground border-muted/20'
                  }`}>
                    {proof.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Components:</p>
                  {proof.components.map(component => (
                    <div key={component.id} className="flex items-center justify-between p-2 bg-muted/10 rounded">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${component.required ? 'bg-destructive' : 'bg-muted-foreground'}`} />
                        <span className="text-sm">{component.type}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Weight: {component.weight}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 apple-button">
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 apple-button">
                    <Link className="h-3 w-3 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" className="apple-button">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const TimeLockManager = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Time-Locked Proofs</h3>
          <p className="text-sm text-muted-foreground">Proofs that unlock at specific dates or conditions</p>
        </div>
        <Button className="apple-gradient apple-button border-0">
          <Plus className="h-4 w-4 mr-2" />
          Create Time-Lock
        </Button>
      </div>

      <div className="space-y-3">
        {timeLockProofs.map(proof => {
          const unlockDate = new Date(proof.unlockDate);
          const now = new Date();
          const isUnlocked = now >= unlockDate;
          const timeRemaining = unlockDate.getTime() - now.getTime();
          const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

          return (
            <motion.div
              key={proof.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="apple-card apple-glass border-0 apple-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isUnlocked ? 'bg-gradient-to-br from-success to-emerald-500' : 'bg-gradient-to-br from-warning to-amber-500'
                      }`}>
                        {isUnlocked ? <Unlock className="h-5 w-5 text-white" /> : <Lock className="h-5 w-5 text-white" />}
                      </div>
                      <div>
                        <h4 className="font-semibold">{proof.type}</h4>
                        <p className="text-xs text-muted-foreground">
                          {isUnlocked ? 'Unlocked' : `${daysRemaining} days remaining`}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${
                      proof.status === 'unlocked' ? 'bg-success/10 text-success border-success/20' :
                      proof.status === 'locked' ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-muted/10 text-muted-foreground border-muted/20'
                    }`}>
                      {proof.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Unlock Date:</p>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{unlockDate.toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Conditions:</p>
                      {proof.conditions.map((condition, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${isUnlocked ? 'bg-success' : 'bg-muted-foreground'}`} />
                          <span>{condition}</span>
                        </div>
                      ))}
                    </div>

                    {!isUnlocked && (
                      <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Timer className="h-4 w-4 text-warning" />
                          <span className="text-sm text-warning">
                            This proof will automatically unlock in {daysRemaining} days
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 apple-button"
                      disabled={!isUnlocked}
                    >
                      {isUnlocked ? 'Use Proof' : 'Locked'}
                    </Button>
                    <Button variant="outline" size="sm" className="apple-button">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const ThresholdShareManager = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Threshold Sharing</h3>
          <p className="text-sm text-muted-foreground">Split sensitive proofs across multiple trusted parties</p>
        </div>
        <Button className="apple-gradient apple-button border-0">
          <Plus className="h-4 w-4 mr-2" />
          Create Share
        </Button>
      </div>

      <div className="space-y-3">
        {thresholdShares.map(share => (
          <motion.div
            key={share.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="apple-card apple-glass border-0 apple-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Group className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{share.proofId}</h4>
                      <p className="text-xs text-muted-foreground">
                        {share.threshold} of {share.shareCount} shares required
                      </p>
                    </div>
                  </div>
                  <Badge className={`${
                    share.status === 'complete' ? 'bg-success/10 text-success border-success/20' :
                    share.status === 'incomplete' ? 'bg-warning/10 text-warning border-warning/20' :
                    'bg-primary/10 text-primary border-primary/20'
                  }`}>
                    {share.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Share Holders:</p>
                      <span className="text-xs text-muted-foreground">
                        {share.shares.filter(s => !s.used).length} unused
                      </span>
                    </div>
                    {share.shares.map(fragment => (
                      <div key={fragment.id} className="flex items-center justify-between p-2 bg-muted/10 rounded">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${fragment.used ? 'bg-success' : 'bg-muted-foreground'}`} />
                          <span className="text-sm">{fragment.holder}</span>
                        </div>
                        <Badge variant={fragment.used ? 'default' : 'outline'} className="text-xs">
                          {fragment.used ? 'Used' : 'Available'}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Shield className="h-4 w-4 text-accent mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-accent">Security Notice</p>
                        <p className="text-muted-foreground text-xs">
                          {share.threshold} trusted parties must cooperate to reconstruct this proof
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 apple-button"
                    disabled={share.status !== 'complete'}
                  >
                    Reconstruct
                  </Button>
                  <Button variant="outline" size="sm" className="apple-button">
                    <Users className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold apple-gradient-text">Advanced Proof Features</h2>
          <p className="text-muted-foreground">Create sophisticated proof compositions and sharing mechanisms</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <Card className="apple-card apple-glass border-0 apple-shadow">
        <CardContent className="p-4">
          <div className="flex rounded-xl bg-muted/20 p-1 space-x-1">
            {[
              { id: 'composite', label: 'Composite', icon: Layers },
              { id: 'timelock', label: 'Time-Lock', icon: Clock },
              { id: 'threshold', label: 'Threshold', icon: Users }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  className={`flex-1 ${activeTab === tab.id ? 'apple-gradient apple-button border-0' : ''}`}
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'composite' && <CompositeProofManager />}
          {activeTab === 'timelock' && <TimeLockManager />}
          {activeTab === 'threshold' && <ThresholdShareManager />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}