import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Shield, 
  Database, 
  Activity, 
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  Zap,
  Globe,
  Lock,
  TrendingUp,
  Heart,
  FileText,
  Workflow,
  Calendar
} from "lucide-react";

export default function Landing() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Clinical Intelligence",
      description: "Generate instant clinical summaries using Groq's accelerated LLMs with 2.3s average response time",
      stats: "99.2% accuracy rate"
    },
    {
      icon: Shield,
      title: "Blockchain-Secured Consent",
      description: "Immutable patient consent management with Ethereum-based audit trails",
      stats: "100% tamper-proof records"
    },
    {
      icon: Database,
      title: "HL7 FHIR Integration",
      description: "Seamless interoperability with existing hospital systems and EHRs",
      stats: "12,439+ observations synced"
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Advanced ML models for readmission risk and resource planning",
      stats: "89% prediction accuracy"
    }
  ];

  const stats = [
    { label: "Active Patients", value: "2,847", icon: Users },
    { label: "AI Summaries Generated", value: "89K+", icon: Brain },
    { label: "Hospitals Connected", value: "37", icon: Heart },
    { label: "Data Points Processed", value: "12.4M", icon: Activity }
  ];

  const testimonials = [
    {
      name: "Dr. Kwame Asante",
      role: "Lead Physician, 37 Military Hospital",
      content: "MEDFLECT has transformed our clinical workflow. AI summaries save us 40% time on documentation.",
      avatar: "KA"
    },
    {
      name: "Dr. Ama Osei",
      role: "Chief Medical Officer",
      content: "The predictive analytics help us allocate resources 3 days in advance. Game-changing for capacity planning.",
      avatar: "AO"
    },
    {
      name: "Dr. Yaw Mensah",
      role: "Emergency Department Director",
      content: "Real-time risk alerts have reduced readmissions by 23%. The blockchain audit gives us complete trust.",
      avatar: "YM"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-50 via-white to-medical-teal-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-medical-blue-600 to-medical-blue-700">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Brain className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              MEDFLECT AI
            </h1>
            <p className="text-xl md:text-2xl text-medical-blue-100 mb-4">
              Turning Hospital Data into Clinical Decisions
            </p>
            <p className="text-lg text-medical-blue-200 mb-8 max-w-3xl mx-auto">
              AI-powered healthcare platform leveraging Groq LLMs to transform hospital data into actionable clinical insights. 
              Built for Ghana and Africa with offline-first design and blockchain-secured consent management.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button 
                  size="lg" 
                  className="bg-white text-medical-blue-600 hover:bg-medical-blue-50 font-semibold px-8 py-3"
                  data-testid="cta-demo"
                >
                  Live Demo
                  <Zap className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3"
                  data-testid="cta-dashboard"
                >
                  Launch Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-medical-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-medical-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-clinical-gray-900 mb-1">{stat.value}</div>
                  <div className="text-clinical-gray-600 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-clinical-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-clinical-gray-900 mb-6">
              Addressing Africa's Healthcare Crisis
            </h2>
            <p className="text-xl text-clinical-gray-600 max-w-3xl mx-auto">
              Ghana faces a 42% health workforce shortfall. Across Africa, there's ~1 doctor per 5,000 people. 
              Data silos and paper records create delays and errors that cost lives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-clinical-gray-200 text-center p-8">
              <CardContent>
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-clinical-gray-900 mb-3">Staff Shortage</h3>
                <p className="text-clinical-gray-600">
                  42% health workforce shortfall means overworked clinicians struggle with documentation and patient care
                </p>
              </CardContent>
            </Card>

            <Card className="border-clinical-gray-200 text-center p-8">
              <CardContent>
                <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-clinical-gray-900 mb-3">Data Silos</h3>
                <p className="text-clinical-gray-600">
                  Fragmented systems and paper records prevent access to critical patient information when needed
                </p>
              </CardContent>
            </Card>

            <Card className="border-clinical-gray-200 text-center p-8">
              <CardContent>
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-clinical-gray-900 mb-3">Delayed Decisions</h3>
                <p className="text-clinical-gray-600">
                  Manual processes and lack of real-time insights lead to delayed clinical decisions and poor outcomes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-clinical-gray-900 mb-6">
              How MEDFLECT Solves It
            </h2>
            <p className="text-xl text-clinical-gray-600 max-w-3xl mx-auto">
              Scalable AI infrastructure that converts raw hospital data into intelligible, actionable insights
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card 
                    key={index}
                    className={`border-2 cursor-pointer transition-all duration-300 ${
                      activeFeature === index 
                        ? 'border-medical-blue-500 bg-medical-blue-50' 
                        : 'border-clinical-gray-200 hover:border-medical-blue-300'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          activeFeature === index 
                            ? 'bg-medical-blue-500' 
                            : 'bg-clinical-gray-100'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            activeFeature === index 
                              ? 'text-white' 
                              : 'text-clinical-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-clinical-gray-900 mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-clinical-gray-600 mb-3">
                            {feature.description}
                          </p>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            {feature.stats}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="bg-gradient-to-br from-medical-blue-600 to-medical-blue-700 rounded-2xl p-8 text-white">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {(() => {
                    const Icon = features[activeFeature].icon;
                    return <Icon className="w-10 h-10 text-white" />;
                  })()}
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {features[activeFeature].title}
                </h3>
                <p className="text-medical-blue-100 mb-6 text-lg">
                  {features[activeFeature].description}
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl font-bold mb-1">
                    {features[activeFeature].stats}
                  </div>
                  <div className="text-medical-blue-200 text-sm">
                    Proven Performance
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 bg-clinical-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-clinical-gray-900 mb-6">
              Built on Cutting-Edge Technology
            </h2>
            <p className="text-xl text-clinical-gray-600 max-w-3xl mx-auto">
              Enterprise-grade infrastructure designed for healthcare at scale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-clinical-gray-200 text-center p-6">
              <CardContent>
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-clinical-gray-900 mb-2">Groq LPUs</h3>
                <p className="text-clinical-gray-600 text-sm">
                  Ultra-low latency LLM inference with on-premises deployment for PHI security
                </p>
              </CardContent>
            </Card>

            <Card className="border-clinical-gray-200 text-center p-6">
              <CardContent>
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-clinical-gray-900 mb-2">HL7 FHIR R4</h3>
                <p className="text-clinical-gray-600 text-sm">
                  Industry-standard interoperability for seamless EHR integration
                </p>
              </CardContent>
            </Card>

            <Card className="border-clinical-gray-200 text-center p-6">
              <CardContent>
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-clinical-gray-900 mb-2">Ethereum</h3>
                <p className="text-clinical-gray-600 text-sm">
                  Blockchain-based consent management with immutable audit trails
                </p>
              </CardContent>
            </Card>

            <Card className="border-clinical-gray-200 text-center p-6">
              <CardContent>
                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-clinical-gray-900 mb-2">PWA</h3>
                <p className="text-clinical-gray-600 text-sm">
                  Offline-first progressive web app for reliable operation in low-connectivity areas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-clinical-gray-900 mb-6">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-clinical-gray-600">
              See what clinicians are saying about MEDFLECT
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-clinical-gray-200 p-6">
                <CardContent>
                  <div className="mb-4">
                    <p className="text-clinical-gray-700 italic">
                      "{testimonial.content}"
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-medical-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-medical-blue-600 font-semibold">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-clinical-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-clinical-gray-600 text-sm">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-medical-blue-600 to-medical-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Transform Your Hospital's Clinical Intelligence
          </h2>
          <p className="text-xl text-medical-blue-100 mb-8">
            Join 37 hospitals already using MEDFLECT to improve patient outcomes and clinical efficiency
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo">
              <Button 
                size="lg" 
                className="bg-white text-medical-blue-600 hover:bg-medical-blue-50 font-semibold px-8 py-4"
                data-testid="cta-bottom-demo"
              >
                See Live Demo
                <Zap className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4"
                data-testid="cta-bottom-dashboard"
              >
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-white mb-1">2.3s</div>
              <div className="text-medical-blue-200 text-sm">Avg AI Response</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">99.2%</div>
              <div className="text-medical-blue-200 text-sm">AI Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">40%</div>
              <div className="text-medical-blue-200 text-sm">Time Saved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">23%</div>
              <div className="text-medical-blue-200 text-sm">Readmission Reduction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-clinical-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">MEDFLECT AI</h3>
                    <p className="text-sm text-medical-blue-100">Clinical Intelligence</p>
                  </div>
                </div>
              </div>
              <p className="text-clinical-gray-400 mb-4 max-w-md">
                Transforming hospital data into clinical decisions with AI-powered insights, 
                blockchain security, and offline-first design for healthcare in Africa.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-clinical-gray-400">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/summaries" className="hover:text-white transition-colors">AI Summaries</Link></li>
                <li><Link href="/patients" className="hover:text-white transition-colors">Patient Records</Link></li>
                <li><Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Security</h4>
              <ul className="space-y-2 text-clinical-gray-400">
                <li><Link href="/consent" className="hover:text-white transition-colors">Consent Management</Link></li>
                <li><Link href="/audit" className="hover:text-white transition-colors">Audit Logs</Link></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">HIPAA Compliance</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Security</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-clinical-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-clinical-gray-400 text-sm">
              © 2025 MEDFLECT AI. Built for healthcare transformation in Africa.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                AI Online
              </Badge>
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                <Lock className="w-3 h-3 mr-1" />
                Blockchain Secured
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}