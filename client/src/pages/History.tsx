import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n";
import { AppHeader } from "@/components/AppHeader";
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
  const { t } = useTranslation('en');
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

  // Filter and search functionality
  const filteredData = historyData.filter(item => {
    const matchesSearch = item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-success/10 text-success border-success/20">{status}</Badge>;
      case 'failed':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = ['Type', 'Organization', 'Status', 'Created', 'Reference ID'];
    const rows = historyData.map(item => [
      item.type,
      item.organization,
      item.status,
      formatDate(item.createdAt),
      item.referenceId
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'proof-history.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background apple-blur-bg" style={{ paddingBottom: '80px' }}>
      <AppHeader 
        title={t('nav.history')}
        type="root"
        sticky
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="apple-card apple-glass border-0 apple-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Proofs
                  </p>
                  <p className="text-2xl font-bold apple-gradient-text" data-testid="stat-total-history">
                    {historyData.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center apple-shadow">
                  <HistoryIcon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="apple-card apple-glass border-0 apple-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Verified
                  </p>
                  <p className="text-2xl font-bold apple-gradient-text" data-testid="stat-verified-history">
                    {historyData.filter(p => p.status === 'verified').length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-success to-emerald-500 rounded-xl flex items-center justify-center apple-shadow">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="apple-card apple-glass border-0 apple-shadow">
          <CardContent className="p-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search proofs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 apple-input"
                data-testid="input-search-history"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex space-x-2">
                {(['all', 'verified', 'failed', 'pending'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className={filterStatus === status ? "apple-gradient apple-button border-0" : ""}
                    data-testid={`filter-${status}`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History List */}
        {filteredData.length === 0 ? (
          <Card className="apple-card apple-glass border-0 apple-shadow">
            <CardContent className="p-12 text-center">
              <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No history found</h3>
              <p className="text-muted-foreground mb-6">
                You haven't generated any proofs yet.
              </p>
              <Button className="apple-gradient apple-button border-0" data-testid="button-create-first-proof">
                Create Your First Proof
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredData.map((proof) => (
              <Card key={proof.id} className="apple-card apple-glass border-0 apple-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{proof.type}</h3>
                          {getStatusBadge(proof.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{proof.organization}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(proof.createdAt)}</span>
                          </span>
                          <span>ID: {proof.referenceId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="ghost" size="sm" data-testid={`button-view-${proof.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`button-share-${proof.id}`}>
                        <Share className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Export Options */}
        {historyData.length > 0 && (
          <Card className="apple-card apple-glass border-0 apple-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Export History</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Download your verification records
                  </p>
                </div>
                <Button
                  onClick={exportToCSV}
                  className="apple-gradient apple-button border-0"
                  data-testid="button-export-csv"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  );
}