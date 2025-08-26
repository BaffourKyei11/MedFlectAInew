import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Search, 
  Filter, 
  Edit3, 
  Save, 
  Clock,
  User,
  FileText,
  RefreshCw
} from "lucide-react";
import { AIService } from "@/services/ai-service";
import { formatDistanceToNow } from "date-fns";

interface ClinicalSummary {
  id: string;
  patientId: string;
  userId: string;
  type: "discharge" | "progress" | "handoff";
  content: string;
  aiGenerated: boolean;
  groqModel?: string;
  generationTime?: number;
  status: "draft" | "finalized";
  fhirResourceId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Patient {
  id: string;
  name: string;
  mrn: string;
}

export default function AISummaries() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editingId, setEditingId] = useState<string>("");
  const [editContent, setEditContent] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: summaries, isLoading } = useQuery<ClinicalSummary[]>({
    queryKey: ["/api/summaries"],
    // Since we don't have a direct endpoint for all summaries, we'll need to implement this
    // For now, return empty array until backend endpoint is created
    queryFn: () => Promise.resolve([]),
  });

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; content: string; status?: string }) =>
      AIService.updateSummary(data.id, { content: data.content, status: data.status as any }),
    onSuccess: () => {
      setEditingId("");
      setEditContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/summaries"] });
      toast({
        title: "Summary Updated",
        description: "The summary has been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update summary",
        variant: "destructive",
      });
    },
  });

  const saveFHIRMutation = useMutation({
    mutationFn: AIService.saveSummaryToFHIR,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/summaries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fhir/status"] });
      toast({
        title: "Saved to FHIR",
        description: "Summary has been saved to the FHIR server successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "FHIR Save Failed",
        description: error instanceof Error ? error.message : "Failed to save to FHIR server",
        variant: "destructive",
      });
    },
  });

  const getPatientName = (patientId: string) => {
    const patient = patients?.find(p => p.id === patientId);
    return patient?.name || "Unknown Patient";
  };

  const getStatusColor = (status: string) => {
    return status === "finalized" 
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-yellow-50 text-yellow-700 border-yellow-200";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "discharge":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "progress":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "handoff":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleEdit = (summary: ClinicalSummary) => {
    setEditingId(summary.id);
    setEditContent(summary.content);
  };

  const handleSave = (id: string, status?: string) => {
    updateMutation.mutate({
      id,
      content: editContent,
      status,
    });
  };

  const handleSaveToFHIR = (id: string) => {
    saveFHIRMutation.mutate(id);
  };

  // Filter summaries based on search and filters
  const filteredSummaries = summaries?.filter(summary => {
    const matchesSearch = searchTerm === "" || 
      summary.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getPatientName(summary.patientId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || summary.type === filterType;
    const matchesStatus = filterStatus === "all" || summary.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  return (
    <div className="p-6" data-testid="ai-summaries-page">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-clinical-gray-900">AI Clinical Summaries</h1>
        <p className="text-clinical-gray-600 mt-1">Manage and review AI-generated clinical summaries</p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6 border-clinical-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-clinical-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search summaries or patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-summaries"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40" data-testid="filter-type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="discharge">Discharge</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="handoff">Handoff</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40" data-testid="filter-status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="finalized">Finalized</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summaries List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-clinical-gray-200">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-clinical-gray-200 rounded w-48"></div>
                      <div className="h-3 bg-clinical-gray-200 rounded w-32"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-clinical-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-clinical-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-clinical-gray-200 rounded"></div>
                    <div className="h-3 bg-clinical-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-clinical-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSummaries.length === 0 ? (
        <Card className="border-clinical-gray-200">
          <CardContent className="p-12">
            <div className="text-center" data-testid="no-summaries">
              <Brain className="w-12 h-12 mx-auto mb-4 text-clinical-gray-300" />
              <h3 className="text-lg font-medium text-clinical-gray-900 mb-2">No Summaries Found</h3>
              <p className="text-clinical-gray-500">
                {searchTerm || filterType !== "all" || filterStatus !== "all"
                  ? "No summaries match your current filters. Try adjusting your search criteria."
                  : "No AI summaries have been generated yet. Start by generating a summary from the dashboard."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSummaries.map((summary) => (
            <Card key={summary.id} className="border-clinical-gray-200" data-testid={`summary-${summary.id}`}>
              <CardHeader className="border-b border-clinical-gray-200 pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-clinical-gray-900">
                        {getPatientName(summary.patientId)}
                      </h3>
                      <Badge variant="outline" className={getTypeColor(summary.type)}>
                        {summary.type.charAt(0).toUpperCase() + summary.type.slice(1)}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(summary.status)}>
                        {summary.status.charAt(0).toUpperCase() + summary.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-clinical-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDistanceToNow(new Date(summary.createdAt), { addSuffix: true })}
                      </div>
                      {summary.aiGenerated && (
                        <div className="flex items-center">
                          <Brain className="w-4 h-4 mr-1" />
                          AI Generated
                          {summary.generationTime && (
                            <span className="ml-1">({summary.generationTime}ms)</span>
                          )}
                        </div>
                      )}
                      {summary.fhirResourceId && (
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          Saved to FHIR
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {editingId === summary.id ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingId("");
                            setEditContent("");
                          }}
                          data-testid={`cancel-edit-${summary.id}`}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSave(summary.id)}
                          disabled={updateMutation.isPending}
                          className="bg-medical-blue-500 hover:bg-medical-blue-600"
                          data-testid={`save-edit-${summary.id}`}
                        >
                          {updateMutation.isPending ? (
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Save className="w-3 h-3 mr-1" />
                          )}
                          Save
                        </Button>
                        {summary.status === "draft" && (
                          <Button
                            size="sm"
                            onClick={() => handleSave(summary.id, "finalized")}
                            disabled={updateMutation.isPending}
                            className="bg-green-500 hover:bg-green-600"
                            data-testid={`finalize-${summary.id}`}
                          >
                            Finalize
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(summary)}
                          data-testid={`edit-${summary.id}`}
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        {summary.status === "finalized" && !summary.fhirResourceId && (
                          <Button
                            size="sm"
                            onClick={() => handleSaveToFHIR(summary.id)}
                            disabled={saveFHIRMutation.isPending}
                            className="bg-medical-teal-500 hover:bg-medical-teal-600"
                            data-testid={`save-fhir-${summary.id}`}
                          >
                            {saveFHIRMutation.isPending ? (
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Save className="w-3 h-3 mr-1" />
                            )}
                            Save to FHIR
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {editingId === summary.id ? (
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[200px] text-sm"
                    data-testid={`edit-content-${summary.id}`}
                  />
                ) : (
                  <div className="text-sm text-clinical-gray-700 whitespace-pre-wrap">
                    {summary.content}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
