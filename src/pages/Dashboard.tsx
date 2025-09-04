import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Ship, 
  ClipboardCheck, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Users,
  Calendar,
  TrendingUp,
  Activity,
  Shield
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Dashboard = () => {
  // Mock data for charts
  const dockyardData = [
    { name: 'Jan', pending: 12, approved: 28, rejected: 3 },
    { name: 'Feb', pending: 8, approved: 35, rejected: 2 },
    { name: 'Mar', pending: 15, approved: 22, rejected: 5 },
    { name: 'Apr', pending: 10, approved: 30, rejected: 1 },
  ];

  const surveyStatusData = [
    { name: 'Completed', value: 65, color: '#22c55e' },
    { name: 'In Progress', value: 25, color: '#f59e0b' },
    { name: 'Overdue', value: 10, color: '#ef4444' },
  ];

  const quickStats = [
    {
      title: "Active Vessels",
      value: "142",
      change: "+5 from last month",
      icon: Ship,
      variant: "default" as const
    },
    {
      title: "Pending Approvals",
      value: "23",
      change: "-8 from last week",
      icon: Clock,
      variant: "warning" as const
    },
    {
      title: "Completed Surveys",
      value: "89%",
      change: "+12% from last quarter",
      icon: CheckCircle,
      variant: "success" as const
    },
    {
      title: "Critical Issues",
      value: "7",
      change: "Requires immediate attention",
      icon: AlertTriangle,
      variant: "destructive" as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Operations Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Real-time overview of hull maintenance and inspection activities
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.title} className="shadow-card hover:shadow-naval transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${
                  stat.variant === 'success' ? 'bg-success/10' :
                  stat.variant === 'warning' ? 'bg-warning/10' :
                  stat.variant === 'destructive' ? 'bg-destructive/10' :
                  'bg-primary/10'
                }`}>
                  <stat.icon className={`h-6 w-6 ${
                    stat.variant === 'success' ? 'text-success' :
                    stat.variant === 'warning' ? 'text-warning' :
                    stat.variant === 'destructive' ? 'text-destructive' :
                    'text-primary'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dockyard Approvals Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-primary" />
              Dockyard Plan Approvals
            </CardTitle>
            <CardDescription>Monthly approval status trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dockyardData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />   // amber
<Bar dataKey="approved" fill="#22c55e" name="Approved" /> // green
<Bar dataKey="rejected" fill="#ef4444" name="Rejected" /> // red
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Survey Status Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-secondary" />
              Hull Survey Status
            </CardTitle>
            <CardDescription>Current quarter progress overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={surveyStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {surveyStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {surveyStatusData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.name} ({entry.value}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { action: "Dockyard plan approved", vessel: "INS Vikrant", time: "2 hours ago", type: "approved" },
              { action: "Hull survey completed", vessel: "INS Shivalik", time: "4 hours ago", type: "completed" },
              { action: "Critical defect reported", vessel: "INS Kolkata", time: "6 hours ago", type: "critical" },
              { action: "Equipment inspection due", vessel: "INS Chennai", time: "1 day ago", type: "due" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.vessel}</p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={
                      activity.type === 'approved' ? 'default' :
                      activity.type === 'completed' ? 'secondary' :
                      activity.type === 'critical' ? 'destructive' :
                      'outline'
                    }
                    className="mb-1"
                  >
                    {activity.type}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="naval" className="w-full justify-start">
              <Ship className="h-4 w-4 mr-2" />
              Initiate New Dockyard Plan
            </Button>
            <Button variant="ocean" className="w-full justify-start">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Schedule Hull Survey
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Manage Team Access
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              System Audit Trail
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
