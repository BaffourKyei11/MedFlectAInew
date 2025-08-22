import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useFHIRStatus } from "@/hooks/use-fhir-status";
import {
  BarChart3,
  Brain,
  Users,
  TrendingUp,
  Shield,
  ClipboardList,
  Workflow,
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    section: "Clinical Tools"
  },
  {
    name: "AI Summaries",
    href: "/summaries",
    icon: Brain,
    section: "Clinical Tools"
  },
  {
    name: "Patient Records",
    href: "/patients",
    icon: Users,
    section: "Clinical Tools"
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: TrendingUp,
    section: "Clinical Tools"
  },
  {
    name: "Workflow Builder",
    href: "/workflow",
    icon: Workflow,
    section: "Administration"
  },
  {
    name: "Consent Management",
    href: "/consent",
    icon: Shield,
    section: "Administration"
  },
  {
    name: "Audit Logs",
    href: "/audit",
    icon: ClipboardList,
    section: "Administration"
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { data: fhirStatus } = useFHIRStatus();

  const sections = navigation.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof navigation>);

  return (
    <nav className="w-64 bg-white shadow-lg border-r border-clinical-gray-200 overflow-y-auto">
      <div className="p-4 space-y-2">
        {Object.entries(sections).map(([sectionName, items]) => (
          <div key={sectionName} className="mb-6">
            <h3 className="text-xs font-semibold text-clinical-gray-400 uppercase tracking-wider mb-3">
              {sectionName}
            </h3>
            <div className="space-y-1">
              {items.map((item) => {
                const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
                const Icon = item.icon;
                
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg font-medium transition-colors",
                      isActive
                        ? "text-medical-blue-600 bg-medical-blue-50"
                        : "text-clinical-gray-600 hover:bg-clinical-gray-100"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* System Status Section */}
        <div>
          <h3 className="text-xs font-semibold text-clinical-gray-400 uppercase tracking-wider mb-3">
            System Status
          </h3>
          <div className="space-y-3">
            {/* FHIR Status */}
            <div className="bg-green-50 p-3 rounded-lg" data-testid="fhir-status-card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">FHIR Server</span>
                {fhirStatus?.connection?.connected ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <p className="text-xs text-green-600 mt-1">
                {fhirStatus?.connection?.connected 
                  ? `Connected • ${fhirStatus.connection.latency}ms`
                  : "Disconnected"
                }
              </p>
            </div>
            
            {/* Data Sync Status */}
            <div className="bg-blue-50 p-3 rounded-lg" data-testid="sync-status-card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Data Sync</span>
                {fhirStatus?.sync?.encounters?.pending ? (
                  <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                ) : (
                  <Activity className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {fhirStatus?.sync?.encounters?.pending 
                  ? `Syncing • ${fhirStatus.sync.encounters.pending} pending`
                  : "Synced"
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
