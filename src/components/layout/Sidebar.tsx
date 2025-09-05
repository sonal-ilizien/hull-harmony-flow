import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Database,
  Ship,
  ClipboardCheck,
  BarChart3,
  FileText,
  ChevronDown,
  Anchor,
  Settings,
  Users,
  Building2,
  Calendar,
  Search,
  PenTool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import hullInsightLogo from "@/assets/hull-insight-logo.png";

const sidebarItems = [
  {
    title: "Dashboards",
    icon: BarChart3,
    path: "/dashboard"
  },
  // ...inside Global Masters items array...
{
  title: "User",
  icon: Users,
  items: [
    { title: "User", path: "/masters/user" },
    { title: "Root Config", path: "/masters/rootconfig" },
    { title: "Role", path: "/masters/role" }
  ]
},
  {
    title: "Global Masters",
    icon: Database,
    items: [
      { title: "Unit", path: "/masters/unit" },
      { title: "Command", path: "/masters/command" },
      { title: "Vessel", path: "/masters/vessel" },
      { title: "Dockyard", path: "/masters/dockyard" },
      { title: "Equipment", path: "/masters/equipment" },
      { title: "Module", path: "/masters/module" },           // <-- Add this line
      { title: "Submodule", path: "/masters/submodule" },
      { title: "Operational Status", path: "/masters/operationalstatus" },
      { title: "Severity", path: "/masters/severity" },
      { title: "Damage Type", path: "/masters/damagetype" },
      { title: "System", path: "/masters/system" },
      { title: "Compartment", path: "/masters/compartment" }
    ]
  },
  {
    title: "Dockyard Plan Approval",
    icon: Ship,
    items: [
      { title: "Plan Initiation", path: "/dockyard/initiate" },
      { title: "Calendar View", path: "/dockyard/calendar" },
      { title: "Approval Workflow", path: "/dockyard/approval" },
      { title: "Status Tracking", path: "/dockyard/status" }
    ]
  },
  {
    title: "Quarterly Hull Survey",
    icon: ClipboardCheck,
    items: [
      { title: "Survey Management", path: "/survey/manage" },
      { title: "Inspection Records", path: "/survey/inspect" },
      { title: "Corrective Actions", path: "/survey/actions" },
      { title: "Compliance Status", path: "/survey/compliance" }
    ]
  },
  
  {
    title: "Reports",
    icon: FileText,
    items: [
      { title: "Docking Reports", path: "/reports/docking" },
      { title: "Survey Reports", path: "/reports/survey" },
      { title: "Compliance Reports", path: "/reports/compliance" },
      { title: "Action Tracker", path: "/reports/actions" }
    ]
  },
  {
    title: "Interactive Drawing",
    icon: PenTool,
    path: "/drawing"
  },
];

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar = ({ collapsed }: SidebarProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(["Global Masters"]);
  const location = useLocation();

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
  className={cn(
    "bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-500 shadow-naval",
    collapsed ? "w-16" : "w-64"
  )}
>
  {/* Header */}
  <div className="p-4 border-b border-sidebar-border flex items-center gap-3 bg-gradient-header">
    <img
      src={hullInsightLogo}
      alt="Hull Insight"
      className="w-12 h-12 transition-transform duration-300 hover:scale-110"
    />
    {!collapsed && (
      <div>
        <h2
          className="font-bold text-lg bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-700 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient-move"
        >
          Hull Insight
        </h2>
        <p className="text-xs bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-700 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient-move">Naval Operations</p>
      </div>
    )}
  </div>

  {/* Navigation */}
  <nav className="p-2 space-y-1">
    {sidebarItems.map((item) => (
      <div key={item.title}>
        {item.path ? (
          // Simple nav item
          <NavLink to={item.path}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start rounded-lg transition-all duration-300 group relative overflow-hidden",
                isActive(item.path)
                  ? "bg-sidebar-accent text-sidebar-foreground font-semibold shadow-card"
                  : "hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
              )}
              size={collapsed ? "icon" : "default"}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                  !collapsed && "mr-2"
                )}
              />
              {!collapsed && <span>{item.title}</span>}
            </Button>
          </NavLink>
        ) : (
          // Collapsible nav item
          <Collapsible
            open={expandedItems.includes(item.title)}
            onOpenChange={() => toggleExpanded(item.title)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start rounded-lg transition-all duration-300 group",
                  "hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                )}
                size={collapsed ? "icon" : "default"}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-300 group-hover:rotate-6",
                    !collapsed && "mr-2"
                  )}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-300",
                        expandedItems.includes(item.title) && "rotate-180"
                      )}
                    />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            {!collapsed && (
              <CollapsibleContent className="ml-6 space-y-1 overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                {item.items?.map((subItem) => (
                  <NavLink key={subItem.path} to={subItem.path}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start rounded-md transition-all duration-200",
                        isActive(subItem.path)
                          ? "bg-sidebar-accent text-sidebar-foreground font-semibold"
                          : "hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                      )}
                    >
                      {subItem.title}
                    </Button>
                  </NavLink>
                ))}
              </CollapsibleContent>
            )}
          </Collapsible>
        )}
      </div>
    ))}
  </nav>
</div>

  );
};

export default Sidebar;
