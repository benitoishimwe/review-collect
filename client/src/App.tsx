import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Campaigns from "./pages/Campaigns";
import Reviews from "./pages/Reviews";
import QRCode from "./pages/QRCode";
import ReviewPage from "./pages/ReviewPage";
import ReviewSuccess from "./pages/ReviewSuccess";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/review/:slug" component={ReviewPage} />
      <Route path="/review/:slug/success" component={ReviewSuccess} />

      {/* Dashboard routes (protected) */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/profile" component={Profile} />
      <Route path="/dashboard/campaigns" component={Campaigns} />
      <Route path="/dashboard/reviews" component={Reviews} />
      <Route path="/dashboard/qrcode" component={QRCode} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
