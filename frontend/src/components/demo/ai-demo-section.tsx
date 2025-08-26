import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Clock, Zap, CheckCircle, AlertTriangle } from "lucide-react";
import { DemoApiService } from "@/services/demo-api";

export default function AIDemoSection() {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [summaryType, setSummaryType] = useState<'discharge' | 'progress' | 'handoff'>("discharge");
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [summaryMetrics, setSummaryMetrics] = useState<any>(null);

  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['demo-patients'],
    queryFn: DemoApiService.getPatients
  });

  const { data: aiStatus } = useQuery({
    queryKey: ['ai-status'],
    queryFn: DemoApiService.getAIStatus,
    refetchInterval: 30000
  });

  const generateSummaryMutation = useMutation({
    mutationFn: ({ patientId, type }: { patientId: string; type: 'discharge' | 'progress' | 'handoff' }) =>
      DemoApiService.generateClinicalSummary(patientId, type),
    onSuccess: (data) => {
      setGeneratedSummary(data.content);
      setSummaryMetrics({
        generationTime: data.generationTime,
        model: data.model,
        tokensUsed: data.tokensUsed,
        id: data.id
      });
    }
  });

  const handleGenerate = () => {
    if (selectedPatient) {
      generateSummaryMutation.mutate({
        patientId: selectedPatient,
        type: summaryType
      });
    }
  };

  const selectedPatientData = patients?.find((p: any) => p.id === selectedPatient);

  return (
    <div className="space-y-6" data-testid="ai-demo-section">
      {/* AI Status Overview */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Brain className="w-5 h-5" />
            <span>AI System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              {aiStatus?.status === 'connected' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">
                Status: {aiStatus?.status || 'Loading...'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm">
                Latency: {aiStatus?.latency ? `${aiStatus.latency}ms` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-sm">
                Model: {aiStatus?.model || 'Loading...'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive AI Summary Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Clinical Summary</CardTitle>
          <p className="text-sm text-gray-600">
            Demonstrate AI-powered clinical summary generation using real patient data
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Patient</label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger data-testid="demo-patient-select">
                <SelectValue placeholder={patientsLoading ? "Loading patients..." : "Choose a patient"} />
              </SelectTrigger>
              <SelectContent>
                {patients?.map((patient: any) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} - MRN: {patient.mrn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Summary Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Summary Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'discharge', label: 'Discharge Summary' },
                { value: 'progress', label: 'Progress Note' },
                { value: 'handoff', label: 'Handoff Report' }
              ].map((type) => (
                <Button
                  key={type.value}
                  variant={summaryType === type.value ? "default" : "outline"}
                  onClick={() => setSummaryType(type.value as any)}
                  className="text-sm"
                  data-testid={`summary-type-${type.value}`}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!selectedPatient || generateSummaryMutation.isPending}
            className="w-full"
            data-testid="generate-demo-summary"
          >
            {generateSummaryMutation.isPending ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                Generating AI Summary...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate Clinical Summary
              </>
            )}
          </Button>

          {/* Generated Summary Display */}
          {generatedSummary && (
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Generated Summary</h4>
                <div className="flex items-center space-x-2">
                  {selectedPatientData && (
                    <Badge variant="outline" className="text-xs">
                      {selectedPatientData.name}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs capitalize">
                    {summaryType}
                  </Badge>
                </div>
              </div>

              <Textarea
                value={generatedSummary}
                onChange={(e) => setGeneratedSummary(e.target.value)}
                className="min-h-[200px] mb-3"
                data-testid="generated-summary-content"
              />

              {/* Summary Metrics */}
              {summaryMetrics && (
                <div className="grid grid-cols-3 gap-4 text-sm border-t pt-3">
                  <div>
                    <span className="text-gray-600">Generation Time:</span>
                    <div className="font-mono">{summaryMetrics.generationTime}ms</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tokens Used:</span>
                    <div className="font-mono">{summaryMetrics.tokensUsed || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Model:</span>
                    <div className="font-mono text-xs">{summaryMetrics.model}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {generateSummaryMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Generation Failed</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                {generateSummaryMutation.error instanceof Error 
                  ? generateSummaryMutation.error.message 
                  : 'An unexpected error occurred'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}