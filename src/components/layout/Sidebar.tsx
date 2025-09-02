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
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import hullInsightLogo from "@/assets/hull-insight-logo.png";

const sidebarItems = [
  {
    title: "Global Masters",
    icon: Database,
    items: [
      { title: "Fleet Master", path: "/masters/fleet" },
      { title: "Vessel Master", path: "/masters/vessel" },
      { title: "Command Master", path: "/masters/command" },
      { title: "Dockyard Master", path: "/masters/dockyard" },
      { title: "User Master", path: "/masters/user" },
      { title: "Equipment Master", path: "/masters/equipment" }
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
    title: "Dashboards",
    icon: BarChart3,
    path: "/dashboard"
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
  }
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
    <div className={cn(
      "bg-gradient-header border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border/20">
        <div className="flex items-center gap-3">
          <img src={hullInsightLogo} alt="Hull Insight" className="w-8 h-8" />
          {!collapsed && (
            <div className="text-primary-foreground">
              <h2 className="font-bold text-lg">Hull Insight</h2>
              <p className="text-xs opacity-80">Naval Operations</p>
            </div>
          )}
        </div>
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
                    "w-full justify-start text-primary-foreground hover:bg-primary-foreground/10",
                    isActive(item.path) && "bg-primary-foreground/20"
                  )}
                  size={collapsed ? "icon" : "default"}
                >
                  <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
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
                    className="w-full justify-start text-primary-foreground hover:bg-primary-foreground/10"
                    size={collapsed ? "icon" : "default"}
                  >
                    <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.title}</span>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform",
                          expandedItems.includes(item.title) && "rotate-180"
                        )} />
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                {!collapsed && (
                  <CollapsibleContent className="ml-6 space-y-1">
                    {item.items?.map((subItem) => (
                      <NavLink key={subItem.path} to={subItem.path}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-primary-foreground/80 hover:bg-primary-foreground/10",
                            isActive(subItem.path) && "bg-primary-foreground/20 text-primary-foreground"
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