import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Users, 
  Brain,
  Bed,
  AlertTriangle,
  Calendar,
  BarChart3
} from "lucide-react";

interface HospitalMetrics {
  activePatients: number;
  bedOccupancy: string;
  criticalAlerts: number;
  aiSummariesGenerated: number;
  departmentLoads: {
    emergency: number;
    icu: number;
    surgery: number;
  };
}

interface AnalyticsData {
  patientFlow: Array<{ hour: string; admissions: number; discharges: number }>;
  departmentMetrics: Array<{ name: string; load: number; capacity: number; status: string }>;
  aiPerformance: {
    avgResponseTime: number;
    successRate: number;
    modelAccuracy: number;
    totalSummaries: number;
  };
  timeSeriesData: Array<{ date: string; patients: number; alerts: number; summaries: number }>;
}

export default function Analytics() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<HospitalMetrics>({
    queryKey: ["/api/metrics"],
    refetchInterval: 30000,
  });

  // Mock analytics data - in production this would come from dedicated analytics endpoints
  const mockAnalyticsData: AnalyticsData = {
    patientFlow: [
      { hour: "00:00", admissions: 2, discharges: 1 },
      { hour: "04:00", admissions: 1, discharges: 0 },
      { hour: "08:00", admissions: 8, discharges: 3 },
      { hour: "12:00", admissions: 12, discharges: 7 },
      { hour: "16:00", admissions: 9, discharges: 11 },
      { hour: "20:00", admissions: 5, discharges: 4 },
    ],
    departmentMetrics: [
      { name: "Emergency", load: 85, capacity: 100, status: "high" },
      { name: "ICU", load: 67, capacity: 80, status: "medium" },
      { name: "Surgery", load: 45, capacity: 60, status: "low" },
      { name: "Cardiology", load: 72, capacity: 85, status: "medium" },
      { name: "Pediatrics", load: 58, capacity: 70, status: "low" },
    ],
    aiPerformance: {
      avgResponseTime: 2.3,
      successRate: 99.2,
      modelAccuracy: 94.7,
      totalSummaries: 1247,
    },
    timeSeriesData: [
      { date: "Mon", patients: 245, alerts: 5, summaries: 67 },
      { date: "Tue", patients: 251, alerts: 3, summaries: 72 },
      { date: "Wed", patients: 247, alerts: 7, summaries: 69 },
      { date: "Thu", patients: 253, alerts: 4, summaries: 78 },
      { date: "Fri", patients: 249, alerts: 6, summaries: 74 },
      { date: "Sat", patients: 235, alerts: 2, summaries: 58 },
      { date: "Sun", patients: 228, alerts: 1, summaries: 52 },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getLoadColor = (load: number) => {
    if (load >= 80) return "bg-red-500";
    if (load >= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="p-6" data-testid="analytics-page">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-clinical-gray-900">Hospital Analytics</h1>
        <p className="text-clinical-gray-600 mt-1">Comprehensive insights into hospital operations and performance</p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-clinical-gray-200" data-testid="kpi-patient-capacity">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-clinical-gray-600 text-sm font-medium">Patient Capacity</p>
                <p className="text-2xl font-bold text-clinical-gray-900 mt-1">
                  {metrics?.bedOccupancy || 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bed className="text-blue-600 w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="text-green-500 mr-1 w-4 h-4" />
              <span className="text-green-600 font-medium">+3.2%</span>
              <span className="text-clinical-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-clinical-gray-200" data-testid="kpi-avg-stay">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-clinical-gray-600 text-sm font-medium">Avg Length of Stay</p>
                <p className="text-2xl font-bold text-clinical-gray-900 mt-1">3.2 days</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="text-purple-600 w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingDown className="text-green-500 mr-1 w-4 h-4" />
              <span className="text-green-600 font-medium">-0.3 days</span>
              <span className="text-clinical-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-clinical-gray-200" data-testid="kpi-patient-satisfaction">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-clinical-gray-600 text-sm font-medium">Patient Satisfaction</p>
                <p className="text-2xl font-bold text-clinical-gray-900 mt-1">4.7/5</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="text-green-600 w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="text-green-500 mr-1 w-4 h-4" />
              <span className="text-green-600 font-medium">+0.2</span>
              <span className="text-clinical-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-clinical-gray-200" data-testid="kpi-cost-per-patient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-clinical-gray-600 text-sm font-medium">Cost per Patient</p>
                <p className="text-2xl font-bold text-clinical-gray-900 mt-1">$2,450</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-orange-600 w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingDown className="text-green-500 mr-1 w-4 h-4" />
              <span className="text-green-600 font-medium">-$127</span>
              <span className="text-clinical-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Patient Flow Chart */}
        <Card className="border-clinical-gray-200" data-testid="patient-flow-chart">
          <CardHeader className="border-b border-clinical-gray-200">
            <CardTitle className="text-lg font-semibold text-clinical-gray-900">
              Patient Flow (24h)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {mockAnalyticsData.patientFlow.map((flow, index) => (
                <div key={flow.hour} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-clinical-gray-600">{flow.hour}</span>
                    <div className="flex space-x-4">
                      <span className="text-green-600">↑ {flow.admissions}</span>
                      <span className="text-blue-600">↓ {flow.discharges}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${(flow.admissions / 15) * 100}%` }}
                      ></div>
                    </div>
                    <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${(flow.discharges / 15) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-clinical-gray-200">
              <div className="flex justify-between text-sm text-clinical-gray-500">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Admissions
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  Discharges
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Load */}
        <Card className="border-clinical-gray-200" data-testid="department-load-chart">
          <CardHeader className="border-b border-clinical-gray-200">
            <CardTitle className="text-lg font-semibold text-clinical-gray-900">
              Department Capacity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {mockAnalyticsData.departmentMetrics.map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-clinical-gray-900">{dept.name}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={`text-xs ${getStatusColor(dept.status)}`}>
                        {Math.round((dept.load / dept.capacity) * 100)}%
                      </Badge>
                      <span className="text-xs text-clinical-gray-500">
                        {dept.load}/{dept.capacity}
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={(dept.load / dept.capacity) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Performance and Weekly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Performance Metrics */}
        <Card className="border-clinical-gray-200" data-testid="ai-performance-metrics">
          <CardHeader className="border-b border-clinical-gray-200">
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-medical-blue-500" />
              AI Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-clinical-gray-900">
                    {mockAnalyticsData.aiPerformance.avgResponseTime}s
                  </p>
                  <p className="text-sm text-clinical-gray-600">Avg Response Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {mockAnalyticsData.aiPerformance.successRate}%
                  </p>
                  <p className="text-sm text-clinical-gray-600">Success Rate</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-clinical-gray-600">Model Accuracy</span>
                  <span className="text-sm font-mono text-clinical-gray-900">
                    {mockAnalyticsData.aiPerformance.modelAccuracy}%
                  </span>
                </div>
                <Progress value={mockAnalyticsData.aiPerformance.modelAccuracy} className="h-2" />
              </div>

              <div className="pt-4 border-t border-clinical-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-clinical-gray-600">Total Summaries Generated</span>
                  <span className="text-lg font-bold text-clinical-gray-900">
                    {mockAnalyticsData.aiPerformance.totalSummaries.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-clinical-gray-500 mt-1">
                  Model: groq/deepseek-r1-distill-llama-70b
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trends */}
        <Card className="border-clinical-gray-200" data-testid="weekly-trends">
          <CardHeader className="border-b border-clinical-gray-200">
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-medical-teal-500" />
              Weekly Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {mockAnalyticsData.timeSeriesData.map((day, index) => (
                <div key={day.date} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-clinical-gray-900">{day.date}</span>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-blue-600">{day.patients}p</span>
                      <span className="text-red-600">{day.alerts}a</span>
                      <span className="text-green-600">{day.summaries}s</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="h-1 bg-blue-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(day.patients / 260) * 100}%` }}
                      ></div>
                    </div>
                    <div className="h-1 bg-red-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${(day.alerts / 10) * 100}%` }}
                      ></div>
                    </div>
                    <div className="h-1 bg-green-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(day.summaries / 80) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-clinical-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center text-xs text-clinical-gray-500">
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                  Patients
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                  Alerts
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Summaries
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
