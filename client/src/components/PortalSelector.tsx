import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { 
  Shield, 
  Building, 
  User, 
  ArrowRight,
  Settings,
  BarChart3,
  Users,
  RotateCcw
} from 'lucide-react';
// RoleAssigner removed for production

interface UserWithRole {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'client' | 'admin';
  organizationId?: string;
  permissions: string[];
}

export default function PortalSelector() {
  const [showRoleAssigner, setShowRoleAssigner] = useState(false);
  
  const { data: user, refetch } = useQuery<UserWithRole>({
    queryKey: ['/api/auth/user'],
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-muted-foreground">Please wait while we load your profile.</p>
        </div>
      </div>
    );
  }

  const getAvailablePortals = () => {
    const portals = [];
    
    // Customer Portal - available to everyone
    portals.push({
      id: 'customer',
      title: 'Customer Portal',
      description: 'Manage your digital identity, generate proofs, and control your privacy settings',
      icon: User,
      path: '/customer-portal',
      color: 'bg-blue-500',
      available: true
    });

    // Client Portal - available to client role users
    if (user.role === 'client' || user.role === 'admin') {
      portals.push({
        id: 'client',
        title: 'Client Portal',
        description: 'Enterprise dashboard for managing verifications, team, and integrations',
        icon: Building,
        path: '/client-portal',
        color: 'bg-green-500',
        available: true
      });
    }

    // Admin Portal - available to admin role users only
    if (user.role === 'admin') {
      portals.push({
        id: 'admin',
        title: 'Admin Portal',
        description: 'System administration, platform management, and security oversight',
        icon: Shield,
        path: '/admin-portal',
        color: 'bg-red-500',
        available: true
      });
    }

    return portals;
  };

  const availablePortals = getAvailablePortals();

  return (
    <div className="min-h-screen bg-background p-4" data-testid="portal-selector">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4" data-testid="portal-selector-title">
            Welcome to Veridity
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Hello, {user.firstName} {user.lastName}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" data-testid="user-role-badge">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
            {user.organizationId && (
              <Badge variant="secondary" data-testid="organization-badge">
                Organization Member
              </Badge>
            )}
          </div>
        </div>

        {/* Demo role switcher removed for production */}

        {/* Portal Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {availablePortals.map((portal) => (
            <Card 
              key={portal.id} 
              className="relative overflow-hidden hover:shadow-lg transition-shadow"
              data-testid={`portal-card-${portal.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${portal.color} text-white`}>
                    <portal.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{portal.title}</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {portal.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href={portal.path}>
                  <Button 
                    className="w-full group" 
                    data-testid={`enter-${portal.id}-portal`}
                  >
                    Enter Portal
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Account Settings</h3>
                <p className="text-sm text-muted-foreground">Manage your profile</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Activity Dashboard</h3>
                <p className="text-sm text-muted-foreground">View your activity</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Support Center</h3>
                <p className="text-sm text-muted-foreground">Get help and support</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Role Information */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Your Access Level</h3>
          <p className="text-sm text-muted-foreground">
            {user.role === 'admin' && 
              "You have full administrative access to all portals and system management tools."
            }
            {user.role === 'client' && 
              "You have access to customer and enterprise client portals for managing verifications and team."
            }
            {user.role === 'customer' && 
              "You have access to the customer portal for managing your digital identity and proofs."
            }
          </p>
        </div>
      </div>
    </div>
  );
}