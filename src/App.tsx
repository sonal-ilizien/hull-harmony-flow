import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import FleetMaster from "./pages/masters/FleetMaster";
import UnitMaster from "./pages/masters/UnitMaster";
import CommandMaster from "./pages/masters/CommandMaster";
import VesselMaster from "./pages/masters/VesselMaster";
import DockyardMaster from "./pages/masters/DockyardMaster";
import NotFound from "./pages/NotFound";
import Drawing from "./pages/Drawing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="masters/fleet" element={<FleetMaster />} />
          <Route path="masters/unit" element={<UnitMaster />} />
          <Route path="masters/command" element={<CommandMaster />} />
          <Route path="masters/vessel" element={<VesselMaster />} />
          <Route path="masters/dockyard" element={<DockyardMaster />} />
          {/* Placeholder routes for other masters */}
          <Route path="masters/*" element={<div className="p-8 text-center text-muted-foreground">Master page coming soon...</div>} />
          <Route path="dockyard/*" element={<div className="p-8 text-center text-muted-foreground">Dockyard module coming soon...</div>} />
          <Route path="survey/*" element={<div className="p-8 text-center text-muted-foreground">Survey module coming soon...</div>} />
          <Route path="reports/*" element={<div className="p-8 text-center text-muted-foreground">Reports module coming soon...</div>} />
          <Route
            path="/drawing"
            element={
              
                <Drawing />
            }
          />
        </Route>
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
