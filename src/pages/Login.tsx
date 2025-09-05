import { useState } from "react";
import { loginUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Anchor } from "lucide-react";
import { Navigate } from "react-router-dom";
import hullInsightLogo from "@/assets/hull-insight-logo.png";
import { motion } from "framer-motion";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [redirect, setRedirect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await loginUser(credentials.username, credentials.password);
      localStorage.setItem("user", JSON.stringify(data));
      setRedirect(true);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (redirect) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient ocean background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        style={{ backgroundSize: "200% 200%" }}
      />

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-white rounded-full opacity-20"
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
            animate={{ y: [null, -50], opacity: [0.3, 0.8, 0] }}
            transition={{ duration: 8 + Math.random() * 5, repeat: Infinity, repeatType: "loop" }}
          />
        ))}
      </div>

      {/* Glassmorphic login card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-11/12 max-w-xl min-w-[400px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl relative overflow-hidden">
          <CardHeader className="text-center space-y-4">
            {/* Animated Logo */}
            <motion.div
              className="flex justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <img src={hullInsightLogo} alt="Hull Insight" className="w-16 h-16 drop-shadow-lg" />
            </motion.div>
            <CardTitle className="text-3xl font-extrabold text-white drop-shadow-lg">
              Hull Insight
            </CardTitle>
            <CardDescription className="text-blue-100 text-sm">
              Indian Navy Hull Maintenance System
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder-white/60"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder-white/60"
                  required
                />
              </div>

              {error && <div className="text-red-400 text-sm">{error}</div>}

              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-800 transition-all"
                  disabled={loading}
                >
                  <Anchor className="w-4 h-4 mr-2" />
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
