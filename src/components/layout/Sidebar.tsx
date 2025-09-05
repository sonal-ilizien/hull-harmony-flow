import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Database,
  Ship,
  BarChart3,
  FileText,
  ChevronDown,
  Building2,
  PenTool,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import hullInsightLogo from "@/assets/hull-insight-logo.png";

// Sidebar items (supports nested menus)
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
    title: "Yard Operations",
    icon: Building2,
    items: [
      { title: "Dashboard", path: "/yard/dashboard" },
      {
        title: "Transactions",
        icon: Building2,
        items: [
          { title: "Docking Plan", path: "/yard/docking" }
        ]
      },
      { title: "Reports", path: "/yard/reports" }
    ]
  },
  {
    title: "Ship Operations",
    icon: Ship,
    items: [
      { title: "Dashboard", path: "/ship/dashboard" },
      {
        title: "Transactions",
        icon: Building2,
        items: [
          { title: "Quarterly Hull Survey", path: "/ship/survey" },
          { title: "HVAC Trial", path: "/ship/hvac" }
        ]
      },
      { title: "Reports", path: "/ship/reports" }
    ]
  },
 
  { title: "Interactive Drawing", icon: PenTool, path: "/drawing" }
];

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar = ({ collapsed }: SidebarProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(["Global Masters"]);
  const location = useLocation();

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  // 🔑 Recursive rendering for nested menus
  const renderMenuItems = (items: any[], level = 0) =>
    items.map((item) => {
      if (item.path) {
        // Simple nav item
        return (
          <NavLink key={item.path} to={item.path}>
            <Button
              variant="ghost"
              size={collapsed ? "icon" : "sm"}
              className={cn(
                "w-full justify-start rounded-md transition-all duration-200 relative z-10",
                isActive(item.path)
                  ? "bg-sidebar-accent text-sidebar-foreground font-semibold"
                  : "hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                level > 0 && "ml-4" // indent nested levels
              )}
            >
              {item.icon && !collapsed && (
                <item.icon className="h-4 w-4 mr-2 shrink-0" />
              )}
              {!collapsed && <span className="truncate">{item.title}</span>}
            </Button>
          </NavLink>
        );
      }

      // Collapsible nav item
      return (
        <Collapsible
          key={item.title}
          open={expandedItems.includes(item.title)}
          onOpenChange={() => toggleExpanded(item.title)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size={collapsed ? "icon" : "sm"}
              className={cn(
                "w-full justify-start rounded-lg transition-all duration-300 group relative z-10",
                "hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                level > 0 && "ml-4"
              )}
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
            <CollapsibleContent className="space-y-1 data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
              {renderMenuItems(item.items || [], level + 1)}
            </CollapsibleContent>
          )}
        </Collapsible>
      );
    });

  return (
    <div
      className={cn(
        "bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-500 shadow-naval",
        collapsed ? "w-16" : "w-64",
        "relative overflow-x-hidden overflow-y-auto h-screen" // ✅ fix scroll + highlight clipping
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center gap-3 bg-gradient-header sticky top-0 z-20">
        <img
          src={hullInsightLogo}
          alt="Hull Insight"
          className="w-8 h-8 transition-transform duration-300 hover:scale-110"
        />
        {!collapsed && (
          <div>
            <h2 className="font-bold text-lg text-sidebar-primary">Hull Insight</h2>
            <p className="text-xs text-muted-foreground">Naval Operations</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1 relative z-0">
        {renderMenuItems(sidebarItems)}
      </nav>
    </div>
  );
};

export default Sidebar;
