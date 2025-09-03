import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("MainLayout: Checking for user authentication");
    const userData = localStorage.getItem("user");
    console.log("MainLayout: userData from localStorage:", userData);
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log("MainLayout: parsed user data:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("MainLayout: Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    } else {
      console.log("MainLayout: No user data found");
    }
    setIsLoading(false);
  }, []);

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen flex bg-background">
      <Sidebar collapsed={sidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;