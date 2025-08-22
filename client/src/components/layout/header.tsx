import { useAIStatus } from "@/hooks/use-ai-status";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Activity, Zap } from "lucide-react";
import MedflectLogo from "@/components/ui/medflect-logo";

export default function Header() {
  const { data: aiStatus } = useAIStatus();

  return (
    <header className="bg-white shadow-sm border-b border-clinical-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <MedflectLogo size="md" variant="dark" showText={true} />
            
            {/* AI Status Indicator */}
            <div data-testid="ai-status-indicator">
              {aiStatus ? (
                <Badge 
                  variant="secondary" 
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <Activity className="w-3 h-3 mr-1" />
                  AI Online
                  {aiStatus.latency && (
                    <span className="ml-2 text-xs text-green-600">{aiStatus.latency}ms</span>
                  )}
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <Zap className="w-3 h-3 mr-1" />
                  AI Offline
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Profile */}
            <div className="flex items-center space-x-3" data-testid="user-profile">
              <div className="text-right">
                <p className="text-sm font-medium text-clinical-gray-900">Dr. Kwame Asante</p>
                <p className="text-xs text-clinical-gray-500">Lead Physician</p>
              </div>
              <Avatar className="w-9 h-9 bg-medical-blue-100">
                <AvatarFallback className="bg-medical-blue-100 text-medical-blue-600 text-sm font-medium">
                  KA
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
