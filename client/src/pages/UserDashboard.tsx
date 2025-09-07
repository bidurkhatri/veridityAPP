import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { 
  Shield, 
  Plus, 
  QrCode, 
  History,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';

interface UserDashboardData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  stats: {
    totalProofs: number;
    verifiedProofs: number;
    recentProofs: Array<{
      id: string;
      type: string;
      status: string;
      createdAt: string;
    }>;
  };
}

export default function UserDashboard() {
  const { data, isLoading } = useQuery<UserDashboardData>({
    queryKey: ['/api/user/dashboard'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Unable to Load Dashboard</h1>
          <p className="text-muted-foreground">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const { user, stats } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" data-testid="dashboard-title">
                Welcome back, {user.firstName}
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your digital identity and privacy-preserving proofs
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              <Shield className="h-3 w-3 mr-1" />
              Verified User
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Generate Proof
              </CardTitle>
              <CardDescription>
                Create a new privacy-preserving proof of your identity attributes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/prove">
                <Button className="w-full" data-testid="button-generate-proof">
                  Start Generation
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                Share Proof
              </CardTitle>
              <CardDescription>
                Share your proofs securely via QR codes or secure links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/share">
                <Button variant="secondary" className="w-full" data-testid="button-share-proof">
                  Share Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                View History
              </CardTitle>
              <CardDescription>
                Review your proof generation and verification history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/history">
                <Button variant="secondary" className="w-full" data-testid="button-view-history">
                  View All
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Proofs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-proofs">
                {stats.totalProofs}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Proofs generated by you
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Verified Proofs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success" data-testid="stat-verified-proofs">
                {stats.verifiedProofs}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Successfully verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-success-rate">
                {stats.totalProofs > 0 ? Math.round((stats.verifiedProofs / stats.totalProofs) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Verification success rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest proof generations and verifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentProofs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Activity Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate your first proof to get started with digital identity verification.
                </p>
                <Link href="/prove">
                  <Button data-testid="button-first-proof">
                    Generate First Proof
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentProofs.map((proof) => (
                  <div key={proof.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        proof.status === 'verified' ? 'bg-success/10 text-success' :
                        proof.status === 'failed' ? 'bg-destructive/10 text-destructive' :
                        'bg-warning/10 text-warning'
                      }`}>
                        {proof.status === 'verified' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : proof.status === 'failed' ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{proof.type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(proof.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      proof.status === 'verified' ? 'default' :
                      proof.status === 'failed' ? 'destructive' :
                      'secondary'
                    }>
                      {proof.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}