import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Report from "./pages/Report";
import Track from "./pages/Track";
import Nearby from "./pages/Nearby";
import Safety from "./pages/Safety";
import Dashboard from "./pages/Dashboard";
import Authority from "./pages/Authority";
import Oversight from "./pages/Oversight";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { Route, Switch } from "wouter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/report" component={Report} />
      <Route path="/track" component={Track} />
      <Route path="/nearby" component={Nearby} />
      <Route path="/safety" component={Safety} />
      <Route path="/awareness" component={Awareness} />
      <Route path="/about" component={About} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/authority" component={Authority} />
      <Route path="/oversight" component={Oversight} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Awareness() {
  return (
    <main className="page-frame page-frame--narrow">
      <h1 className="display-title">Know how your city works.</h1>
      <p className="lead-copy">CivicSense makes public-service pathways easier to understand so residents can report clearly, follow progress, and participate in better local outcomes.</p>
      <div className="info-grid">
        {["Write useful reports", "Understand priority", "Follow the record"].map((title, index) => (
          <article className="info-card" key={title}><span className="eyebrow">0{index + 1}</span><h2>{title}</h2><p>{["A precise location, clear description, and photo help teams act faster.", "Safety and urgency details help route the right work to the right queue.", "Every status update stays visible so progress is accountable."][index]}</p></article>
        ))}
      </div>
    </main>
  );
}

function About() {
  return (
    <main className="page-frame page-frame--narrow">
      <span className="eyebrow">ABOUT CIVICSENSE</span>
      <h1 className="display-title">A clearer path from public voice to public action.</h1>
      <p className="lead-copy">CivicSense is a civic operations layer: one place to report public problems, route them to accountable teams, and keep residents informed until the issue is resolved.</p>
      <div className="quote-panel"><span>“</span><p>Every update matters when the outcome belongs to everyone.</p></div>
    </main>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
