import { useLocation, Link } from 'wouter';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Home, 
  ChevronRight,
  Shield,
  Settings,
  History,
  QrCode,
  Building,
  BarChart3,
  Users,
  Bell
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface NavigationProps {
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function BackButton({ className }: { className?: string }) {
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleBack();
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleBack}
      onKeyDown={handleKeyDown}
      className={cn("flex items-center gap-2", className)}
      data-testid="button-back"
      aria-label="Go back to previous page"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="hidden sm:inline">Back</span>
    </Button>
  );
}

export function Breadcrumbs({ className }: NavigationProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.split('/').filter(Boolean);
    
    // Base breadcrumb - always start with role-appropriate home
    const baseBreadcrumbs: BreadcrumbItem[] = [
      {
        label: getRoleHomeLabel(user?.role),
        href: '/',
        icon: Home
      }
    ];
    
    // Build breadcrumbs based on current path
    const breadcrumbs: BreadcrumbItem[] = [...baseBreadcrumbs];
    
    if (pathSegments.length === 0) {
      return breadcrumbs; // We're at home
    }
    
    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const breadcrumb = getBreadcrumbForPath(segment, path);
      if (breadcrumb) {
        breadcrumbs.push(breadcrumb);
      }
    });
    
    return breadcrumbs;
  };
  
  const getRoleHomeLabel = (role?: 'customer' | 'client' | 'admin'): string => {
    switch (role) {
      case 'admin': return 'System Admin';
      case 'client': return 'Organization Admin';
      case 'customer': 
      default: return 'Dashboard';
    }
  };
  
  const getBreadcrumbForPath = (segment: string, fullPath: string): BreadcrumbItem | null => {
    const pathMap: Record<string, BreadcrumbItem> = {
      'prove': { label: 'Generate Proof', icon: Shield },
      'share': { label: 'Share Proof', icon: QrCode },
      'history': { label: 'History', icon: History },
      'settings': { label: 'Settings', icon: Settings },
      'organizations': { label: 'Organizations', icon: Building },
      'analytics': { label: 'Analytics', icon: BarChart3 },
      'users': { label: 'User Management', icon: Users },
      'verify-qr': { label: 'QR Verification', icon: QrCode },
      'help': { label: 'Help & Support', icon: Bell },
      'privacy': { label: 'Privacy Policy', icon: Shield }
    };
    
    const breadcrumb = pathMap[segment];
    return breadcrumb ? { ...breadcrumb, href: fullPath } : null;
  };
  
  const breadcrumbs = getBreadcrumbs();
  
  // Don't show breadcrumbs if we're just at home
  if (breadcrumbs.length <= 1) {
    return null;
  }
  
  return (
    <nav 
      aria-label="Breadcrumb navigation"
      className={cn("hidden md:flex items-center space-x-1 text-sm text-muted-foreground", className)}
      data-testid="breadcrumbs"
    >
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-1" aria-hidden="true" />
          )}
          {index === breadcrumbs.length - 1 ? (
            // Current page - no link, different styling
            <span 
              className="flex items-center gap-1 font-medium text-foreground"
              aria-current="page"
            >
              {crumb.icon && <crumb.icon className="h-4 w-4" />}
              {crumb.label}
            </span>
          ) : (
            // Navigable breadcrumb
            <Link href={crumb.href || '/'}>
              <a className="flex items-center gap-1 hover:text-foreground transition-colors">
                {crumb.icon && <crumb.icon className="h-4 w-4" />}
                {crumb.label}
              </a>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

export function NavigationHeader({ children, className }: { 
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4 mb-6", className)}>
      <div className="flex items-center gap-4">
        <BackButton className="flex-shrink-0" />
        <Separator orientation="vertical" className="h-6 hidden sm:block" />
        <Breadcrumbs />
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}

// Hardware back button support for mobile devices
export function useHardwareBackSupport() {
  useEffect(() => {
    // Handle Android hardware back button
    const handleBackButton = (event: PopStateEvent) => {
      // This runs when user presses hardware back button or browser back
      // The browser will handle the navigation, we just need to ensure
      // our app state is properly updated
      
      // Custom logic for specific routes if needed
      if (window.location.pathname === '/') {
        // If we're at home and user presses back, we might want to show exit confirmation
        // This is handled by the browser's beforeunload event if needed
      }
    };
    
    // Handle escape key for desktop users (alternative to back button)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Only trigger on root elements, not inside modals or forms
        const target = event.target as HTMLElement;
        if (target.tagName === 'BODY' || target.tagName === 'HTML') {
          window.history.back();
        }
      }
    };
    
    window.addEventListener('popstate', handleBackButton);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('popstate', handleBackButton);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}

// Hook for programmatic navigation with proper history management
export function useNavigation() {
  const [, setLocation] = useLocation();
  
  const navigate = (path: string, replace = false) => {
    if (replace) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }
    setLocation(path);
  };
  
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };
  
  const goHome = () => {
    navigate('/');
  };
  
  return {
    navigate,
    goBack,
    goHome
  };
}