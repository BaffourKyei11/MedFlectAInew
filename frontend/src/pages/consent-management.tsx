import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Search, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Eye,
  FileText,
  Brain,
  Database,
  Settings
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Patient {
  id: string;
  name: string;
  mrn: string;
}

interface ConsentRecord {
  id: string;
  patientId: string;
  purpose: string;
  granted: boolean;
  grantedAt: string;
  expiresAt?: string;
  revokedAt?: string;
  blockchainHash?: string;
}

const consentPurposes = [
  { 
    id: "ai_summaries", 
    name: "AI Summary Generation", 
    description: "Allow AI to generate clinical summaries from patient data",
    icon: Brain 
  },
  { 
    id: "data_sharing", 
    name: "Data Sharing with Providers", 
    description: "Share patient data with other healthcare providers",
    icon: Database 
  },
  { 
    id: "research", 
    name: "Medical Research", 
    description: "Use anonymized data for medical research purposes",
    icon: FileText 
  },
  { 
    id: "analytics", 
    name: "Quality Analytics", 
    description: "Include data in hospital quality improvement analytics",
    icon: Eye 
  },
];

export default function ConsentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients, isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Mock consent data - in production this would come from a dedicated consent API
  const mockConsents: ConsentRecord[] = patients?.flatMap(patient => 
    consentPurposes.map(purpose => ({
      id: `${patient.id}-${purpose.id}`,
      patientId: patient.id,
      purpose: purpose.id,
      granted: Math.random() > 0.3, // Random consent status for demo
      grantedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: Math.random() > 0.5 ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      blockchainHash: Math.random() > 0.5 ? `0x${Math.random().toString(16).substring(2, 10)}` : undefined,
    }))
  ) || [];

  const updateConsentMutation = useMutation({
    mutationFn: async (data: { patientId: string; purpose: string; granted: boolean }) => {
      // In production, this would call a real API endpoint
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Consent Updated",
        description: "Patient consent preferences have been updated successfully",
      });
      // In production, invalidate the consent query
      // queryClient.invalidateQueries({ queryKey: ["/api/consents"] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update consent",
        variant: "destructive",
      });
    },
  });

  const filteredPatients = patients?.filter(patient => 
    searchTerm === "" || 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.includes(searchTerm)
  ) || [];

  const getPatientConsents = (patientId: string) => {
    return mockConsents.filter(consent => consent.patientId === patientId);
  };

  const getConsentForPurpose = (patientId: string, purpose: string) => {
    return mockConsents.find(consent => consent.patientId === patientId && consent.purpose === purpose);
  };

  const handleConsentToggle = (patientId: string, purpose: string, granted: boolean) => {
    updateConsentMutation.mutate({ patientId, purpose, granted });
  };

  const getPatientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getConsentStats = () => {
    const totalConsents = mockConsents.length;
    const grantedConsents = mockConsents.filter(c => c.granted).length;
    const activeConsents = mockConsents.filter(c => c.granted && !c.revokedAt).length;
    const blockchainRecorded = mockConsents.filter(c => c.blockchainHash).length;

    return {
      totalConsents,
      grantedConsents,
      activeConsents,
      blockchainRecorded,
      consentRate: totalConsents > 0 ? (grantedConsents / totalConsents) * 100 : 0,
    };
  };

  const stats = getConsentStats();

  return (
    <div className="p-6" data-testid="consent-management-page">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-clinical-gray-900">Consent Management</h1>
        <p className="text-clinical-gray-600 mt-1">Manage patient data consent and privacy preferences</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-clinical-gray-200" data-testid="consent-rate-stat">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-clinical-gray-600 text-sm font-medium">Consent Rate</p>
                <p className="text-2xl font-bold text-clinical-gray-900 mt-1">
                  {stats.consentRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="text-green-600 w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-clinical-gray-500 mt-2">
              {stats.grantedConsents} of {stats.totalConsents} consents granted
            </p>
          </CardContent>
        </Card>

        <Card className="border-clinical-gray-200" data-testid="active-consents-stat">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-clinical-gray-600 text-sm font-medium">Active Consents</p>
                <p className="text-2xl font-bold text-clinical-gray-900 mt-1">{stats.activeConsents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="text-blue-600 w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-clinical-gray-500 mt-2">Currently active and valid</p>
          </CardContent>
        </Card>

        <Card className="border-clinical-gray-200" data-testid="blockchain-recorded-stat">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-clinical-gray-600 text-sm font-medium">Blockchain Recorded</p>
                <p className="text-2xl font-bold text-clinical-gray-900 mt-1">{stats.blockchainRecorded}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Database className="text-purple-600 w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-clinical-gray-500 mt-2">Immutable audit trail</p>
          </CardContent>
        </Card>

        <Card className="border-clinical-gray-200" data-testid="patients-with-consent-stat">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-clinical-gray-600 text-sm font-medium">Patients Enrolled</p>
                <p className="text-2xl font-bold text-clinical-gray-900 mt-1">{patients?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-medical-teal-100 rounded-lg flex items-center justify-center">
                <User className="text-medical-teal-600 w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-clinical-gray-500 mt-2">With consent preferences</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-1">
          <Card className="border-clinical-gray-200">
            <CardHeader className="border-b border-clinical-gray-200">
              <CardTitle>Patient Consent Records</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-clinical-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-patients-consent"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {patientsLoading ? (
                <div className="space-y-4 p-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3">
                      <div className="w-10 h-10 bg-clinical-gray-200 rounded-lg animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-clinical-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-clinical-gray-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-8" data-testid="no-patients-consent">
                  <User className="w-8 h-8 mx-auto mb-2 text-clinical-gray-300" />
                  <p className="text-sm text-clinical-gray-500">No patients found</p>
                </div>
              ) : (
                <div className="divide-y divide-clinical-gray-200">
                  {filteredPatients.map((patient) => {
                    const consents = getPatientConsents(patient.id);
                    const activeConsents = consents.filter(c => c.granted).length;
                    
                    return (
                      <div
                        key={patient.id}
                        className={`p-4 hover:bg-clinical-gray-50 cursor-pointer transition-colors ${
                          selectedPatient?.id === patient.id ? "bg-medical-blue-50 border-r-4 border-medical-blue-500" : ""
                        }`}
                        onClick={() => setSelectedPatient(patient)}
                        data-testid={`patient-consent-${patient.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10 bg-medical-blue-100">
                            <AvatarFallback className="bg-medical-blue-100 text-medical-blue-600 text-sm">
                              {getPatientInitials(patient.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-clinical-gray-900 truncate">{patient.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-clinical-gray-500">MRN: {patient.mrn}</span>
                              <Badge variant="outline" className="text-xs">
                                {activeConsents}/{consents.length} consents
                              </Badge>
                            </div>
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

        {/* Consent Details */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="space-y-6">
              {/* Patient Header */}
              <Card className="border-clinical-gray-200" data-testid="selected-patient-consent">
                <CardHeader className="border-b border-clinical-gray-200">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12 bg-medical-blue-100">
                      <AvatarFallback className="bg-medical-blue-100 text-medical-blue-600">
                        {getPatientInitials(selectedPatient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedPatient.name}</CardTitle>
                      <p className="text-sm text-clinical-gray-500">MRN: {selectedPatient.mrn}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {consentPurposes.map((purpose) => {
                      const consent = getConsentForPurpose(selectedPatient.id, purpose.id);
                      const Icon = purpose.icon;
                      
                      return (
                        <div key={purpose.id} className="border border-clinical-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="w-10 h-10 bg-clinical-gray-100 rounded-lg flex items-center justify-center">
                                <Icon className="w-5 h-5 text-clinical-gray-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-clinical-gray-900">{purpose.name}</h4>
                                <p className="text-sm text-clinical-gray-600 mt-1">{purpose.description}</p>
                                
                                {consent && (
                                  <div className="flex items-center space-x-4 mt-3 text-xs text-clinical-gray-500">
                                    <div className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {consent.granted ? "Granted" : "Denied"} {formatDistanceToNow(new Date(consent.grantedAt), { addSuffix: true })}
                                    </div>
                                    {consent.blockchainHash && (
                                      <div className="flex items-center">
                                        <Shield className="w-3 h-3 mr-1" />
                                        Blockchain: {consent.blockchainHash}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Badge 
                                variant="outline" 
                                className={consent?.granted 
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                                }
                              >
                                {consent?.granted ? (
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                ) : (
                                  <XCircle className="w-3 h-3 mr-1" />
                                )}
                                {consent?.granted ? "Granted" : "Denied"}
                              </Badge>
                              
                              <Switch
                                checked={consent?.granted || false}
                                onCheckedChange={(checked) => 
                                  handleConsentToggle(selectedPatient.id, purpose.id, checked)
                                }
                                disabled={updateConsentMutation.isPending}
                                data-testid={`consent-toggle-${purpose.id}`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Consent History */}
              <Card className="border-clinical-gray-200">
                <CardHeader className="border-b border-clinical-gray-200">
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-clinical-gray-500" />
                    Consent History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {getPatientConsents(selectedPatient.id)
                      .sort((a, b) => new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime())
                      .slice(0, 5)
                      .map((consent) => {
                        const purpose = consentPurposes.find(p => p.id === consent.purpose);
                        return (
                          <div key={`${consent.id}-${consent.grantedAt}`} className="flex items-center space-x-3 text-sm">
                            <div className={`w-2 h-2 rounded-full ${consent.granted ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="flex-1">
                              {consent.granted ? "Granted" : "Denied"} consent for {purpose?.name || consent.purpose}
                            </span>
                            <span className="text-clinical-gray-500">
                              {formatDistanceToNow(new Date(consent.grantedAt), { addSuffix: true })}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-clinical-gray-200">
              <CardContent className="p-12">
                <div className="text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-clinical-gray-300" />
                  <h3 className="text-lg font-medium text-clinical-gray-900 mb-2">Select a Patient</h3>
                  <p className="text-clinical-gray-500">
                    Choose a patient from the list to view and manage their consent preferences.
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
