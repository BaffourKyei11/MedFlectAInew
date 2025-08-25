import { useQuery } from "@tanstack/react-query";
import MetricsCards from "@/components/dashboard/metrics-cards";
import AISummaryGenerator from "@/components/dashboard/ai-summary-generator";
import RiskAlerts from "@/components/dashboard/risk-alerts";
import FHIRStatus from "@/components/dashboard/fhir-status";
import AnalyticsSection from "@/components/dashboard/analytics-section";

export default function Dashboard() {
  return (
    <div className="p-6" data-testid="dashboard-page">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-clinical-gray-900">Clinical Dashboard</h1>
        <p className="text-clinical-gray-600 mt-1">Real-time insights and AI-powered clinical support</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="mb-8">
        <MetricsCards />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* AI Clinical Summary Generator */}
        <div className="lg:col-span-2">
          <AISummaryGenerator />
        </div>

        {/* Right Sidebar Content */}
        <div className="space-y-6">
          <RiskAlerts />
          <FHIRStatus />
        </div>
      </div>

      {/* Analytics Section */}
      <AnalyticsSection />
    </div>
  );
}
