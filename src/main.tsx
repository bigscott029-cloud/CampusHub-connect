import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initMonitoring, MonitoringErrorBoundary } from "@/lib/monitoring";

initMonitoring();

createRoot(document.getElementById("root")!).render(
  <MonitoringErrorBoundary
    fallback={
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center text-foreground">
        <div>
          <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">Please refresh the page. If it continues, contact CampusHub support.</p>
        </div>
      </div>
    }
  >
    <App />
  </MonitoringErrorBoundary>,
);
