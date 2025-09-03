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
import { VoiceNavigation } from "@/components/VoiceNavigation";
import { PWACapabilities } from "@/components/PWACapabilities";

// Pages
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Share from "@/pages/Share";
import History from "@/pages/History";
import Settings from "@/pages/Settings";
import ProofGeneration from "@/pages/ProofGeneration";
import Verification from "@/pages/Verification";
import Admin from "@/pages/Admin";
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
        
        <Route component={NotFound} />
      </Switch>
      <MobileNav />
    </>
  );
}

function App() {
  return (
    <ContextualThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
          <VoiceNavigation />
        </TooltipProvider>
      </QueryClientProvider>
    </ContextualThemeProvider>
  );
}

function AppWithTheme() {
  useAutoThemeDetection();
  return <App />;
}

export default AppWithTheme;
