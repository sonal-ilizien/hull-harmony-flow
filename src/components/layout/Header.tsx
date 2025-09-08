import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Bell,
  User,
  LogOut,
  Settings,
  Shield,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import cn from "classnames";

interface HeaderProps {
  onToggleSidebar: () => void;
}

interface User {
  username?: string;
  user_roles?: { role: string }[];
  name?: string;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    return pathSegments.map((segment, index) => {
      const path = "/" + pathSegments.slice(0, index + 1).join("/");
      const label =
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      return { path, label };
    });
  };

  const role = user?.user_roles?.[0]?.role?.toLowerCase() || "user";

  const getRoleBadgeClasses = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-300";
      case "super admin":
        return "bg-purple-500/20 text-purple-300";
      case "approver":
        return "bg-green-500/20 text-green-300";
      case "reviewer":
        return "bg-blue-500/20 text-blue-300";
      case "initiator":
        return "bg-yellow-500/20 text-yellow-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  const displayName = user?.name || "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b border-white/10 shadow-md flex items-center justify-between px-6">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hover:bg-white/10 text-white"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-300">
          {getBreadcrumbs().map((crumb, index) => (
            <div key={crumb.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-2 text-gray-500" />
              )}
              <span
                className={
                  index === getBreadcrumbs().length - 1
                    ? "text-white font-medium"
                    : "hover:text-cyan-300 cursor-pointer transition-colors"
                }
              >
                {crumb.label}
              </span>
            </div>
          ))}
        </nav>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-white/10 text-white"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full shadow-lg"></span>
        </Button>

        {/* User menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full shadow-md transition-all"
              >
                {/* Avatar Circle */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500 text-white font-bold">
                  {avatarLetter}
                </div>

                {/* Name + Role stacked */}
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-sm">{displayName}</div>
                  <span
                    className={cn(
                      "text-[11px] px-2 py-0.5 rounded-md font-medium",
                      getRoleBadgeClasses(role)
                    )}
                  >
                    {role}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 bg-[#1e293b] text-white border border-white/10 shadow-xl rounded-lg"
            >
              <DropdownMenuItem className="hover:bg-white/10">
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-white/10">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-white/10">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-400 hover:bg-red-500/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default Header;
