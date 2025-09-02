import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import FleetMaster from "./pages/masters/FleetMaster";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="masters/fleet" element={<FleetMaster />} />
            {/* Placeholder routes for other masters */}
            <Route path="masters/*" element={<div className="p-8 text-center text-muted-foreground">Master page coming soon...</div>} />
            <Route path="dockyard/*" element={<div className="p-8 text-center text-muted-foreground">Dockyard module coming soon...</div>} />
            <Route path="survey/*" element={<div className="p-8 text-center text-muted-foreground">Survey module coming soon...</div>} />
            <Route path="reports/*" element={<div className="p-8 text-center text-muted-foreground">Reports module coming soon...</div>} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
