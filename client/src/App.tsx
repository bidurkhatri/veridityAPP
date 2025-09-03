import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import MobileNav from "@/components/MobileNav";

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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
