import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronRight, ChevronLeft, Shield, Zap, CheckCircle, AlertCircle, Plus, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Schema for EHR connection form
const ehrConnectionSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  ehrVendor: z.enum(['epic', 'cerner', 'allscripts', 'athenahealth', 'other']),
  fhirBaseUrl: z.string().url('Must be a valid URL'),
  clientType: z.enum(['system', 'smart']),
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().optional(),
  authorizationUrl: z.string().url().optional(),
  tokenUrl: z.string().url('Token URL is required'),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
  testPatientId: z.string().optional(),
  webhookEndpoint: z.string().url().optional(),
  hospitalId: z.string().default('default')
});

type EhrConnectionForm = z.infer<typeof ehrConnectionSchema>;

const vendorConfigs = {
  epic: {
    name: 'Epic',
    defaultScopes: ['system/Patient.read', 'system/Observation.read'],
    authUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
    tokenUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token'
  },
  cerner: {
    name: 'Cerner',
    defaultScopes: ['system/Patient.read', 'system/Observation.read'],
    authUrl: 'https://authorization.cerner.com/tenants/{tenant}/protocols/oauth2/profiles/smart-v1/authorize',
    tokenUrl: 'https://authorization.cerner.com/tenants/{tenant}/protocols/oauth2/profiles/smart-v1/token'
  },
  allscripts: {
    name: 'Allscripts',
    defaultScopes: ['system/Patient.read', 'system/Observation.read'],
    authUrl: 'https://oauth.allscriptsunity.com/oauth/authorize',
    tokenUrl: 'https://oauth.allscriptsunity.com/oauth/token'
  },
  athenahealth: {
    name: 'athenahealth',
    defaultScopes: ['system/Patient.read', 'system/Observation.read'],
    authUrl: 'https://api.athenahealth.com/oauth2/v1/authorize',
    tokenUrl: 'https://api.athenahealth.com/oauth2/v1/token'
  },
  other: {
    name: 'Other',
    defaultScopes: ['system/Patient.read'],
    authUrl: '',
    tokenUrl: ''
  }
};

// Wizard steps
const steps = [
  { id: 1, title: 'Basic Information', description: 'EHR vendor and site details' },
  { id: 2, title: 'FHIR Configuration', description: 'Endpoint and authentication settings' },
  { id: 3, title: 'Validation & Testing', description: 'Test connection and validate setup' },
  { id: 4, title: 'Review & Confirm', description: 'Review settings and save connection' }
];

export default function EhrConnections() {
  const [activeTab, setActiveTab] = useState('wizard');
  const [currentStep, setCurrentStep] = useState(1);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [curlSnippets, setCurlSnippets] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<EhrConnectionForm>({
    resolver: zodResolver(ehrConnectionSchema),
    defaultValues: {
      siteName: '',
      ehrVendor: 'epic',
      fhirBaseUrl: '',
      clientType: 'system',
      clientId: '',
      clientSecret: '',
      authorizationUrl: '',
      tokenUrl: '',
      scopes: [],
      testPatientId: '',
      webhookEndpoint: '',
      hospitalId: 'default'
    }
  });

  // Fetch existing connections
  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['/api/connections'],
    queryFn: async () => {
      const response = await fetch('/api/connections');
      if (!response.ok) throw new Error('Failed to fetch connections');
      return response.json();
    }
  });

  // Validation mutation
  const validateMutation = useMutation({
    mutationFn: async (data: EhrConnectionForm) => {
      const response = await fetch('/api/connections/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Validation failed');
      return response.json();
    },
    onSuccess: (data) => {
      setValidationResults(data.validationResults);
      setCurlSnippets(data.curlSnippets);
      toast({
        title: 'Validation Complete',
        description: 'Connection validation results are ready for review.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Validation Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Create connection mutation
  const createMutation = useMutation({
    mutationFn: async (data: EhrConnectionForm) => {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create connection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/connections'] });
      toast({
        title: 'Connection Created',
        description: 'EHR connection has been successfully configured.'
      });
      // Reset wizard
      setCurrentStep(1);
      setValidationResults(null);
      setCurlSnippets(null);
      form.reset();
      setActiveTab('manage');
    },
    onError: (error: any) => {
      toast({
        title: 'Creation Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Watch vendor selection to auto-populate fields
  const selectedVendor = form.watch('ehrVendor');
  const clientType = form.watch('clientType');

  // Auto-populate vendor-specific fields
  const handleVendorChange = (vendor: keyof typeof vendorConfigs) => {
    const config = vendorConfigs[vendor];
    form.setValue('scopes', config.defaultScopes);
    if (vendor !== 'other') {
      form.setValue('authorizationUrl', config.authUrl);
      form.setValue('tokenUrl', config.tokenUrl);
    }
  };

  const nextStep = async () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = await form.trigger(['siteName', 'ehrVendor']);
        break;
      case 2:
        isValid = await form.trigger(['fhirBaseUrl', 'clientType', 'clientId', 'tokenUrl', 'scopes']);
        break;
      case 3:
        isValid = validationResults !== null;
        break;
      default:
        isValid = true;
    }

    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleValidation = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsValidating(true);
    const formData = form.getValues();
    await validateMutation.mutateAsync(formData);
    setIsValidating(false);
  };

  const handleSubmit = async (data: EhrConnectionForm) => {
    await createMutation.mutateAsync(data);
  };

  const getValidationIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getValidationColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="ehr-connections-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-clinical-navy" data-testid="page-title">
            EHR Connections
          </h1>
          <p className="text-clinical-gray-600 mt-2">
            Configure secure connections to Electronic Health Record systems
          </p>
        </div>
        <Button 
          onClick={() => setActiveTab('wizard')}
          className="bg-clinical-blue hover:bg-clinical-blue/90"
          data-testid="button-new-connection"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Connection
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wizard" data-testid="tab-wizard">
            Connection Wizard
          </TabsTrigger>
          <TabsTrigger value="manage" data-testid="tab-manage">
            Manage Connections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wizard" className="space-y-6">
          {/* Progress Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Step {currentStep} of 4</h3>
                <span className="text-sm text-clinical-gray-600">
                  {Math.round((currentStep / 4) * 100)}% Complete
                </span>
              </div>
              <Progress value={(currentStep / 4) * 100} className="mb-4" />
              <div className="flex justify-between text-sm">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center ${
                      step.id === currentStep ? 'text-clinical-blue' : 
                      step.id < currentStep ? 'text-green-600' : 'text-clinical-gray-400'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                        step.id === currentStep ? 'bg-clinical-blue text-white' :
                        step.id < currentStep ? 'bg-green-600 text-white' : 'bg-clinical-gray-200'
                      }`}
                    >
                      {step.id < currentStep ? <CheckCircle className="h-4 w-4" /> : step.id}
                    </div>
                    <span className="font-medium">{step.title}</span>
                    <span className="text-xs text-center">{step.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-clinical-blue" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Enter your healthcare organization and EHR vendor details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site/Hospital Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="General Hospital of Accra" 
                              {...field}
                              data-testid="input-site-name"
                            />
                          </FormControl>
                          <FormDescription>
                            The official name of your healthcare facility
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ehrVendor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>EHR Vendor</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleVendorChange(value as keyof typeof vendorConfigs);
                            }} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-ehr-vendor">
                                <SelectValue placeholder="Select your EHR vendor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(vendorConfigs).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  {config.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select your Electronic Health Record system vendor
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Step 2: FHIR Configuration */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-clinical-blue" />
                      FHIR Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure FHIR endpoint and authentication details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fhirBaseUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>FHIR Base URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4" 
                              {...field}
                              data-testid="input-fhir-url"
                            />
                          </FormControl>
                          <FormDescription>
                            The base URL for your FHIR R4 endpoint
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clientType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-client-type">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="system">System/M2M (Backend Services)</SelectItem>
                              <SelectItem value="smart">SMART on FHIR (User Authentication)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {clientType === 'system' 
                              ? 'Machine-to-machine authentication for backend systems'
                              : 'User-interactive authentication flow'
                            }
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client ID</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="your-client-id" 
                                {...field}
                                data-testid="input-client-id"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {clientType === 'system' && (
                        <FormField
                          control={form.control}
                          name="clientSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client Secret</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="your-client-secret" 
                                  {...field}
                                  data-testid="input-client-secret"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {clientType === 'smart' && (
                        <FormField
                          control={form.control}
                          name="authorizationUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Authorization URL</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://..." 
                                  {...field}
                                  data-testid="input-auth-url"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="tokenUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Token URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://..." 
                                {...field}
                                data-testid="input-token-url"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="scopes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>FHIR Scopes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="system/Patient.read&#10;system/Observation.read"
                              value={field.value.join('\n')}
                              onChange={(e) => field.onChange(e.target.value.split('\n').filter(Boolean))}
                              rows={4}
                              data-testid="textarea-scopes"
                            />
                          </FormControl>
                          <FormDescription>
                            Enter one scope per line. These determine what FHIR resources can be accessed.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="testPatientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Test Patient ID (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="eJO5pJL1Ts0Vv2Y7bM2Sjg3" 
                                {...field}
                                data-testid="input-test-patient"
                              />
                            </FormControl>
                            <FormDescription>
                              A valid patient ID for testing the connection
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="webhookEndpoint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Webhook Endpoint (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://yourapp.replit.app/api/webhooks/fhir" 
                                {...field}
                                data-testid="input-webhook-url"
                              />
                            </FormControl>
                            <FormDescription>
                              Endpoint to receive FHIR subscription notifications
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Validation */}
              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-clinical-blue" />
                      Connection Validation
                    </CardTitle>
                    <CardDescription>
                      Test your EHR connection and validate configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!validationResults && (
                      <div className="text-center py-8">
                        <Button 
                          onClick={handleValidation}
                          disabled={isValidating}
                          size="lg"
                          className="bg-clinical-blue hover:bg-clinical-blue/90"
                          data-testid="button-validate-connection"
                        >
                          {isValidating ? 'Validating...' : 'Validate Connection'}
                        </Button>
                        <p className="text-sm text-clinical-gray-600 mt-2">
                          Click to test FHIR endpoint, authentication, and permissions
                        </p>
                      </div>
                    )}

                    {validationResults && (
                      <div className="space-y-4">
                        <h4 className="font-semibold">Validation Results</h4>
                        
                        {/* Capability Statement Test */}
                        <div className={`p-4 border rounded-lg ${getValidationColor(validationResults.capability.status)}`}>
                          <div className="flex items-center gap-2 mb-2">
                            {getValidationIcon(validationResults.capability.status)}
                            <span className="font-medium">FHIR Capability Statement</span>
                            <Badge variant={validationResults.capability.status === 'success' ? 'default' : 'destructive'}>
                              {validationResults.capability.status}
                            </Badge>
                          </div>
                          <p className="text-sm">{validationResults.capability.message}</p>
                          {validationResults.capability.version && (
                            <p className="text-xs text-clinical-gray-600 mt-1">
                              FHIR Version: {validationResults.capability.version}
                            </p>
                          )}
                        </div>

                        {/* OAuth Test */}
                        <div className={`p-4 border rounded-lg ${getValidationColor(validationResults.oauth.status)}`}>
                          <div className="flex items-center gap-2 mb-2">
                            {getValidationIcon(validationResults.oauth.status)}
                            <span className="font-medium">OAuth Authentication</span>
                            <Badge variant={validationResults.oauth.status === 'success' ? 'default' : 'destructive'}>
                              {validationResults.oauth.status}
                            </Badge>
                          </div>
                          <p className="text-sm">{validationResults.oauth.message}</p>
                        </div>

                        {/* Test Patient */}
                        {validationResults.testPatient && (
                          <div className={`p-4 border rounded-lg ${getValidationColor(validationResults.testPatient.status)}`}>
                            <div className="flex items-center gap-2 mb-2">
                              {getValidationIcon(validationResults.testPatient.status)}
                              <span className="font-medium">Test Patient Fetch</span>
                              <Badge variant={validationResults.testPatient.status === 'success' ? 'default' : 'destructive'}>
                                {validationResults.testPatient.status}
                              </Badge>
                            </div>
                            <p className="text-sm">{validationResults.testPatient.message}</p>
                          </div>
                        )}

                        {/* Subscription Test */}
                        {validationResults.subscription && (
                          <div className={`p-4 border rounded-lg ${getValidationColor(validationResults.subscription.status)}`}>
                            <div className="flex items-center gap-2 mb-2">
                              {getValidationIcon(validationResults.subscription.status)}
                              <span className="font-medium">Webhook Subscription</span>
                              <Badge variant={validationResults.subscription.status === 'success' ? 'default' : 'destructive'}>
                                {validationResults.subscription.status}
                              </Badge>
                            </div>
                            <p className="text-sm">{validationResults.subscription.message}</p>
                          </div>
                        )}

                        {/* cURL Snippets */}
                        {curlSnippets && (
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <Button variant="outline" className="w-full">
                                View cURL Test Commands
                                <ChevronRight className="h-4 w-4 ml-auto" />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-4 mt-4">
                              {Object.entries(curlSnippets).map(([key, snippet]) => (
                                <div key={key} className="space-y-2">
                                  <h5 className="font-medium capitalize">{key} Test</h5>
                                  <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm overflow-x-auto">
                                    {snippet as string}
                                  </div>
                                </div>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        )}

                        <Button 
                          onClick={handleValidation}
                          variant="outline"
                          disabled={isValidating}
                          data-testid="button-revalidate"
                        >
                          Re-validate Connection
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Review & Confirm */}
              {currentStep === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Review & Confirm</CardTitle>
                    <CardDescription>
                      Review your configuration and save the EHR connection
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Basic Information</h4>
                        <dl className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-clinical-gray-600">Site Name:</dt>
                            <dd className="font-medium">{form.watch('siteName')}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-clinical-gray-600">EHR Vendor:</dt>
                            <dd className="font-medium">{vendorConfigs[form.watch('ehrVendor')].name}</dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">FHIR Configuration</h4>
                        <dl className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-clinical-gray-600">Base URL:</dt>
                            <dd className="font-medium truncate">{form.watch('fhirBaseUrl')}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-clinical-gray-600">Client Type:</dt>
                            <dd className="font-medium">{form.watch('clientType')}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-clinical-gray-600">Scopes:</dt>
                            <dd className="font-medium">{form.watch('scopes').length} configured</dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    {validationResults && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Connection validation completed successfully. Ready to save configuration.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="bg-clinical-blue hover:bg-clinical-blue/90"
                        data-testid="button-save-connection"
                      >
                        {createMutation.isPending ? 'Saving...' : 'Save Connection'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
                        Back to Validation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  data-testid="button-previous-step"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentStep < 4 && (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-clinical-blue hover:bg-clinical-blue/90"
                    data-testid="button-next-step"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Existing Connections</CardTitle>
              <CardDescription>
                Manage your configured EHR connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading connections...</div>
              ) : connections.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-clinical-gray-600 mb-4">No EHR connections configured yet.</p>
                  <Button 
                    onClick={() => setActiveTab('wizard')}
                    className="bg-clinical-blue hover:bg-clinical-blue/90"
                  >
                    Create First Connection
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {connections.map((connection: any) => (
                    <Card key={connection.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{connection.siteName}</h4>
                          <p className="text-sm text-clinical-gray-600">
                            {vendorConfigs[connection.ehrVendor as keyof typeof vendorConfigs]?.name} • 
                            {connection.clientType} • 
                            {connection.scopes.length} scopes
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={connection.status === 'active' ? 'default' : 'secondary'}
                          >
                            {connection.status || 'active'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Configure
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}