"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Filter } from "lucide-react";

const ShipReports = () => {
  const reports = [
    {
      id: 1,
      title: "Quarterly Hull Survey Summary",
      type: "PDF",
      generated: "2025-01-20T15:00:00Z",
      size: "2.8 MB"
    },
    {
      id: 2,
      title: "HVAC Trial Results Report",
      type: "EXCEL",
      generated: "2025-01-18T10:30:00Z",
      size: "1.5 MB"
    },
    {
      id: 3,
      title: "Vessel Inspection Report",
      type: "PDF",
      generated: "2025-01-15T14:20:00Z",
      size: "4.2 MB"
    },
    {
      id: 4,
      title: "Compliance Status Report",
      type: "PDF",
      generated: "2025-01-12T09:15:00Z",
      size: "2.1 MB"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Ship Reports</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-medium">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Generated: {new Date(report.generated).toLocaleDateString()} • {report.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                    {report.type}
                  </span>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShipReports;
