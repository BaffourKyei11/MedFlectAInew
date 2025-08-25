import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Brain, Edit3, Save, RefreshCw } from "lucide-react";
import { AIService } from "@/services/ai-service";

interface Patient {
  id: string;
  name: string;
  mrn: string;
}

export default function AISummaryGenerator() {
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [summaryType, setSummaryType] = useState<"discharge" | "progress" | "handoff">("discharge");
  const [generatedSummary, setGeneratedSummary] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [summaryId, setSummaryId] = useState<string>("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients, isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const generateMutation = useMutation({
    mutationFn: AIService.generateSummary,
    onSuccess: (data) => {
      setGeneratedSummary(data.content);
      setSummaryId(data.id);
      setIsEditing(false);
      toast({
        title: "Summary Generated",
        description: `AI summary generated in ${data.generationTime}ms using ${data.model}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate summary",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; content: string }) => 
      AIService.updateSummary(data.id, { content: data.content }),
    onSuccess: () => {
      setIsEditing(false);
      toast({
        title: "Summary Updated",
        description: "Summary has been saved successfully",
      });
    },
  });

  const saveFHIRMutation = useMutation({
    mutationFn: AIService.saveSummaryToFHIR,
    onSuccess: () => {
      toast({
        title: "Saved to FHIR",
        description: "Summary has been saved to the FHIR server successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fhir/status"] });
    },
    onError: (error) => {
      toast({
        title: "FHIR Save Failed",
        description: error instanceof Error ? error.message : "Failed to save to FHIR server",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!selectedPatient) {
      toast({
        title: "Patient Required",
        description: "Please select a patient before generating a summary",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      patientId: selectedPatient,
      summaryType,
    });
  };

  const handleSave = () => {
    if (summaryId && generatedSummary) {
      updateMutation.mutate({
        id: summaryId,
        content: generatedSummary,
      });
    }
  };

  const handleSaveToFHIR = () => {
    if (summaryId) {
      saveFHIRMutation.mutate(summaryId);
    }
  };

  const selectedPatientData = patients?.find(p => p.id === selectedPatient);

  return (
    <Card className="border-clinical-gray-200 shadow-sm" data-testid="ai-summary-generator">
      <CardHeader className="border-b border-clinical-gray-200">
        <CardTitle className="text-lg font-semibold text-clinical-gray-900">
          AI Clinical Summary Generator
        </CardTitle>
        <p className="text-clinical-gray-600 text-sm mt-1">
          Generate AI-powered patient summaries using Groq LLMs
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Patient Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-clinical-gray-700 mb-2">
            Select Patient
          </label>
          <Select 
            value={selectedPatient} 
            onValueChange={setSelectedPatient}
            disabled={patientsLoading}
          >
            <SelectTrigger data-testid="patient-select">
              <SelectValue placeholder={patientsLoading ? "Loading patients..." : "Choose a patient"} />
            </SelectTrigger>
            <SelectContent>
              {patients?.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name} - MRN: {patient.mrn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-clinical-gray-700 mb-2">
            Summary Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "discharge", label: "Discharge" },
              { value: "progress", label: "Progress Note" },
              { value: "handoff", label: "Handoff" }
            ].map((type) => (
              <Button
                key={type.value}
                variant={summaryType === type.value ? "default" : "outline"}
                onClick={() => setSummaryType(type.value as any)}
                className={`text-sm font-medium ${
                  summaryType === type.value
                    ? "bg-medical-blue-500 text-white hover:bg-medical-blue-600"
                    : "text-clinical-gray-600 hover:bg-clinical-gray-50"
                }`}
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
          disabled={generateMutation.isPending || !selectedPatient}
          className="w-full bg-medical-blue-500 hover:bg-medical-blue-600 text-white font-medium py-3 px-4 transition-colors"
          data-testid="generate-summary-button"
        >
          {generateMutation.isPending ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Generate AI Summary
            </>
          )}
        </Button>

        {/* Generated Summary Display */}
        {generatedSummary && (
          <div className="mt-6 bg-clinical-gray-50 rounded-lg p-4 border-l-4 border-medical-teal-500">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-clinical-gray-900">AI-Generated Summary</h4>
              <div className="flex items-center space-x-2">
                {selectedPatientData && (
                  <Badge variant="outline" className="text-xs">
                    {selectedPatientData.name} - {selectedPatientData.mrn}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs capitalize">
                  {summaryType}
                </Badge>
              </div>
            </div>
            
            {isEditing ? (
              <Textarea
                value={generatedSummary}
                onChange={(e) => setGeneratedSummary(e.target.value)}
                className="min-h-[200px] text-sm"
                data-testid="summary-editor"
              />
            ) : (
              <div 
                className="text-sm text-clinical-gray-700 whitespace-pre-wrap"
                data-testid="summary-content"
              >
                {generatedSummary}
              </div>
            )}
            
            <div className="flex justify-end mt-4 space-x-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    data-testid="cancel-edit-button"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="bg-medical-blue-500 hover:bg-medical-blue-600"
                    data-testid="save-changes-button"
                  >
                    {updateMutation.isPending ? (
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3 mr-1" />
                    )}
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-clinical-gray-600 hover:text-clinical-gray-800"
                    data-testid="edit-summary-button"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveToFHIR}
                    disabled={saveFHIRMutation.isPending}
                    className="text-medical-blue-600 hover:text-medical-blue-800 bg-medical-blue-50 hover:bg-medical-blue-100"
                    data-testid="save-to-fhir-button"
                  >
                    {saveFHIRMutation.isPending ? (
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3 mr-1" />
                    )}
                    Save to FHIR
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
