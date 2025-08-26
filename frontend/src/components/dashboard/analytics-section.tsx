import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Activity, 
  BarChart3,
  Brain,
  Clock
} from "lucide-react";

export default function AnalyticsSection() {
  // Mock data for analytics display
  const patientFlowData = [
    { hour: "06:00", admissions: 3, discharges: 1 },
    { hour: "08:00", admissions: 8, discharges: 2 },
    { hour: "10:00", admissions: 6, discharges: 4 },
    { hour: "12:00", admissions: 12, discharges: 7 },
    { hour: "14:00", admissions: 9, discharges: 11 },
    { hour: "16:00", admissions: 7, discharges: 8 },
  ];

  const departmentLoads = [
    { name: "Emergency", load: 85, status: "high" },
    { name: "ICU", load: 67, status: "medium" },
    { name: "Surgery", load: 45, status: "low" },
  ];

  const aiMetrics = {
    avgResponseTime: 2.3,
    successRate: 99.2,
    modelAccuracy: 94.7,
    model: "groq/deepseek-r1-distill-llama-70b",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="mt-8" data-testid="analytics-section">
      <Card className="border-clinical-gray-200 shadow-sm">
        <CardHeader className="border-b border-clinical-gray-200">
          <CardTitle className="text-lg font-semibold text-clinical-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-medical-blue-500" />
            Hospital Analytics
          </CardTitle>
          <p className="text-clinical-gray-600 text-sm mt-1">Real-time operational insights and predictive analytics</p>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Patient Flow Chart */}
            <div className="bg-clinical-gray-50 rounded-lg p-4" data-testid="patient-flow-analytics">
              <h4 className="font-medium text-clinical-gray-900 mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Patient Flow (24h)
              </h4>
              <div className="space-y-3">
                {patientFlowData.map((flow) => (
                  <div key={flow.hour} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-clinical-gray-600">{flow.hour}</span>
                      <div className="flex space-x-2">
                        <span className="text-green-600">↑{flow.admissions}</span>
                        <span className="text-blue-600">↓{flow.discharges}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="h-1 bg-green-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${(flow.admissions / 15) * 100}%` }}
                        ></div>
                      </div>
                      <div className="h-1 bg-blue-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(flow.discharges / 15) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Load */}
            <div className="bg-clinical-gray-50 rounded-lg p-4" data-testid="department-load-analytics">
              <h4 className="font-medium text-clinical-gray-900 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Department Load
              </h4>
              <div className="space-y-3">
                {departmentLoads.map((dept) => (
                  <div key={dept.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-clinical-gray-600">{dept.name}</span>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={dept.load}
                          className="w-16 h-2"
                        />
                        <span className="text-xs font-mono text-clinical-gray-700">{dept.load}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Performance Metrics */}
            <div className="bg-clinical-gray-50 rounded-lg p-4" data-testid="ai-performance-analytics">
              <h4 className="font-medium text-clinical-gray-900 mb-3 flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                AI Performance
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-clinical-gray-600">Avg Response Time</span>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <Clock className="w-3 h-3 mr-1" />
                    {aiMetrics.avgResponseTime}s
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-clinical-gray-600">Success Rate</span>
                  <span className="text-sm font-mono text-green-600">{aiMetrics.successRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-clinical-gray-600">Model Accuracy</span>
                  <span className="text-sm font-mono text-green-600">{aiMetrics.modelAccuracy}%</span>
                </div>
                <div className="pt-2 border-t border-clinical-gray-300">
                  <div className="text-xs text-clinical-gray-500">
                    Model: {aiMetrics.model}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
