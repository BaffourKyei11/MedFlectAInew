import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, X, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface RiskAlert {
  id: string;
  patientId: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  riskScore?: string;
  resolved: boolean;
  createdAt: string;
}

interface Patient {
  id: string;
  name: string;
  mrn: string;
}

export default function RiskAlerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts } = useQuery<RiskAlert[]>({
    queryKey: ["/api/risk-alerts"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const resolveMutation = useMutation({
    mutationFn: (alertId: string) =>
      apiRequest("PUT", `/api/risk-alerts/${alertId}/resolve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risk-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({
        title: "Alert Resolved",
        description: "Risk alert has been marked as resolved",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Resolve",
        description: error instanceof Error ? error.message : "Failed to resolve alert",
        variant: "destructive",
      });
    },
  });

  const getPatientName = (patientId: string) => {
    const patient = patients?.find(p => p.id === patientId);
    return patient?.name || "Unknown Patient";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-red-50 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getAlertIcon = (severity: string) => {
    const iconProps = {
      className: `w-4 h-4 ${
        severity === "critical" || severity === "high" 
          ? "text-red-500" 
          : severity === "medium" 
            ? "text-yellow-500" 
            : "text-blue-500"
      }`
    };
    return <AlertTriangle {...iconProps} />;
  };

  return (
    <Card className="border-clinical-gray-200 shadow-sm" data-testid="risk-alerts-card">
      <CardHeader className="border-b border-clinical-gray-200 pb-4">
        <CardTitle className="font-semibold text-clinical-gray-900 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
          Risk Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {!alerts || alerts.length === 0 ? (
          <div className="text-center py-6 text-clinical-gray-500" data-testid="no-alerts">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-clinical-gray-300" />
            <p className="text-sm">No active risk alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                data-testid={`risk-alert-${alert.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getAlertIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getPatientName(alert.patientId)}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getSeverityColor(alert.severity)}`}
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-700 mb-2">{alert.message}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                        {alert.riskScore && (
                          <span className="ml-2">
                            Risk Score: {alert.riskScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resolveMutation.mutate(alert.id)}
                    disabled={resolveMutation.isPending}
                    className="ml-2 p-1 h-6 w-6 text-gray-400 hover:text-gray-600"
                    data-testid={`resolve-alert-${alert.id}`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
