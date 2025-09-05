"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, Clock, CheckCircle, AlertTriangle, Ship, Settings, ClipboardCheck } from "lucide-react";

const ShipDashboard = () => {
  // Mock data - in real app, this would come from props or API
  const stats = {
    totalSurveys: 18,
    pendingSurveys: 5,
    completedThisMonth: 8,
    hvacTrials: 12
  };

  const recentActivity = [
    { id: 1, vessel: "INS Vikrant", action: "Quarterly survey completed", time: "1 hour ago", status: "completed" },
    { id: 2, vessel: "INS Delhi", action: "HVAC trial in progress", time: "3 hours ago", status: "in_progress" },
    { id: 3, vessel: "INS Mumbai", action: "Survey report generated", time: "6 hours ago", status: "reported" },
    { id: 4, vessel: "INS Chennai", action: "New survey scheduled", time: "1 day ago", status: "scheduled" }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSurveys}</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Surveys</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSurveys}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedThisMonth}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">HVAC Trials</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hvacTrials}</div>
            <p className="text-xs text-muted-foreground">Active trials</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {activity.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {activity.status === "in_progress" && <Clock className="h-5 w-5 text-yellow-500" />}
                  {activity.status === "reported" && <FileText className="h-5 w-5 text-blue-500" />}
                  {activity.status === "scheduled" && <AlertTriangle className="h-5 w-5 text-gray-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.vessel}</p>
                  <p className="text-sm text-gray-500">{activity.action}</p>
                </div>
                <div className="text-sm text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2">
              <ClipboardCheck className="h-6 w-6" />
              <span>New Survey</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Settings className="h-6 w-6" />
              <span>HVAC Trial</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShipDashboard;
