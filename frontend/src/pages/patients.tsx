import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin,
  FileText,
  Brain,
  AlertTriangle
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface Patient {
  id: string;
  mrn: string;
  name: string;
  dateOfBirth?: string;
  gender?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  fhirId?: string;
  createdAt: string;
  updatedAt: string;
}

interface ClinicalSummary {
  id: string;
  patientId: string;
  type: string;
  createdAt: string;
}

interface RiskAlert {
  id: string;
  patientId: string;
  type: string;
  severity: string;
  message: string;
  resolved: boolean;
}

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: riskAlerts } = useQuery<RiskAlert[]>({
    queryKey: ["/api/risk-alerts"],
  });

  // Filter patients based on search
  const filteredPatients = patients?.filter(patient => 
    searchTerm === "" || 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.includes(searchTerm)
  ) || [];

  const getPatientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "Unknown";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getPatientAlerts = (patientId: string) => {
    return riskAlerts?.filter(alert => alert.patientId === patientId && !alert.resolved) || [];
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

  return (
    <div className="p-6" data-testid="patients-page">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-clinical-gray-900">Patient Records</h1>
        <p className="text-clinical-gray-600 mt-1">Manage patient information and medical records</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-2">
          <Card className="border-clinical-gray-200">
            <CardHeader className="border-b border-clinical-gray-200">
              <CardTitle className="flex items-center justify-between">
                <span>All Patients</span>
                <Badge variant="secondary" className="text-sm">
                  {filteredPatients.length} patients
                </Badge>
              </CardTitle>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-clinical-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or MRN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-patients"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-4 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3">
                      <div className="w-12 h-12 bg-clinical-gray-200 rounded-lg animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-clinical-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-clinical-gray-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-12" data-testid="no-patients">
                  <User className="w-12 h-12 mx-auto mb-4 text-clinical-gray-300" />
                  <h3 className="text-lg font-medium text-clinical-gray-900 mb-2">No Patients Found</h3>
                  <p className="text-clinical-gray-500">
                    {searchTerm
                      ? "No patients match your search criteria."
                      : "No patients have been registered yet."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-clinical-gray-200">
                  {filteredPatients.map((patient) => {
                    const alerts = getPatientAlerts(patient.id);
                    const hasHighPriorityAlert = alerts.some(alert => 
                      alert.severity === "critical" || alert.severity === "high"
                    );
                    
                    return (
                      <div
                        key={patient.id}
                        className={`p-4 hover:bg-clinical-gray-50 cursor-pointer transition-colors ${
                          selectedPatient?.id === patient.id ? "bg-medical-blue-50 border-r-4 border-medical-blue-500" : ""
                        }`}
                        onClick={() => setSelectedPatient(patient)}
                        data-testid={`patient-${patient.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12 bg-medical-blue-100">
                            <AvatarFallback className="bg-medical-blue-100 text-medical-blue-600 font-medium">
                              {getPatientInitials(patient.name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-clinical-gray-900 truncate">
                                {patient.name}
                              </h3>
                              {hasHighPriorityAlert && (
                                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                              )}
                              {alerts.length > 0 && (
                                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                  {alerts.length} alert{alerts.length > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-clinical-gray-500">
                              <span>MRN: {patient.mrn}</span>
                              {patient.dateOfBirth && (
                                <span>{getAge(patient.dateOfBirth)} years old</span>
                              )}
                              {patient.gender && (
                                <span className="capitalize">{patient.gender}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {patient.fhirId && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                FHIR Synced
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Patient Details */}
        <div className="space-y-6">
          {selectedPatient ? (
            <>
              {/* Patient Information */}
              <Card className="border-clinical-gray-200" data-testid="patient-details">
                <CardHeader className="border-b border-clinical-gray-200">
                  <CardTitle className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 bg-medical-blue-100">
                      <AvatarFallback className="bg-medical-blue-100 text-medical-blue-600">
                        {getPatientInitials(selectedPatient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-clinical-gray-900">{selectedPatient.name}</h3>
                      <p className="text-sm text-clinical-gray-500">MRN: {selectedPatient.mrn}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Basic Information */}
                    <div className="space-y-3">
                      {selectedPatient.dateOfBirth && (
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-clinical-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-clinical-gray-900">Date of Birth</p>
                            <p className="text-sm text-clinical-gray-600">
                              {format(new Date(selectedPatient.dateOfBirth), 'MMM dd, yyyy')} 
                              <span className="ml-2">({getAge(selectedPatient.dateOfBirth)} years old)</span>
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {selectedPatient.gender && (
                        <div className="flex items-center space-x-3">
                          <User className="w-4 h-4 text-clinical-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-clinical-gray-900">Gender</p>
                            <p className="text-sm text-clinical-gray-600 capitalize">{selectedPatient.gender}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Contact Information */}
                    {selectedPatient.contactInfo && (
                      <div className="pt-4 border-t border-clinical-gray-200">
                        <h4 className="text-sm font-medium text-clinical-gray-900 mb-3">Contact Information</h4>
                        <div className="space-y-3">
                          {selectedPatient.contactInfo.phone && (
                            <div className="flex items-center space-x-3">
                              <Phone className="w-4 h-4 text-clinical-gray-400" />
                              <span className="text-sm text-clinical-gray-600">{selectedPatient.contactInfo.phone}</span>
                            </div>
                          )}
                          
                          {selectedPatient.contactInfo.email && (
                            <div className="flex items-center space-x-3">
                              <Mail className="w-4 h-4 text-clinical-gray-400" />
                              <span className="text-sm text-clinical-gray-600">{selectedPatient.contactInfo.email}</span>
                            </div>
                          )}
                          
                          {selectedPatient.contactInfo.address && (
                            <div className="flex items-center space-x-3">
                              <MapPin className="w-4 h-4 text-clinical-gray-400" />
                              <span className="text-sm text-clinical-gray-600">{selectedPatient.contactInfo.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* System Information */}
                    <div className="pt-4 border-t border-clinical-gray-200">
                      <h4 className="text-sm font-medium text-clinical-gray-900 mb-3">System Information</h4>
                      <div className="space-y-2 text-xs text-clinical-gray-500">
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span>{formatDistanceToNow(new Date(selectedPatient.createdAt), { addSuffix: true })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Updated:</span>
                          <span>{formatDistanceToNow(new Date(selectedPatient.updatedAt), { addSuffix: true })}</span>
                        </div>
                        {selectedPatient.fhirId && (
                          <div className="flex justify-between">
                            <span>FHIR ID:</span>
                            <span className="font-mono">{selectedPatient.fhirId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Alerts */}
              {getPatientAlerts(selectedPatient.id).length > 0 && (
                <Card className="border-clinical-gray-200">
                  <CardHeader className="border-b border-clinical-gray-200">
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <span>Active Risk Alerts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {getPatientAlerts(selectedPatient.id).map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium capitalize">{alert.type}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getSeverityColor(alert.severity)}`}
                            >
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="border-clinical-gray-200">
                <CardHeader className="border-b border-clinical-gray-200">
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      data-testid="view-summaries-button"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Clinical Summaries
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      data-testid="generate-summary-button"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Generate AI Summary
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-clinical-gray-200">
              <CardContent className="p-12">
                <div className="text-center">
                  <User className="w-12 h-12 mx-auto mb-4 text-clinical-gray-300" />
                  <h3 className="text-lg font-medium text-clinical-gray-900 mb-2">Select a Patient</h3>
                  <p className="text-clinical-gray-500">
                    Choose a patient from the list to view their detailed information and medical records.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
