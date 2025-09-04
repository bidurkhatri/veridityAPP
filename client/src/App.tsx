import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import MobileNav from "@/components/MobileNav";
import { useState, useEffect } from "react";
import { Onboarding } from "@/components/Onboarding";
import { ContextualThemeProvider, useAutoThemeDetection } from "@/components/ContextualTheme";
import { VoiceNavigationNew as VoiceNavigation } from "@/components/VoiceNavigationNew";
import { PWACapabilities } from "@/components/PWACapabilities";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";

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
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Check if user has seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('veridity-onboarding-complete');
    if (!hasSeenOnboarding && isAuthenticated && !isLoading) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated, isLoading]);
  
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
      <Switch>
        {/* Mobile-first navigation structure as per PRD */}
        <Route path="/" component={Home} />
        <Route path="/prove" component={ProofGeneration} />
        <Route path="/share" component={Share} />
        <Route path="/history" component={History} />
        <Route path="/settings" component={Settings} />
        
        {/* Legacy routes for backward compatibility */}
        <Route path="/generate" component={ProofGeneration} />
        <Route path="/verify" component={Verification} />
        <Route path="/admin" component={Admin} />
        
        {/* Support and Legal Pages */}
        <Route path="/help" component={Help} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/organizations" component={OrganizationDashboard} />
        
        <Route component={NotFound} />
      </Switch>
      <MobileNav />
    </>
  );
}

function AppWithTheme() {
  useAutoThemeDetection();
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
        <TooltipProvider>
          <Toaster />
          <OfflineIndicator />
          <Router />
          <VoiceNavigation 
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ContextualThemeProvider>
      <AppWithTheme />
    </ContextualThemeProvider>
  );
}

export default App;
