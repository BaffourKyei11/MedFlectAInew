import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Database, 
  TrendingUp, 
  Activity, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  BarChart3,
  Search,
  Zap,
  Target,
  Shield,
  FileText,
  MessageSquare,
  ArrowRight,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export default function Demo() {
  const [activeDemo, setActiveDemo] = useState("integration");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);
  const [nlpQuery, setNlpQuery] = useState("");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [realTimeData, setRealTimeData] = useState({
    activePatients: 2847,
    occupancyRate: 85,
    criticalAlerts: 3,
    nursesOnDuty: 180
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [integrationStep, setIntegrationStep] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState({
    ehr: 'disconnected',
    fhir: 'disconnected', 
    blockchain: 'disconnected',
    ai: 'disconnected'
  });
  const [isConnecting, setIsConnecting] = useState(false);

  // Simulated hospital data
  const hospitalData = {
    patients: 2847,
    beds: 450,
    occupancyRate: 85,
    avgLOS: 4.2,
    readmissionRate: 12.3,
    staffUtilization: 92,
    departments: ['Emergency', 'ICU', 'Surgery', 'Cardiology', 'Orthopedics']
  };

  const admissionTrends = [
    { month: 'Jan', admissions: 850, discharges: 820, readmissions: 104 },
    { month: 'Feb', admissions: 920, discharges: 890, readmissions: 113 },
    { month: 'Mar', admissions: 1050, discharges: 1020, readmissions: 129 },
    { month: 'Apr', admissions: 980, discharges: 950, readmissions: 117 },
    { month: 'May', admissions: 1100, discharges: 1080, readmissions: 135 },
    { month: 'Jun', admissions: 1200, discharges: 1150, readmissions: 142 }
  ];

  const resourceUtilization = [
    { resource: 'ICU Beds', utilization: 95, capacity: 50 },
    { resource: 'OR Suites', utilization: 87, capacity: 12 },
    { resource: 'Emergency Bays', utilization: 78, capacity: 24 },
    { resource: 'General Beds', utilization: 82, capacity: 300 },
    { resource: 'Nursing Staff', utilization: 94, capacity: 180 }
  ];

  const patientRiskData = [
    { name: 'Low Risk', value: 65, count: 1850 },
    { name: 'Medium Risk', value: 25, count: 712 },
    { name: 'High Risk', value: 8, count: 228 },
    { name: 'Critical Risk', value: 2, count: 57 }
  ];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#7C2D12'];

  const runExploratoryAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setInsights([]);

    const steps = [
      "Scanning patient records database...",
      "Analyzing admission patterns...",
      "Identifying resource utilization trends...", 
      "Detecting readmission risk factors...",
      "Correlating length of stay with outcomes...",
      "Generating actionable insights..."
    ];

    let step = 0;
    const interval = setInterval(() => {
      setAnalysisProgress((step + 1) * (100 / steps.length));
      
      if (step < steps.length) {
        if (step === 3) {
          // Add insight about readmissions
          setInsights(prev => [...prev, {
            type: "pattern",
            title: "Readmission Hotspot Identified",
            description: "Patients with diabetes and heart conditions show 34% higher readmission rates",
            impact: "High",
            action: "Implement specialized discharge protocols"
          }]);
        }
        
        if (step === 4) {
          // Add insight about LOS
          setInsights(prev => [...prev, {
            type: "efficiency",
            title: "Length of Stay Optimization",
            description: "Surgery patients staying >6 days have 2.3x higher costs with similar outcomes",
            impact: "Medium",
            action: "Review discharge criteria for surgical patients"
          }]);
        }

        if (step === 5) {
          // Add insight about resources
          setInsights(prev => [...prev, {
            type: "resource",
            title: "ICU Capacity Strain Detected",
            description: "ICU occupancy peaks Tuesday-Thursday, causing 18% of transfers to be delayed",
            impact: "High", 
            action: "Consider flexible staffing model for mid-week surge"
          }]);
        }
        
        step++;
      } else {
        clearInterval(interval);
        setIsAnalyzing(false);
      }
    }, 800);
  };

  const processNLPQuery = (query: string) => {
    // Simulate NLP processing
    const responses = {
      "readmission": {
        answer: "Current readmission rate is 12.3%. Primary factors: diabetes complications (31%), heart conditions (28%), and medication non-compliance (19%).",
        charts: ["readmission_trends"],
        recommendations: ["Implement diabetes education program", "Enhanced medication reconciliation"]
      },
      "beds": {
        answer: "Bed occupancy is 85% (383/450 beds). ICU at 95% capacity is the main bottleneck. Peak demand occurs Tuesday-Thursday.",
        charts: ["bed_utilization"],
        recommendations: ["Add 2 ICU beds", "Implement flexible staffing"]
      },
      "costs": {
        answer: "Average cost per patient is $12,500. Surgery patients staying >6 days drive 23% cost overruns with minimal outcome improvement.",
        charts: ["cost_analysis"],
        recommendations: ["Review surgical discharge protocols", "Implement cost monitoring dashboard"]
      }
    };

    const key = Object.keys(responses).find(k => query.toLowerCase().includes(k));
    return key ? responses[key as keyof typeof responses] : {
      answer: "I analyzed your query. Based on current data patterns, I recommend exploring patient flow optimization and resource allocation strategies.",
      charts: [],
      recommendations: ["Review current processes", "Implement data monitoring"]
    };
  };

  const generatePredictions = () => {
    setPredictions([
      {
        type: "Admissions",
        period: "Next 7 Days",
        predicted: 245,
        confidence: 87,
        trend: "up",
        impact: "Prepare 8 additional beds"
      },
      {
        type: "Readmissions", 
        period: "Next 30 Days",
        predicted: 67,
        confidence: 82,
        trend: "down",
        impact: "12% reduction from interventions"
      },
      {
        type: "Staff Demand",
        period: "Next Week",
        predicted: "High Tuesday-Thursday",
        confidence: 91,
        trend: "up",
        impact: "Schedule 15% more nurses Wed"
      },
      {
        type: "ICU Capacity",
        period: "Next 48 Hours", 
        predicted: "98% utilization",
        confidence: 95,
        trend: "up",
        impact: "Critical - prepare overflow plan"
      }
    ]);
  };

  // Real-time data simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLiveMode) {
      interval = setInterval(() => {
        setRealTimeData(prev => ({
          activePatients: prev.activePatients + Math.floor(Math.random() * 3) - 1,
          occupancyRate: Math.max(75, Math.min(95, prev.occupancyRate + (Math.random() - 0.5) * 2)),
          criticalAlerts: Math.max(0, prev.criticalAlerts + Math.floor(Math.random() * 3) - 1),
          nursesOnDuty: Math.max(160, Math.min(200, prev.nursesOnDuty + Math.floor(Math.random() * 3) - 1))
        }));

        // Add random notifications
        if (Math.random() < 0.3) {
          const notificationTypes = [
            "New patient admitted to ICU",
            "Discharge completed for Patient GH-2847",
            "Critical alert resolved",
            "Medication administration reminder",
            "Lab results available"
          ];
          
          const newNotification = {
            id: Date.now(),
            message: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
            timestamp: new Date().toLocaleTimeString(),
            type: Math.random() > 0.7 ? "critical" : "info"
          };
          
          setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
        }
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveMode]);

  // Auto-trigger predictions when tab changes
  useEffect(() => {
    if (activeDemo === "predictive" && predictions.length === 0) {
      setTimeout(() => generatePredictions(), 1000);
    }
  }, [activeDemo, predictions.length]);

  // Integration steps simulation
  const integrationSteps = [
    {
      title: "System Assessment",
      description: "Evaluate current EHR infrastructure and data readiness",
      duration: "2-3 days",
      role: "IT Administrator",
      tasks: ["Audit existing systems", "Identify data sources", "Check FHIR compliance"]
    },
    {
      title: "FHIR API Setup", 
      description: "Configure HL7 FHIR R4 endpoints for data exchange",
      duration: "1-2 weeks",
      role: "System Administrator",
      tasks: ["Install FHIR gateway", "Configure endpoints", "Test connections"]
    },
    {
      title: "Blockchain Consent",
      description: "Deploy smart contracts for patient consent management", 
      duration: "3-5 days",
      role: "Security Administrator",
      tasks: ["Deploy contracts", "Configure wallet", "Test consent flows"]
    },
    {
      title: "AI Model Training",
      description: "Train ML models on hospital-specific data patterns",
      duration: "1-2 weeks", 
      role: "Clinical Data Analyst",
      tasks: ["Data preprocessing", "Model training", "Validation testing"]
    },
    {
      title: "User Training",
      description: "Train clinicians and staff on platform usage",
      duration: "1 week",
      role: "Clinical Champion",
      tasks: ["Staff workshops", "Workflow integration", "Competency validation"]
    },
    {
      title: "Go Live",
      description: "Full deployment with monitoring and support",
      duration: "Ongoing",
      role: "All Teams",
      tasks: ["Production deployment", "24/7 monitoring", "Continuous optimization"]
    }
  ];

  const simulateConnection = async (system: string) => {
    setIsConnecting(true);
    setConnectionStatus(prev => ({ ...prev, [system]: 'connecting' }));
    
    // Simulate connection time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setConnectionStatus(prev => ({ ...prev, [system]: 'connected' }));
    setIsConnecting(false);
  };

  const connectAllSystems = async () => {
    setIsConnecting(true);
    
    for (const system of ['ehr', 'fhir', 'blockchain', 'ai']) {
      setConnectionStatus(prev => ({ ...prev, [system]: 'connecting' }));
      await new Promise(resolve => setTimeout(resolve, 1500));
      setConnectionStatus(prev => ({ ...prev, [system]: 'connected' }));
    }
    
    setIsConnecting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-50 border-green-200';
      case 'connecting': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'disconnected': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-50 via-white to-medical-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-clinical-gray-900 mb-4">
            MEDFLECT AI Live Demo
          </h1>
          <p className="text-xl text-clinical-gray-600 mb-6">
            Transforming Hospital Data into Actionable Clinical Intelligence
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isLiveMode ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span>AI Models Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>FHIR Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Blockchain Secured</span>
            </div>
          </div>
          
          {/* Live Mode Toggle */}
          <div className="flex items-center justify-center space-x-3">
            <Button
              variant={isLiveMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsLiveMode(!isLiveMode)}
              className="flex items-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>{isLiveMode ? 'Live Mode Active' : 'Enable Live Mode'}</span>
            </Button>
            {isLiveMode && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Real-time updates enabled</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Notifications */}
        {notifications.length > 0 && isLiveMode && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Live Hospital Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`text-sm p-2 rounded border-l-4 ${
                      notification.type === 'critical' 
                        ? 'border-l-red-500 bg-red-50' 
                        : 'border-l-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{notification.message}</span>
                      <span className="text-xs text-gray-500">{notification.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Problem Statement */}
        <Card className="mb-8 border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Current Hospital Challenge</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Underutilized Data</h3>
                <p className="text-sm text-gray-600">Extensive datasets remain unexplored, limiting insights and optimization opportunities</p>
              </div>
              <div className="text-center">
                <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Manual Analysis</h3>
                <p className="text-sm text-gray-600">No systematic approach to uncover patterns, correlations, or inefficiencies</p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Reactive Operations</h3>
                <p className="text-sm text-gray-600">Lack of predictive capabilities to anticipate and prevent challenges</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">Blockchain Consent</h3>
              <p className="text-xs text-gray-600">Ethereum-secured patient permissions with immutable audit trails</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <Database className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">HL7 FHIR Integration</h3>
              <p className="text-xs text-gray-600">Real-time sync with hospital EHR systems via FHIR R4 standards</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4 text-center">
              <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">ML Predictions</h3>
              <p className="text-xs text-gray-600">Advanced analytics predicting readmissions and resource needs</p>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">Multi-tenant</h3>
              <p className="text-xs text-gray-600">Scalable architecture supporting multiple hospitals securely</p>
            </CardContent>
          </Card>
        </div>

        {/* Solution Tabs */}
        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="integration" className="flex items-center space-x-2">
              <ArrowRight className="w-4 h-4" />
              <span>Get Started</span>
            </TabsTrigger>
            <TabsTrigger value="exploratory" className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="querying" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>NLP Query</span>
            </TabsTrigger>
            <TabsTrigger value="predictive" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Predictive</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Decisions</span>
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Consent</span>
            </TabsTrigger>
            <TabsTrigger value="fhir" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>FHIR</span>
            </TabsTrigger>
          </TabsList>

          {/* Integration Tab */}
          <TabsContent value="integration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowRight className="w-5 h-5 text-blue-600" />
                  <span>System Integration & Onboarding</span>
                </CardTitle>
                <CardDescription>
                  Complete guide for connecting your healthcare system to MEDFLECT AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Quick Start Guide */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Connection Demo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {[
                        { system: 'ehr', name: 'EHR System', icon: Database },
                        { system: 'fhir', name: 'FHIR Gateway', icon: Shield },
                        { system: 'blockchain', name: 'Blockchain', icon: Shield },
                        { system: 'ai', name: 'AI Models', icon: Brain }
                      ].map(({ system, name, icon: Icon }) => (
                        <Card key={system} className={`border-2 transition-all duration-300 ${getStatusColor(connectionStatus[system as keyof typeof connectionStatus])}`}>
                          <CardContent className="p-4 text-center">
                            <Icon className="w-8 h-8 mx-auto mb-2" />
                            <h4 className="font-semibold text-sm mb-2">{name}</h4>
                            <div className="space-y-2">
                              <Badge variant="outline" className={getStatusColor(connectionStatus[system as keyof typeof connectionStatus])}>
                                {connectionStatus[system as keyof typeof connectionStatus] === 'connecting' && (
                                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                                )}
                                {connectionStatus[system as keyof typeof connectionStatus]}
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => simulateConnection(system)}
                                disabled={isConnecting || connectionStatus[system as keyof typeof connectionStatus] === 'connected'}
                                className="w-full text-xs"
                              >
                                {connectionStatus[system as keyof typeof connectionStatus] === 'connected' ? 'Connected' : 'Connect'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="flex justify-center">
                      <Button 
                        onClick={connectAllSystems}
                        disabled={isConnecting}
                        className="flex items-center space-x-2"
                        size="lg"
                      >
                        <Play className="w-4 h-4" />
                        <span>Connect All Systems</span>
                      </Button>
                    </div>
                  </div>

                  {/* Integration Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Complete Integration Timeline</h3>
                    <div className="space-y-4">
                      {integrationSteps.map((step, index) => (
                        <Card key={index} className={`border-l-4 transition-all duration-300 ${index <= integrationStep ? 'border-l-blue-500 bg-blue-50' : 'border-l-gray-300'}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index <= integrationStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    {index + 1}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{step.title}</h4>
                                    <p className="text-sm text-gray-600">{step.description}</p>
                                  </div>
                                </div>
                                <div className="ml-11 space-y-2">
                                  <div className="flex items-center space-x-4 text-sm">
                                    <Badge variant="outline">{step.role}</Badge>
                                    <span className="text-gray-600">Duration: {step.duration}</span>
                                  </div>
                                  <div className="space-y-1">
                                    {step.tasks.map((task, taskIndex) => (
                                      <div key={taskIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                                        <CheckCircle2 className={`w-4 h-4 ${index <= integrationStep ? 'text-green-500' : 'text-gray-400'}`} />
                                        <span>{task}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setIntegrationStep(index)}
                                className="ml-4"
                              >
                                {index <= integrationStep ? 'Completed' : 'Start Step'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Technical Requirements */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">System Requirements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-semibold text-sm mb-2">EHR Compatibility</h5>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {['Epic', 'Cerner', 'Allscripts', 'OpenEMR', 'athenahealth', 'NextGen'].map((ehr) => (
                                <div key={ehr} className="flex items-center space-x-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  <span>{ehr}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="font-semibold text-sm mb-2">Technical Stack</h5>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>FHIR Version:</span>
                                <span className="font-mono">R4 v4.0.1</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Blockchain:</span>
                                <span className="font-mono">Ethereum</span>
                              </div>
                              <div className="flex justify-between">
                                <span>AI Framework:</span>
                                <span className="font-mono">Groq LLMs</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Security:</span>
                                <span className="font-mono">OAuth 2.0 + JWT</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Implementation Support</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-sm">Dedicated Team</span>
                            </div>
                            <p className="text-sm text-gray-600">Implementation specialist assigned to your hospital</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-green-600" />
                              <span className="font-semibold text-sm">24/7 Support</span>
                            </div>
                            <p className="text-sm text-gray-600">Round-the-clock technical assistance during rollout</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Shield className="w-4 h-4 text-purple-600" />
                              <span className="font-semibold text-sm">Compliance Audit</span>
                            </div>
                            <p className="text-sm text-gray-600">Full HIPAA and local regulatory compliance review</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4 text-orange-600" />
                              <span className="font-semibold text-sm">Performance Guarantee</span>
                            </div>
                            <p className="text-sm text-gray-600">Guaranteed 15% efficiency improvement within 6 months</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Regional Implementation */}
                  <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center space-x-2">
                        <Users className="w-5 h-5 text-green-600" />
                        <span>Ghana Healthcare Initiative</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">3</p>
                          <p className="text-sm text-gray-600">Major Hospitals Ready</p>
                          <p className="text-xs text-gray-500">Korle-Bu, Komfo Anokye, 37 Military</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">25,000+</p>
                          <p className="text-sm text-gray-600">Patients Covered</p>
                          <p className="text-xs text-gray-500">Across Greater Accra & Ashanti</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">60 Days</p>
                          <p className="text-sm text-gray-600">Implementation Time</p>
                          <p className="text-xs text-gray-500">From contract to full deployment</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                          <Button className="bg-green-600 hover:bg-green-700">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Start Ghana Pilot Program
                          </Button>
                          <Button variant="outline">
                            Schedule Implementation Call
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exploratory Analysis Tab */}
          <TabsContent value="exploratory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  <span>Automated Exploratory Analysis</span>
                </CardTitle>
                <CardDescription>
                  AI-powered system processes hospital data to uncover hidden patterns and inefficiencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-4">
                      <Button 
                        onClick={runExploratoryAnalysis} 
                        disabled={isAnalyzing}
                        className="flex items-center space-x-2"
                      >
                        {isAnalyzing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isAnalyzing ? 'Analyzing...' : 'Start Deep Analysis'}</span>
                      </Button>
                      {insights.length > 0 && !isAnalyzing && (
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{insights.length} insights discovered</span>
                        </div>
                      )}
                    </div>
                    {isAnalyzing && (
                      <div className="flex-1">
                        <Progress value={analysisProgress} className="h-2" />
                        <p className="text-sm text-gray-600 mt-1">{analysisProgress.toFixed(0)}% Complete</p>
                      </div>
                    )}
                  </div>

                  {insights.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Discovered Insights</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {insights.map((insight, index) => (
                          <Card key={index} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-sm">{insight.title}</h4>
                                <Badge variant={insight.impact === 'High' ? 'destructive' : 'secondary'}>
                                  {insight.impact}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                              <div className="flex items-center space-x-2 text-xs">
                                <ArrowRight className="w-3 h-3" />
                                <span className="font-medium">{insight.action}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sample Data Visualization */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Admission Trends Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={admissionTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="admissions" stroke="#2563eb" strokeWidth={2} />
                            <Line type="monotone" dataKey="readmissions" stroke="#dc2626" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Resource Utilization</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={resourceUtilization}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="resource" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="utilization" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NLP Querying Tab */}
          <TabsContent value="querying" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <span>Natural Language Querying</span>
                </CardTitle>
                <CardDescription>
                  Ask questions about your hospital data in plain English and get instant insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Ask about readmissions, bed utilization, costs, or any hospital metric..."
                      value={nlpQuery}
                      onChange={(e) => setNlpQuery(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      onKeyPress={(e) => e.key === 'Enter' && processNLPQuery(nlpQuery)}
                    />
                    <Button 
                      onClick={() => processNLPQuery(nlpQuery)}
                      disabled={!nlpQuery.trim()}
                      className="transition-all duration-200"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Sample Queries */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Try these sample queries:</p>
                    <div className="flex flex-wrap gap-2">
                      {["What's driving readmissions?", "Show me bed utilization", "Why are costs increasing?"].map((query) => (
                        <Button
                          key={query}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNlpQuery(query);
                            processNLPQuery(query);
                          }}
                        >
                          {query}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Mock Response with Animation */}
                  {nlpQuery && (
                    <Card className="bg-blue-50 border-blue-200 animate-in slide-in-from-top duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Brain className="w-5 h-5 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold">AI Analysis Result</h4>
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                1.3s response
                              </Badge>
                            </div>
                            <p className="text-sm mb-3">{processNLPQuery(nlpQuery).answer}</p>
                            {processNLPQuery(nlpQuery).recommendations.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-1">AI Recommendations:</p>
                                <ul className="text-xs space-y-1">
                                  {processNLPQuery(nlpQuery).recommendations.map((rec, idx) => (
                                    <li key={idx} className="flex items-center space-x-1 animate-in slide-in-from-left duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                                      <span>{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Real-time Metrics Dashboard */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className={`transition-all duration-300 ${isLiveMode ? 'border-blue-300 shadow-md' : ''}`}>
                      <CardContent className="p-4 text-center">
                        <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold transition-all duration-300">
                          {isLiveMode ? realTimeData.activePatients : hospitalData.patients}
                        </p>
                        <p className="text-xs text-gray-600">Active Patients</p>
                        {isLiveMode && <div className="text-xs text-blue-600 mt-1">Live</div>}
                      </CardContent>
                    </Card>
                    <Card className={`transition-all duration-300 ${isLiveMode ? 'border-green-300 shadow-md' : ''}`}>
                      <CardContent className="p-4 text-center">
                        <Activity className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold transition-all duration-300">
                          {isLiveMode ? Math.round(realTimeData.occupancyRate) : hospitalData.occupancyRate}%
                        </p>
                        <p className="text-xs text-gray-600">Bed Occupancy</p>
                        {isLiveMode && <div className="text-xs text-green-600 mt-1">Live</div>}
                      </CardContent>
                    </Card>
                    <Card className={`transition-all duration-300 ${isLiveMode ? 'border-orange-300 shadow-md' : ''}`}>
                      <CardContent className="p-4 text-center">
                        <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{hospitalData.avgLOS}</p>
                        <p className="text-xs text-gray-600">Avg LOS (days)</p>
                      </CardContent>
                    </Card>
                    <Card className={`transition-all duration-300 ${isLiveMode && realTimeData.criticalAlerts > 2 ? 'border-red-300 shadow-md animate-pulse' : ''}`}>
                      <CardContent className="p-4 text-center">
                        <AlertTriangle className={`w-6 h-6 mx-auto mb-2 ${isLiveMode && realTimeData.criticalAlerts > 2 ? 'text-red-600' : 'text-red-600'}`} />
                        <p className="text-2xl font-bold transition-all duration-300">
                          {isLiveMode ? realTimeData.criticalAlerts : 3}
                        </p>
                        <p className="text-xs text-gray-600">Critical Alerts</p>
                        {isLiveMode && <div className="text-xs text-red-600 mt-1">Live</div>}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictive Analytics Tab */}
          <TabsContent value="predictive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>Predictive Analytics Engine</span>
                </CardTitle>
                <CardDescription>
                  ML models forecast future scenarios to enable proactive decision-making
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Button onClick={generatePredictions} className="flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Generate Predictions</span>
                    </Button>
                    {predictions.length > 0 && (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ML models active - predictions updated</span>
                      </div>
                    )}
                  </div>

                  {predictions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {predictions.map((pred, index) => (
                        <Card key={index} className="border-l-4 border-l-purple-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{pred.type}</h4>
                              <Badge variant="outline">{pred.confidence}% confidence</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{pred.period}</p>
                            <p className="text-lg font-bold mb-2">{pred.predicted}</p>
                            <div className="flex items-center space-x-2 text-xs">
                              <Target className="w-3 h-3" />
                              <span className="font-medium">{pred.impact}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Advanced ML Models */}
                  <Card className="bg-purple-50 border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center space-x-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        <span>ML Model Performance</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">89.2%</p>
                          <p className="text-sm text-gray-600">Readmission Accuracy</p>
                          <p className="text-xs text-gray-500">Random Forest + XGBoost</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">94.7%</p>
                          <p className="text-sm text-gray-600">Resource Prediction</p>
                          <p className="text-xs text-gray-500">LSTM Neural Network</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">91.3%</p>
                          <p className="text-sm text-gray-600">LOS Forecasting</p>
                          <p className="text-xs text-gray-500">Gradient Boosting</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risk Stratification */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Patient Risk Stratification</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-6">
                        <div className="flex-1">
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={patientRiskData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {patientRiskData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2">
                          {patientRiskData.map((risk, index) => (
                            <div key={risk.name} className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: COLORS[index] }}
                              ></div>
                              <span className="text-sm">{risk.name}: {risk.count} patients</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blockchain Consent Tab */}
          <TabsContent value="blockchain" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Blockchain Consent Management</span>
                </CardTitle>
                <CardDescription>
                  Ethereum-based patient consent with immutable audit trails and smart contract governance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Consent Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-green-200">
                      <CardContent className="p-4 text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">2,847</p>
                        <p className="text-sm text-gray-600">Active Consents</p>
                      </CardContent>
                    </Card>
                    <Card className="border-blue-200">
                      <CardContent className="p-4 text-center">
                        <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">100%</p>
                        <p className="text-sm text-gray-600">Blockchain Secured</p>
                      </CardContent>
                    </Card>
                    <Card className="border-purple-200">
                      <CardContent className="p-4 text-center">
                        <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-600">12,459</p>
                        <p className="text-sm text-gray-600">Audit Records</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Consent Activities */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Consent Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { action: "Data Sharing Approved", patient: "Patient ID: GH-2847", timestamp: "2 minutes ago", hash: "0x8d9e...7f3a" },
                          { action: "Research Consent Updated", patient: "Patient ID: GH-2846", timestamp: "8 minutes ago", hash: "0x3c1f...9b2d" },
                          { action: "AI Analysis Authorized", patient: "Patient ID: GH-2845", timestamp: "15 minutes ago", hash: "0x7a4e...1c8f" }
                        ].map((activity, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-semibold text-sm">{activity.action}</p>
                              <p className="text-xs text-gray-600">{activity.patient} • {activity.timestamp}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-mono text-blue-600">{activity.hash}</p>
                              <Badge variant="outline" className="text-xs">Verified</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Smart Contract Status */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3 flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span>Smart Contract Status</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Contract Address:</p>
                          <p className="font-mono text-xs">0x742d35Cc6634C0532925a3b8D8C3d6784d</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Gas Used (24h):</p>
                          <p className="font-semibold">47,291 wei</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Network:</p>
                          <p className="font-semibold">Ethereum Mainnet</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Confirmations:</p>
                          <p className="font-semibold text-green-600">12/12</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FHIR Integration Tab */}
          <TabsContent value="fhir" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-green-600" />
                  <span>HL7 FHIR Integration</span>
                </CardTitle>
                <CardDescription>
                  Real-time synchronization with hospital EHR systems using FHIR R4 standards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Connection Status */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-green-200">
                      <CardContent className="p-4 text-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                        <p className="text-sm font-semibold">Epic EMR</p>
                        <p className="text-xs text-gray-600">Connected</p>
                      </CardContent>
                    </Card>
                    <Card className="border-green-200">
                      <CardContent className="p-4 text-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                        <p className="text-sm font-semibold">Cerner</p>
                        <p className="text-xs text-gray-600">Connected</p>
                      </CardContent>
                    </Card>
                    <Card className="border-yellow-200">
                      <CardContent className="p-4 text-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                        <p className="text-sm font-semibold">Allscripts</p>
                        <p className="text-xs text-gray-600">Syncing</p>
                      </CardContent>
                    </Card>
                    <Card className="border-blue-200">
                      <CardContent className="p-4 text-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
                        <p className="text-sm font-semibold">OpenEMR</p>
                        <p className="text-xs text-gray-600">Ready</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Real-time Data Sync */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Real-time Data Synchronization</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { resource: "Patient Records", synced: "2,847", total: "2,847", status: "complete" },
                          { resource: "Observations", synced: "45,293", total: "45,397", status: "syncing" },
                          { resource: "Medications", synced: "18,472", total: "18,472", status: "complete" },
                          { resource: "Procedures", synced: "7,821", total: "7,823", status: "syncing" },
                          { resource: "Lab Results", synced: "92,156", total: "92,156", status: "complete" }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${item.status === 'complete' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                              <div>
                                <p className="font-semibold text-sm">{item.resource}</p>
                                <p className="text-xs text-gray-600">{item.synced} / {item.total} resources</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={item.status === 'complete' ? 'default' : 'secondary'}>
                                {item.status === 'complete' ? 'Synced' : 'Syncing'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* FHIR Compliance */}
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3 flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>FHIR R4 Compliance Status</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Standard Version:</p>
                          <p className="font-semibold">HL7 FHIR R4 v4.0.1</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Supported Resources:</p>
                          <p className="font-semibold">127 / 145</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Interoperability Score:</p>
                          <p className="font-semibold text-green-600">94.2%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Last Validation:</p>
                          <p className="font-semibold">2 hours ago</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Multi-tenant Architecture */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Multi-tenant Hospital Network</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { hospital: "Korle-Bu Teaching Hospital", patients: "12,847", status: "active", region: "Greater Accra" },
                          { hospital: "Komfo Anokye Hospital", patients: "8,293", status: "active", region: "Ashanti" },
                          { hospital: "37 Military Hospital", patients: "4,156", status: "active", region: "Greater Accra" }
                        ].map((hospital, index) => (
                          <Card key={index} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <h5 className="font-semibold text-sm mb-2">{hospital.hospital}</h5>
                              <div className="space-y-1 text-xs">
                                <p><span className="text-gray-600">Patients:</span> {hospital.patients}</p>
                                <p><span className="text-gray-600">Region:</span> {hospital.region}</p>
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="capitalize">{hospital.status}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Decision Support Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  <span>Actionable Decision Support</span>
                </CardTitle>
                <CardDescription>
                  AI-generated recommendations to optimize operations and improve patient care
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* High Priority Actions */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <span>Immediate Actions Required</span>
                    </h3>
                    <div className="space-y-3">
                      <Card className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">ICU Capacity Crisis</h4>
                            <Badge variant="destructive">Critical</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">ICU at 98% capacity with 3 incoming critical patients</p>
                          <p className="text-xs font-medium">Action: Activate overflow protocol and consider early discharge review</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">Staffing Shortage Alert</h4>
                            <Badge variant="secondary">High</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Wednesday predicted to have 15% nursing shortage</p>
                          <p className="text-xs font-medium">Action: Schedule additional staff or consider per-diem coverage</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Strategic Improvements */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span>Strategic Improvements</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Reduce Readmissions</h4>
                          <p className="text-sm text-gray-600 mb-2">Implement enhanced discharge planning for diabetes patients</p>
                          <div className="text-xs space-y-1">
                            <p><strong>Expected Impact:</strong> 23% reduction in 30-day readmissions</p>
                            <p><strong>Cost Savings:</strong> $2.3M annually</p>
                            <p><strong>Timeline:</strong> 6 weeks implementation</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Optimize OR Scheduling</h4>
                          <p className="text-sm text-gray-600 mb-2">Adjust surgical block times based on historical data</p>
                          <div className="text-xs space-y-1">
                            <p><strong>Expected Impact:</strong> 12% increase in OR utilization</p>
                            <p><strong>Revenue Increase:</strong> $1.8M annually</p>
                            <p><strong>Timeline:</strong> 2 weeks implementation</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* ROI Calculator */}
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                        <span>Projected Impact</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">$4.1M</p>
                          <p className="text-sm text-gray-600">Annual Savings</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-600">23%</p>
                          <p className="text-sm text-gray-600">Efficiency Gain</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">8.5x</p>
                          <p className="text-sm text-gray-600">ROI Multiple</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-medical-blue-600 to-medical-blue-700 text-white">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Complete Healthcare AI Solution</h2>
            <p className="text-lg mb-6">
              MEDFLECT AI: Groq-accelerated LLMs + Blockchain Consent + FHIR Integration + ML Predictions
            </p>
            
            {/* Technology Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Ethereum Secured</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Database className="w-4 h-4" />
                <span>FHIR R4 Compliant</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>89% ML Accuracy</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Multi-tenant Ready</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Button size="lg" variant="secondary">
                Contact Sales
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                Deploy in Ghana
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}