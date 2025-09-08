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
import EquipmentMaster from "@/pages/masters/EquipmentMaster";
import DamageTypeMaster from "@/pages/masters/DamageTypeMaster";
import SeverityMaster from "@/pages/masters/SeverityMaster";
import OperationalStatusMaster from "@/pages/masters/OperationalStatusMaster";
import SubmoduleMaster from "@/pages/masters/SubmoduleMaster";
import ModuleMaster from "@/pages/masters/ModuleMaster"; // <-- Add this import
import CompartmentMaster from "@/pages/masters/CompartmentMaster";
import SystemMaster from "@/pages/masters/SystemMaster"; // <-- Create this file similarly
import UserMaster from "@/pages/masters/UserMaster";
import RootConfigMaster from "@/pages/masters/RootConfigMaster";
import RoleMaster from "@/pages/masters/RoleMaster";
import RoleAccess from "./pages/masters/RoleAccess";
import Landing from "./pages/Landing";
// Module imports
import YardModule from "./pages/yard/YardModule";
import ShipModule from "./pages/ship/ShipModule";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="masters/fleet" element={<FleetMaster />} />
          <Route path="masters/unit" element={<UnitMaster />} />
          <Route path="masters/command" element={<CommandMaster />} />
          <Route path="masters/vessel" element={<VesselMaster />} />
          <Route path="masters/dockyard" element={<DockyardMaster />} />
          <Route path="/masters/equipment" element={<EquipmentMaster />} />
          <Route path="/masters/module" element={<ModuleMaster />} /> {/* <-- Add this line */}
          <Route path="/masters/submodule" element={<SubmoduleMaster />} />
          <Route path="/masters/damagetype" element={<DamageTypeMaster />} />
          <Route path="/masters/severity" element={<SeverityMaster />} />
          <Route path="/masters/operationalstatus" element={<OperationalStatusMaster />} />
          <Route path="/masters/compartment" element={<CompartmentMaster />} />
          <Route path="/masters/system" element={<SystemMaster />} />
          <Route path="/masters/user" element={<UserMaster />} />
          <Route path="/masters/rootconfig" element={<RootConfigMaster />} />
          <Route path="/masters/role" element={<RoleMaster />} />
          <Route path="/masters/roleaccess" element={<RoleAccess />} />
          {/* Placeholder routes for other masters */}
          <Route path="masters/*" element={<div className="p-8 text-center text-muted-foreground">Master page coming soon...</div>} />
          
          {/* Yard Operations Module */}
          <Route path="yard/*" element={<YardModule />} />
          
          {/* Ship Operations Module */}
          <Route path="ship/*" element={<ShipModule />} />
          
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
