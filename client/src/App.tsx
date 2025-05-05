import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground antialiased">
        {/* Background decorative elements */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-highlight-purple/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-highlight-blue/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-highlight-yellow/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-highlight-green/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '3s' }}></div>
        </div>
        
        <Router />
      </div>
    </TooltipProvider>
  );
}

export default App;
