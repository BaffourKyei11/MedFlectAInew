import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { 
  UserCheck, 
  Brain, 
  Bed, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Users
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function MetricsCards() {
  const { data: metrics, isLoading } = useQuery<HospitalMetrics>({
    queryKey: ["/api/metrics"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-clinical-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="w-12 h-12 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-32 mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: "Active Patients",
      value: metrics?.activePatients || 0,
      icon: UserCheck,
      iconBg: "bg-medical-blue-100",
      iconColor: "text-medical-blue-600",
      change: "+12%",
      changeText: "vs last week",
      changeColor: "text-green-600",
      testId: "metric-active-patients"
    },
    {
      title: "AI Summaries Today",
      value: metrics?.aiSummariesGenerated || 0,
      icon: Brain,
      iconBg: "bg-medical-teal-100",
      iconColor: "text-medical-teal-600",
      change: "Avg: 2.3s generation",
      changeText: "",
      changeColor: "text-clinical-gray-600",
      testId: "metric-ai-summaries"
    },
    {
      title: "Bed Occupancy",
      value: `${metrics?.bedOccupancy || 0}%`,
      icon: Bed,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      change: "142 of 163 beds occupied",
      changeText: "",
      changeColor: "text-clinical-gray-600",
      testId: "metric-bed-occupancy"
    },
    {
      title: "Critical Alerts",
      value: metrics?.criticalAlerts || 0,
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      change: "Requires immediate attention",
      changeText: "",
      changeColor: "text-red-600",
      testId: "metric-critical-alerts"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="border-clinical-gray-200 shadow-sm" data-testid={card.testId}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-clinical-gray-600 text-sm font-medium">{card.title}</p>
                  <p className="text-2xl font-bold text-clinical-gray-900 mt-1" data-testid={`${card.testId}-value`}>
                    {card.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${card.iconColor} text-lg w-6 h-6`} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                {card.change.startsWith('+') && <TrendingUp className="text-green-500 mr-1 w-4 h-4" />}
                {card.title === "AI Summaries Today" && <Clock className="text-clinical-gray-400 mr-1 w-4 h-4" />}
                <span className={`${card.changeColor} ${card.change.startsWith('+') ? 'font-medium' : ''}`}>
                  {card.change}
                </span>
                {card.changeText && (
                  <span className="text-clinical-gray-500 ml-1">{card.changeText}</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
