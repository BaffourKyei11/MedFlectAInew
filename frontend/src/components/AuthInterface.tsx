import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Database, 
  Activity, 
  Calendar, 
  CheckCircle2, 
  Clock,
  AlertTriangle,
  Loader2,
  Users,
  MapPin,
  Phone,
  Mail,
  Building2,
  Stethoscope,
  Brain,
  Globe,
  Lock,
  ArrowRight,
  FileText,
  Video
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface AuthInterfaceProps {
  onAuthComplete?: (data: any) => void;
}

export default function AuthInterface({ onAuthComplete }: AuthInterfaceProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pilot");
  const [authStep, setAuthStep] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);
  
  // Form states
  const [pilotForm, setPilotForm] = useState({
    userId: "demo-user-123", // Would come from Replit auth
    hospitalName: "",
    location: "",
    ehrSystem: "",
    numberOfBeds: "",
    contactEmail: "",
    contactPhone: "",
    ehrEndpoint: "",
    fhirBaseUrl: ""
  });

  const [callForm, setCallForm] = useState({
    userId: "demo-user-123", // Would come from Replit auth
    callType: "pilot_program",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    preferredDate: "",
    preferredTime: "",
    timezone: "GMT",
    notes: ""
  });

  const [ehrVerification, setEhrVerification] = useState({
    status: "pending", // pending, verifying, verified, failed
    message: ""
  });

  const [fhirVerification, setFhirVerification] = useState({
    status: "pending", // pending, verifying, verified, failed
    message: ""
  });

  // Mutations
  const pilotMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/auth/pilot-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Pilot program application submitted successfully",
        variant: "default",
      });
      setAuthStep(3);
      setAuthProgress(100);
      onAuthComplete?.(data);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit pilot application",
        variant: "destructive",
      });
    },
  });

  const callMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/auth/implementation-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Implementation call scheduled successfully",
        variant: "default",
      });
      setAuthStep(3);
      setAuthProgress(100);
      onAuthComplete?.(data);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to schedule implementation call",
        variant: "destructive",
      });
    },
  });

  const ehrVerificationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/auth/verify-ehr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      setEhrVerification({ status: "verified", message: data.message });
      toast({
        title: "EHR Verified",
        description: "EHR connection verified successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      setEhrVerification({ status: "failed", message: "EHR verification failed" });
      toast({
        title: "Verification Failed",
        description: "Could not verify EHR connection",
        variant: "destructive",
      });
    },
  });

  const fhirVerificationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/auth/verify-fhir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      setFhirVerification({ status: "verified", message: data.message });
      toast({
        title: "FHIR Verified",
        description: "FHIR endpoint verified successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      setFhirVerification({ status: "failed", message: "FHIR verification failed" });
      toast({
        title: "Verification Failed",
        description: "Could not verify FHIR endpoint",
        variant: "destructive",
      });
    },
  });

  const handleReplitAuth = async () => {
    setAuthStep(1);
    setAuthProgress(25);
    
    // Mock Replit authentication process
    setTimeout(() => {
      setIsAuthenticated(true);
      setAuthStep(2);
      setAuthProgress(75);
      toast({
        title: "Authentication Successful",
        description: "Welcome to MEDFLECT AI pilot program",
        variant: "default",
      });
    }, 2000);
  };

  const handleEhrVerification = () => {
    if (!pilotForm.ehrEndpoint) {
      toast({
        title: "Missing Information",
        description: "Please provide EHR endpoint",
        variant: "destructive",
      });
      return;
    }

    setEhrVerification({ status: "verifying", message: "Verifying EHR connection..." });
    ehrVerificationMutation.mutate({
      ehrEndpoint: pilotForm.ehrEndpoint,
      clientId: "demo-client-id",
      clientSecret: "demo-secret"
    });
  };

  const handleFhirVerification = () => {
    if (!pilotForm.fhirBaseUrl) {
      toast({
        title: "Missing Information",
        description: "Please provide FHIR base URL",
        variant: "destructive",
      });
      return;
    }

    setFhirVerification({ status: "verifying", message: "Verifying FHIR endpoint..." });
    fhirVerificationMutation.mutate({
      fhirBaseUrl: pilotForm.fhirBaseUrl,
      apiKey: "demo-api-key"
    });
  };

  const handlePilotSubmit = () => {
    if (!pilotForm.hospitalName || !pilotForm.location || !pilotForm.contactEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    pilotMutation.mutate({
      ...pilotForm,
      numberOfBeds: pilotForm.numberOfBeds ? parseInt(pilotForm.numberOfBeds) : undefined
    });
  };

  const handleCallSubmit = () => {
    if (!callForm.contactName || !callForm.contactEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    callMutation.mutate(callForm);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "verifying":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  if (authStep === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MEDFLECT AI Authentication</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Secure access to Ghana's leading healthcare data analytics platform. 
            Join our pilot program or schedule an implementation call.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("pilot")}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Start Ghana Pilot Program</CardTitle>
                  <CardDescription>Join hospitals like Korle-Bu Teaching Hospital</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>AI-powered clinical summaries</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>FHIR-compliant data integration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Blockchain consent management</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("call")}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Video className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Schedule Implementation Call</CardTitle>
                  <CardDescription>Discuss deployment and integration</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Technical architecture review</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>EHR integration planning</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Deployment timeline</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center pt-6">
          <Button 
            size="lg" 
            onClick={handleReplitAuth}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="button-start-auth"
          >
            <Shield className="mr-2 h-5 w-5" />
            Authenticate with Replit
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Secure authentication powered by Replit OpenID Connect
          </p>
        </div>
      </div>
    );
  }

  if (authStep === 1) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-6">
        <div className="space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Authenticating...</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Connecting to Replit authentication server
          </p>
          <Progress value={authProgress} className="w-full" />
        </div>
      </div>
    );
  }

  if (authStep === 2) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Authentication Complete</h1>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Authenticated as: demo-user@hospital.gh
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pilot" data-testid="tab-pilot">Pilot Program</TabsTrigger>
            <TabsTrigger value="call" data-testid="tab-call">Implementation Call</TabsTrigger>
          </TabsList>

          <TabsContent value="pilot" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  <span>Hospital Information</span>
                </CardTitle>
                <CardDescription>
                  Basic information about your healthcare facility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hospital-name">Hospital Name *</Label>
                    <Input
                      id="hospital-name"
                      placeholder="e.g., Korle-Bu Teaching Hospital"
                      value={pilotForm.hospitalName}
                      onChange={(e) => setPilotForm({ ...pilotForm, hospitalName: e.target.value })}
                      data-testid="input-hospital-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Accra, Ghana"
                      value={pilotForm.location}
                      onChange={(e) => setPilotForm({ ...pilotForm, location: e.target.value })}
                      data-testid="input-location"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ehr-system">EHR System</Label>
                    <Select value={pilotForm.ehrSystem} onValueChange={(value) => setPilotForm({ ...pilotForm, ehrSystem: value })}>
                      <SelectTrigger data-testid="select-ehr-system">
                        <SelectValue placeholder="Select EHR system" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="epic">Epic</SelectItem>
                        <SelectItem value="cerner">Cerner</SelectItem>
                        <SelectItem value="allscripts">Allscripts</SelectItem>
                        <SelectItem value="openmrs">OpenMRS</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="beds">Number of Beds</Label>
                    <Input
                      id="beds"
                      type="number"
                      placeholder="e.g., 450"
                      value={pilotForm.numberOfBeds}
                      onChange={(e) => setPilotForm({ ...pilotForm, numberOfBeds: e.target.value })}
                      data-testid="input-beds"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-green-600" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Contact Email *</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="admin@hospital.gh"
                      value={pilotForm.contactEmail}
                      onChange={(e) => setPilotForm({ ...pilotForm, contactEmail: e.target.value })}
                      data-testid="input-contact-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Contact Phone</Label>
                    <Input
                      id="contact-phone"
                      placeholder="+233-20-123-4567"
                      value={pilotForm.contactPhone}
                      onChange={(e) => setPilotForm({ ...pilotForm, contactPhone: e.target.value })}
                      data-testid="input-contact-phone"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-6 w-6 text-purple-600" />
                  <span>Technical Integration</span>
                </CardTitle>
                <CardDescription>
                  FHIR and EHR endpoint configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ehr-endpoint">EHR Endpoint</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="ehr-endpoint"
                        placeholder="https://your-ehr.hospital.gh/api"
                        value={pilotForm.ehrEndpoint}
                        onChange={(e) => setPilotForm({ ...pilotForm, ehrEndpoint: e.target.value })}
                        data-testid="input-ehr-endpoint"
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleEhrVerification}
                        disabled={ehrVerificationMutation.isPending}
                        data-testid="button-verify-ehr"
                      >
                        {getStatusIcon(ehrVerification.status)}
                        Verify
                      </Button>
                    </div>
                    {ehrVerification.message && (
                      <p className={`text-sm ${ehrVerification.status === 'verified' ? 'text-green-600' : 'text-red-600'}`}>
                        {ehrVerification.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fhir-url">FHIR Base URL</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="fhir-url"
                        placeholder="https://your-fhir.hospital.gh/fhir"
                        value={pilotForm.fhirBaseUrl}
                        onChange={(e) => setPilotForm({ ...pilotForm, fhirBaseUrl: e.target.value })}
                        data-testid="input-fhir-url"
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleFhirVerification}
                        disabled={fhirVerificationMutation.isPending}
                        data-testid="button-verify-fhir"
                      >
                        {getStatusIcon(fhirVerification.status)}
                        Verify
                      </Button>
                    </div>
                    {fhirVerification.message && (
                      <p className={`text-sm ${fhirVerification.status === 'verified' ? 'text-green-600' : 'text-red-600'}`}>
                        {fhirVerification.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                size="lg" 
                onClick={handlePilotSubmit}
                disabled={pilotMutation.isPending}
                className="px-8"
                data-testid="button-submit-pilot"
              >
                {pilotMutation.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-5 w-5" />
                )}
                Submit Application
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="call" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <span>Schedule Implementation Call</span>
                </CardTitle>
                <CardDescription>
                  Book a consultation with our technical team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="call-type">Call Type</Label>
                    <Select value={callForm.callType} onValueChange={(value) => setCallForm({ ...callForm, callType: value })}>
                      <SelectTrigger data-testid="select-call-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pilot_program">Pilot Program Discussion</SelectItem>
                        <SelectItem value="implementation_call">Implementation Planning</SelectItem>
                        <SelectItem value="technical_demo">Technical Demo</SelectItem>
                        <SelectItem value="integration_support">Integration Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Contact Name *</Label>
                    <Input
                      id="contact-name"
                      placeholder="Dr. John Asante"
                      value={callForm.contactName}
                      onChange={(e) => setCallForm({ ...callForm, contactName: e.target.value })}
                      data-testid="input-contact-name"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="call-email">Email *</Label>
                    <Input
                      id="call-email"
                      type="email"
                      placeholder="dr.asante@hospital.gh"
                      value={callForm.contactEmail}
                      onChange={(e) => setCallForm({ ...callForm, contactEmail: e.target.value })}
                      data-testid="input-call-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="call-phone">Phone</Label>
                    <Input
                      id="call-phone"
                      placeholder="+233-20-123-4567"
                      value={callForm.contactPhone}
                      onChange={(e) => setCallForm({ ...callForm, contactPhone: e.target.value })}
                      data-testid="input-call-phone"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferred-date">Preferred Date</Label>
                    <Input
                      id="preferred-date"
                      type="date"
                      value={callForm.preferredDate}
                      onChange={(e) => setCallForm({ ...callForm, preferredDate: e.target.value })}
                      data-testid="input-preferred-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred-time">Preferred Time</Label>
                    <Input
                      id="preferred-time"
                      type="time"
                      value={callForm.preferredTime}
                      onChange={(e) => setCallForm({ ...callForm, preferredTime: e.target.value })}
                      data-testid="input-preferred-time"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={callForm.timezone} onValueChange={(value) => setCallForm({ ...callForm, timezone: value })}>
                      <SelectTrigger data-testid="select-timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GMT">GMT (Ghana)</SelectItem>
                        <SelectItem value="WAT">WAT (Nigeria)</SelectItem>
                        <SelectItem value="CAT">CAT (South Africa)</SelectItem>
                        <SelectItem value="EAT">EAT (Kenya)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Please describe your specific requirements or questions..."
                    value={callForm.notes}
                    onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })}
                    data-testid="textarea-notes"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                size="lg" 
                onClick={handleCallSubmit}
                disabled={callMutation.isPending}
                className="px-8"
                data-testid="button-schedule-call"
              >
                {callMutation.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Calendar className="mr-2 h-5 w-5" />
                )}
                Schedule Call
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (authStep === 3) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-6">
        <div className="space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Success!</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {activeTab === "pilot" 
              ? "Your pilot program application has been submitted successfully. Our team will review it and contact you within 24 hours."
              : "Your implementation call has been scheduled. You'll receive a calendar invitation with meeting details."
            }
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Next Steps:</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Technical review of your application</li>
              <li>• Integration planning session</li>
              <li>• Pilot deployment setup</li>
              <li>• Training and onboarding</li>
            </ul>
          </div>

          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            data-testid="button-return-home"
          >
            Return to Demo
          </Button>
        </div>
      </div>
    );
  }

  return null;
}