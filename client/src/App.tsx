import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import MobileNav from "@/components/MobileNav";
import { useState, useEffect } from "react";
import { Onboarding } from "@/components/Onboarding";
import { useTheme } from "@/hooks/useTheme";
import { VoiceNavigationNew as VoiceNavigation } from "@/components/VoiceNavigationNew";
import { PWACapabilities } from "@/components/PWACapabilities";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import { HighContrastProvider } from "@/components/ui/high-contrast-theme";

// Pages
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Share from "@/pages/Share";
import History from "@/pages/History";
import Settings from "@/pages/Settings";
import ProofGeneration from "@/pages/ProofGeneration";
import Verification from "@/pages/Verification";
import Admin from "@/pages/Admin";
import Help from "@/pages/Help";
import Privacy from "@/pages/Privacy";
import OrganizationDashboard from "@/pages/OrganizationDashboard";
import EnterpriseDashboard from "@/pages/EnterpriseDashboard";
import UserDashboard from "@/pages/UserDashboard";
import OrgAdminDashboard from "@/pages/OrgAdminDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import QRVerification from "@/pages/QRVerification";
import NotFound from "@/pages/not-found";

interface RouterProps {
  user?: {
    role: 'customer' | 'client' | 'admin';
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

function RoleBasedRouter({ user }: RouterProps) {
  // Direct role-based routing for production
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  // Route directly to role-specific dashboard
  const getDashboardComponent = () => {
    switch (user.role) {
      case 'admin':
        return AdminDashboard;
      case 'client':
        return OrgAdminDashboard;
      case 'customer':
      default:
        return UserDashboard;
    }
  };

  const DashboardComponent = getDashboardComponent();

  return (
    <Switch>
      {/* Role-specific dashboard as home */}
      <Route path="/" component={DashboardComponent} />
      
      {/* Core application routes */}
      <Route path="/prove" component={ProofGeneration} />
      <Route path="/share" component={Share} />
      <Route path="/history" component={History} />
      <Route path="/settings" component={Settings} />
      
      {/* Legacy routes for backward compatibility */}
      <Route path="/generate" component={ProofGeneration} />
      <Route path="/verify" component={Verification} />
      
      {/* Admin routes (protected by role-based access) */}
      {user.role === 'admin' && (
        <Route path="/admin" component={Admin} />
      )}
      
      {/* Organization routes (protected by role-based access) */}
      {(user.role === 'admin' || user.role === 'client') && (
        <Route path="/organizations" component={OrganizationDashboard} />
      )}
      
      {/* QR Verification Routes */}
      <Route path="/verify-qr" component={QRVerification} />
      
      {/* Support and Legal Pages */}
      <Route path="/help" component={Help} />
      <Route path="/privacy" component={Privacy} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Check if user has seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('veridity-onboarding-complete');
    if (!hasSeenOnboarding && isAuthenticated && !isLoading && user) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated, isLoading, user]);
  
  const handleOnboardingComplete = () => {
    localStorage.setItem('veridity-onboarding-complete', 'true');
    setShowOnboarding(false);
  };
  
  const handleOnboardingSkip = () => {
    localStorage.setItem('veridity-onboarding-complete', 'true');
    setShowOnboarding(false);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <>
      {showOnboarding && (
        <Onboarding 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
      <RoleBasedRouter user={user as any} />
      <MobileNav />
    </>
  );
}

function AppWithTheme() {
  const { theme } = useTheme(); // Use unified theme system
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ne'>('en');

  // Load language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('veridity-language') as 'en' | 'ne';
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ne')) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('veridity-language', currentLanguage);
  }, [currentLanguage]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AccessibilityProvider>
          <HighContrastProvider>
            <TooltipProvider>
              <Toaster />
              <OfflineIndicator />
              <Router />
              <VoiceNavigation 
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
              />
            </TooltipProvider>
          </HighContrastProvider>
        </AccessibilityProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function App() {
  return <AppWithTheme />;
}

export default App;
