import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Anchor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import hullInsightLogo from "@/assets/hull-insight-logo.png";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    role: ""
  });
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation - just need all fields filled
    if (!credentials.username || !credentials.password || !credentials.role) {
      alert("Please fill in all fields");
      return;
    }
    
    // Create user data
    const userData = {
      username: credentials.username,
      role: credentials.role,
      name: credentials.username.charAt(0).toUpperCase() + credentials.username.slice(1)
    };
    
    // Store in localStorage and navigate
    localStorage.setItem("user", JSON.stringify(userData));
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-naval">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <img src={hullInsightLogo} alt="Hull Insight" className="w-16 h-16" />
              <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-full"></div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Hull Insight</CardTitle>
          <CardDescription className="text-muted-foreground">
            Indian Navy Hull Maintenance System
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={credentials.role} onValueChange={(value) => setCredentials({...credentials, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initiator">Initiator</SelectItem>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                  <SelectItem value="approver">Approver</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" variant="naval" className="w-full" size="lg">
              <Anchor className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;