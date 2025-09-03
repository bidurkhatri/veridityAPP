import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTranslation, type Language } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { 
  History as HistoryIcon, 
  Search, 
  Filter,
  Download,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Share,
  QrCode
} from "lucide-react";

interface ProofHistoryItem {
  id: string;
  type: string;
  organization: string;
  status: 'verified' | 'failed' | 'pending';
  createdAt: string;
  verifiedAt?: string;
  referenceId: string;
}

export default function History() {
  const [language, setLanguage] = useState<Language>('en');
  const { t } = useTranslation(language);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'failed' | 'pending'>('all');

  // Fetch proof history
  const { data: proofs = [] } = useQuery<ProofHistoryItem[]>({
    queryKey: ['/api/proofs/history'],
  });

  // Mock data for demonstration
  const mockProofs: ProofHistoryItem[] = [
    {
      id: '1',
      type: 'Age Verification (18+)',
      organization: 'Nepal Rastra Bank',
      status: 'verified',
      createdAt: '2025-01-02T10:30:00Z',
      verifiedAt: '2025-01-02T10:31:00Z',
      referenceId: 'VRF-2025-001'
    },
    {
      id: '2',
      type: 'Citizenship Verification',
      organization: 'Nepal Government',
      status: 'verified',
      createdAt: '2025-01-01T14:20:00Z',
      verifiedAt: '2025-01-01T14:21:00Z',
      referenceId: 'VRF-2025-002'
    },
    {
      id: '3',
      type: 'Education Verification',
      organization: 'Tribhuvan University',
      status: 'pending',
      createdAt: '2025-01-01T09:15:00Z',
      referenceId: 'VRF-2025-003'
    }
  ];

  const historyData = proofs.length > 0 ? proofs : mockProofs;

  // Filter proofs based on search and status
  const filteredProofs = historyData.filter(proof => {
    const matchesSearch = proof.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proof.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || proof.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-accent" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'verified' ? 'default' : status === 'failed' ? 'destructive' : 'secondary';
    const text = language === 'np' ? 
      (status === 'verified' ? 'प्रमाणित' : status === 'failed' ? 'असफल' : 'पेन्डिंग') :
      status;
    return <Badge variant={variant}>{text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    if (language === 'np') {
      // For Nepali, show English date with Nepali label
      return date.toLocaleDateString('en-US', options);
    }
    
    return date.toLocaleDateString('en-US', options);
  };

  const statsData = {
    total: historyData.length,
    verified: historyData.filter(p => p.status === 'verified').length,
    pending: historyData.filter(p => p.status === 'pending').length,
    failed: historyData.filter(p => p.status === 'failed').length
  };

  return (
    <div className="min-h-screen bg-background apple-blur-bg pb-20">
      {/* Header */}
      <header className="apple-glass border-b border-border/20 sticky top-0 z-40 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold apple-gradient-text">
              {t('nav.history')}
            </h1>
            <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="apple-card apple-glass border-0 apple-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {language === 'np' ? 'कुल प्रमाणहरू' : 'Total Proofs'}
                  </p>
                  <p className="text-xl font-bold apple-gradient-text" data-testid="stat-total-history">
                    {statsData.total}
                  </p>
                </div>
                <HistoryIcon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="apple-card apple-glass border-0 apple-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {language === 'np' ? 'प्रमाणित' : 'Verified'}
                  </p>
                  <p className="text-xl font-bold text-success" data-testid="stat-verified-history">
                    {statsData.verified}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'np' ? 'प्रमाण खोज्नुहोस्...' : 'Search proofs...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-history"
              />
            </div>
            
            <div className="flex space-x-2">
              {(['all', 'verified', 'pending', 'failed'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className={filterStatus === status ? 'apple-gradient apple-button border-0' : ''}
                  data-testid={`filter-${status}`}
                >
                  {language === 'np' 
                    ? (status === 'all' ? 'सबै' : status === 'verified' ? 'प्रमाणित' : status === 'pending' ? 'पेन्डिंग' : 'असफल')
                    : status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)
                  }
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* History List */}
        <div className="space-y-3">
          {filteredProofs.length === 0 ? (
            <Card className="apple-card apple-glass border-0 apple-shadow">
              <CardContent className="p-8 text-center">
                <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">
                  {language === 'np' ? 'कुनै इतिहास फेला परेन' : 'No history found'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'np' 
                    ? 'तपाईंका प्रमाणीकरणहरू यहाँ देखाइनेछ'
                    : 'Your verifications will appear here'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredProofs.map((proof) => (
              <Card key={proof.id} className="apple-card apple-glass border-0 apple-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {proof.type}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {proof.organization}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(proof.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(proof.status)}
                      {getStatusIcon(proof.status)}
                    </div>
                  </div>
                  
                  <div className="border-t border-border/20 pt-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">ID:</span> {proof.referenceId}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          data-testid={`button-view-${proof.id}`}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          {language === 'np' ? 'हेर्नुहोस्' : 'View'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          data-testid={`button-share-${proof.id}`}
                        >
                          <Share className="h-3 w-3 mr-1" />
                          {language === 'np' ? 'साझेदारी' : 'Share'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Export Options */}
        {filteredProofs.length > 0 && (
          <Card className="apple-card apple-glass border-0 apple-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">
                    {language === 'np' ? 'इतिहास निर्यात गर्नुहोस्' : 'Export History'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'np' ? 'तपाईंको प्रमाणीकरण रेकर्ड डाउनलोड गर्नुहोस्' : 'Download your verification records'}
                  </p>
                </div>
                <Button 
                  variant="outline"
                  data-testid="button-export-history"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {language === 'np' ? 'PDF' : 'Export PDF'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}