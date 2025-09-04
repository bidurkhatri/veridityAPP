import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Building, User, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface RoleAssignerProps {
  currentRole: string;
  onRoleChanged: () => void;
}

export default function RoleAssigner({ currentRole, onRoleChanged }: RoleAssignerProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateRoleMutation = useMutation({
    mutationFn: async (newRole: string) => {
      const response = await fetch('/api/auth/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (!response.ok) throw new Error('Failed to update role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Role Updated",
        description: `Your role has been changed to ${selectedRole}`,
      });
      onRoleChanged();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
      console.error('Role update error:', error);
    }
  });

  const roles = [
    {
      value: 'customer',
      label: 'Customer',
      description: 'Individual user managing personal identity',
      icon: User,
      color: 'bg-blue-500'
    },
    {
      value: 'client',
      label: 'Enterprise Client',
      description: 'Business user with verification capabilities',
      icon: Building,
      color: 'bg-green-500'
    },
    {
      value: 'admin',
      label: 'System Administrator',
      description: 'Full platform administration access',
      icon: Shield,
      color: 'bg-red-500'
    }
  ];

  const handleRoleUpdate = () => {
    if (selectedRole !== currentRole) {
      updateRoleMutation.mutate(selectedRole);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto" data-testid="role-assigner">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          <CardTitle>Demo: Role Assignment</CardTitle>
        </div>
        <CardDescription>
          For demonstration purposes, you can switch between different user roles to explore all portals.
          In production, roles would be assigned by administrators.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Current Role:</label>
            <Badge variant="outline">{currentRole}</Badge>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Select New Role:</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger data-testid="role-selector">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center gap-2">
                      <role.icon className="h-4 w-4" />
                      {role.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Role Descriptions */}
        <div className="grid gap-3">
          {roles.map((role) => (
            <div 
              key={role.value}
              className={`p-3 rounded-lg border-2 transition-colors ${
                selectedRole === role.value 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded ${role.color} text-white mt-0.5`}>
                  <role.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{role.label}</h4>
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button 
          onClick={handleRoleUpdate}
          disabled={selectedRole === currentRole || updateRoleMutation.isPending}
          className="w-full"
          data-testid="update-role-button"
        >
          {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          ⚠️ This is a demo feature. In production, role changes would require administrative approval.
        </div>
      </CardContent>
    </Card>
  );
}