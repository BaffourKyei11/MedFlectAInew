import { useFHIRStatus } from "@/hooks/use-fhir-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Clock,
  Activity
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function FHIRStatus() {
  const { data: fhirStatus } = useFHIRStatus();

  return (
    <div className="space-y-6">
      {/* FHIR Integration Status */}
      <Card className="border-clinical-gray-200 shadow-sm" data-testid="fhir-integration-card">
        <CardHeader className="border-b border-clinical-gray-200 pb-4">
          <CardTitle className="font-semibold text-clinical-gray-900 flex items-center">
            <Database className="w-5 h-5 mr-2 text-medical-blue-500" />
            FHIR Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {!fhirStatus ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-clinical-gray-600">Connection Status</span>
                <Badge variant="secondary">
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Checking...
                </Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-clinical-gray-600">Connection</span>
                <Badge 
                  variant={fhirStatus.connection.connected ? "secondary" : "destructive"}
                  className={fhirStatus.connection.connected 
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                  }
                >
                  {fhirStatus.connection.connected ? (
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                  ) : (
                    <AlertCircle className="w-3 h-3 mr-1" />
                  )}
                  {fhirStatus.connection.connected ? "Connected" : "Disconnected"}
                  {fhirStatus.connection.latency && (
                    <span className="ml-1">{fhirStatus.connection.latency}ms</span>
                  )}
                </Badge>
              </div>

              {/* Data Sync Statistics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-clinical-gray-600">Patient Records</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-green-600">
                      {fhirStatus.sync.patients.synced.toLocaleString()} synced
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-clinical-gray-600">Observations</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-green-600">
                      {fhirStatus.sync.observations.synced.toLocaleString()} synced
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-clinical-gray-600">Encounters</span>
                  <div className="flex items-center space-x-2">
                    {fhirStatus.sync.encounters.pending > 0 ? (
                      <>
                        <span className="text-sm font-mono text-blue-600">
                          {fhirStatus.sync.encounters.pending} pending
                        </span>
                        <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-mono text-green-600">
                          {fhirStatus.sync.encounters.synced} synced
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </>
                    )}
                  </div>
                </div>

                {/* Sync Progress for pending items */}
                {fhirStatus.sync.encounters.pending > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-clinical-gray-500">
                      <span>Sync Progress</span>
                      <span>
                        {fhirStatus.sync.encounters.synced} / {fhirStatus.sync.encounters.total}
                      </span>
                    </div>
                    <Progress 
                      value={(fhirStatus.sync.encounters.synced / fhirStatus.sync.encounters.total) * 100}
                      className="h-2"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-clinical-gray-200">
                <div className="flex items-center text-xs text-clinical-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  Last sync: {formatDistanceToNow(new Date(fhirStatus.sync.lastSync), { addSuffix: true })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blockchain Audit Summary */}
      <Card className="border-clinical-gray-200 shadow-sm" data-testid="audit-summary-card">
        <CardHeader className="border-b border-clinical-gray-200 pb-4">
          <CardTitle className="font-semibold text-clinical-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-500" />
            Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-clinical-gray-600">Today's Access Events</span>
              <span className="text-sm font-mono text-clinical-gray-900">156</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-clinical-gray-600">Consent Tokens Active</span>
              <span className="text-sm font-mono text-green-600">98%</span>
            </div>
            <div className="pt-2 border-t border-clinical-gray-200">
              <button className="text-xs text-medical-blue-600 hover:text-medical-blue-800 transition-colors">
                View detailed audit log →
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
