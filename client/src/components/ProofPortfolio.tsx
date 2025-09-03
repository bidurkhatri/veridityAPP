import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Calendar,
  Building,
  GraduationCap,
  Heart,
  Briefcase,
  Search,
  Filter,
  Archive,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  Share,
  Download,
  Trash2,
  RefreshCw
} from "lucide-react";

interface ProofItem {
  id: string;
  type: string;
  category: 'identity' | 'education' | 'finance' | 'health' | 'government' | 'employment';
  status: 'active' | 'expired' | 'revoked' | 'pending';
  createdAt: string;
  expiresAt: string;
  organization: string;
  verificationCount: number;
  lastUsed?: string;
  importance: 'high' | 'medium' | 'low';
  tags: string[];
}

interface ProofPortfolioProps {
  onSelectProof?: (proof: ProofItem) => void;
  onGenerateNew?: (category: string) => void;
}

export function ProofPortfolio({ onSelectProof, onGenerateNew }: ProofPortfolioProps) {
  const { t } = useTranslation('en');
  const [proofs, setProofs] = useState<ProofItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'expiry' | 'usage' | 'importance'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data
  useEffect(() => {
    const mockProofs: ProofItem[] = [
      {
        id: '1',
        type: 'Age Verification (18+)',
        category: 'identity',
        status: 'active',
        createdAt: '2025-01-02T10:30:00Z',
        expiresAt: '2025-07-02T10:30:00Z',
        organization: 'Nepal Rastra Bank',
        verificationCount: 12,
        lastUsed: '2025-01-02T10:30:00Z',
        importance: 'high',
        tags: ['banking', 'finance', 'age']
      },
      {
        id: '2',
        type: 'Bachelor Degree Verification',
        category: 'education',
        status: 'active',
        createdAt: '2024-12-15T14:20:00Z',
        expiresAt: '2026-12-15T14:20:00Z',
        organization: 'Tribhuvan University',
        verificationCount: 8,
        lastUsed: '2024-12-20T09:15:00Z',
        importance: 'high',
        tags: ['education', 'degree', 'employment']
      },
      {
        id: '3',
        type: 'Citizenship Verification',
        category: 'government',
        status: 'active',
        createdAt: '2024-11-01T09:15:00Z',
        expiresAt: '2025-11-01T09:15:00Z',
        organization: 'Nepal Government',
        verificationCount: 25,
        lastUsed: '2025-01-01T16:45:00Z',
        importance: 'high',
        tags: ['government', 'citizenship', 'identity']
      },
      {
        id: '4',
        type: 'Income Verification',
        category: 'finance',
        status: 'expired',
        createdAt: '2024-06-01T11:00:00Z',
        expiresAt: '2024-12-01T11:00:00Z',
        organization: 'Employer Corp',
        verificationCount: 3,
        lastUsed: '2024-11-30T14:30:00Z',
        importance: 'medium',
        tags: ['employment', 'finance', 'salary']
      }
    ];
    setProofs(mockProofs);
  }, []);

  const categories = [
    { id: 'all', name: 'All Proofs', icon: Shield, count: proofs.length },
    { id: 'identity', name: 'Identity', icon: Shield, count: proofs.filter(p => p.category === 'identity').length },
    { id: 'education', name: 'Education', icon: GraduationCap, count: proofs.filter(p => p.category === 'education').length },
    { id: 'finance', name: 'Finance', icon: Building, count: proofs.filter(p => p.category === 'finance').length },
    { id: 'government', name: 'Government', icon: Building, count: proofs.filter(p => p.category === 'government').length },
    { id: 'health', name: 'Health', icon: Heart, count: proofs.filter(p => p.category === 'health').length },
    { id: 'employment', name: 'Employment', icon: Briefcase, count: proofs.filter(p => p.category === 'employment').length }
  ];

  const filteredProofs = proofs
    .filter(proof => {
      const matchesSearch = proof.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           proof.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           proof.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || proof.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'expiry':
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        case 'usage':
          return b.verificationCount - a.verificationCount;
        case 'importance':
          const importance = { high: 3, medium: 2, low: 1 };
          return importance[b.importance] - importance[a.importance];
        default:
          return 0;
      }
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'revoked':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'expired':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'revoked':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'pending':
        return 'bg-muted/10 text-muted-foreground border-muted/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      identity: Shield,
      education: GraduationCap,
      finance: Building,
      government: Building,
      health: Heart,
      employment: Briefcase
    };
    return icons[category as keyof typeof icons] || Shield;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const daysUntilExpiry = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold apple-gradient-text">Proof Portfolio</h2>
          <p className="text-muted-foreground">Manage your digital identity proofs</p>
        </div>
        <Button
          onClick={() => onGenerateNew?.(selectedCategory)}
          className="apple-gradient apple-button border-0"
        >
          Generate New Proof
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="apple-card apple-glass border-0 apple-shadow">
        <CardContent className="p-4 space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search proofs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 apple-input"
              />
            </div>
            <Button variant="outline" size="sm" className="apple-button">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Sort Options */}
          <div className="flex space-x-2">
            {[
              { key: 'recent', label: 'Recent' },
              { key: 'expiry', label: 'Expiring Soon' },
              { key: 'usage', label: 'Most Used' },
              { key: 'importance', label: 'Important' }
            ].map(option => (
              <Button
                key={option.key}
                variant={sortBy === option.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy(option.key as any)}
                className={sortBy === option.key ? 'apple-gradient apple-button border-0' : 'apple-button'}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card className="apple-card apple-glass border-0 apple-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'hover:bg-muted/20 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Proofs Grid */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory + searchTerm + sortBy}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {filteredProofs.map((proof, index) => {
                const Icon = getCategoryIcon(proof.category);
                const expireDays = daysUntilExpiry(proof.expiresAt);
                
                return (
                  <motion.div
                    key={proof.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="apple-card apple-glass border-0 apple-shadow cursor-pointer h-full">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              proof.importance === 'high' ? 'bg-primary/10' :
                              proof.importance === 'medium' ? 'bg-accent/10' : 'bg-muted/10'
                            }`}>
                              <Icon className={`h-5 w-5 ${
                                proof.importance === 'high' ? 'text-primary' :
                                proof.importance === 'medium' ? 'text-accent' : 'text-muted-foreground'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">{proof.type}</h3>
                              <p className="text-xs text-muted-foreground truncate">{proof.organization}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge className={`text-xs ${getStatusColor(proof.status)}`}>
                            {getStatusIcon(proof.status)}
                            <span className="ml-1 capitalize">{proof.status}</span>
                          </Badge>
                          {proof.importance === 'high' && (
                            <Star className="h-4 w-4 text-amber-500 fill-current" />
                          )}
                        </div>

                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span>Created</span>
                            <span>{formatDate(proof.createdAt)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Expires</span>
                            <span className={expireDays <= 30 ? 'text-warning' : ''}>
                              {expireDays > 0 ? `${expireDays} days` : 'Expired'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Used</span>
                            <span>{proof.verificationCount} times</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {proof.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 apple-button"
                            onClick={() => onSelectProof?.(proof)}
                          >
                            <Share className="h-3 w-3 mr-1" />
                            Share
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="apple-button"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {filteredProofs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No proofs found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Generate your first proof to get started'}
              </p>
              <Button
                onClick={() => onGenerateNew?.(selectedCategory)}
                className="apple-gradient apple-button border-0"
              >
                Generate New Proof
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}