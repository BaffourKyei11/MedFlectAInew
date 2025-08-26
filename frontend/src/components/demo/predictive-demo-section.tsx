import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Target, Activity } from "lucide-react";
import { DemoApiService } from "@/services/demo-api";

interface PredictionResult {
  type: string;
  period: string;
  predicted: string | number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  impact: string;
  riskScore?: number;
  riskCategory?: string;
  recommendations?: string[];
}

export default function PredictiveDemoSection() {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [selectedDemo, setSelectedDemo] = useState<string>('readmission');

  // Sample admission data for demo
  const sampleAdmissionData = {
    age: 65,
    gender: 'male',
    admissionType: 'emergency',
    primaryDiagnosis: 'heart_failure',
    comorbidities: ['diabetes', 'hypertension'],
    lengthOfStay: 5,
    vitalSigns: { bp: '140/90', hr: 85, temp: 98.6 },
    labResults: { hemoglobin: 12.5, creatinine: 1.2 }
  };

  const readmissionMutation = useMutation({
    mutationFn: (data: { patientId: string; admissionData: any }) =>
      DemoApiService.predictReadmissionRisk(data.patientId, data.admissionData),
    onSuccess: (data) => {
      setPredictions(prev => [...prev, {
        type: 'Readmission Risk',
        period: data.timeframe || '30-day',
        predicted: `${(data.riskScore * 100).toFixed(1)}%`,
        confidence: Math.round(data.confidence * 100),
        trend: data.riskScore > 0.7 ? 'up' : data.riskScore > 0.4 ? 'stable' : 'down',
        impact: data.riskCategory || 'high',
        riskScore: data.riskScore,
        riskCategory: data.riskCategory,
        recommendations: data.recommendations
      }]);
    }
  });

  const resourceMutation = useMutation({
    mutationFn: (data: { hospitalId: string; timeframe: any }) =>
      DemoApiService.predictResourceNeeds(data.hospitalId, data.timeframe),
    onSuccess: (data) => {
      // Process resource predictions
      if (data.predictions) {
        const newPredictions = Object.entries(data.predictions).map(([resource, prediction]: [string, any]) => ({
          type: `${resource} Demand`,
          period: data.timeframe.period || 'Next 7 Days',
          predicted: prediction.predicted,
          confidence: Math.round(data.confidence * 100),
          trend: prediction.trend || 'stable',
          impact: prediction.impact || 'Monitor capacity',
        }));
        setPredictions(prev => [...prev, ...newPredictions]);
      }
    }
  });

  const runReadmissionDemo = () => {
    // Using first patient from sample data
    readmissionMutation.mutate({
      patientId: 'sample-patient-1',
      admissionData: sampleAdmissionData
    });
  };

  const runResourceDemo = () => {
    resourceMutation.mutate({
      hospitalId: 'demo-hospital',
      timeframe: {
        period: 'Next 7 Days',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
  };

  const generateMockPredictions = () => {
    const mockPredictions: PredictionResult[] = [
      {
        type: "ICU Admissions",
        period: "Next 48 Hours",
        predicted: 23,
        confidence: 89,
        trend: "up",
        impact: "Prepare 3 additional ICU beds"
      },
      {
        type: "Emergency Department Load",
        period: "Next 24 Hours", 
        predicted: "High",
        confidence: 92,
        trend: "up",
        impact: "Schedule additional staff for evening shift"
      },
      {
        type: "Surgery Cancellations",
        period: "This Week",
        predicted: 4,
        confidence: 76,
        trend: "down",
        impact: "Lower than usual - good capacity utilization"
      },
      {
        type: "Medication Shortages",
        period: "Next Month",
        predicted: "Low Risk",
        confidence: 83,
        trend: "stable",
        impact: "Current supply chain stable"
      }
    ];

    setPredictions(prev => [...prev, ...mockPredictions]);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRiskColor = (riskScore?: number) => {
    if (!riskScore) return 'bg-gray-100';
    if (riskScore >= 0.7) return 'bg-red-100 border-red-200';
    if (riskScore >= 0.4) return 'bg-yellow-100 border-yellow-200';
    return 'bg-green-100 border-green-200';
  };

  return (
    <div className="space-y-6" data-testid="predictive-demo-section">
      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>Predictive Analytics Demonstration</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Experience ML-powered predictions for readmission risk, resource planning, and operational insights
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={runReadmissionDemo}
              disabled={readmissionMutation.isPending}
              variant={selectedDemo === 'readmission' ? 'default' : 'outline'}
              className="flex items-center space-x-2"
              data-testid="predict-readmission-demo"
            >
              <Target className="w-4 h-4" />
              <span>{readmissionMutation.isPending ? 'Analyzing...' : 'Predict Readmission'}</span>
            </Button>

            <Button
              onClick={runResourceDemo}
              disabled={resourceMutation.isPending}
              variant={selectedDemo === 'resource' ? 'default' : 'outline'}
              className="flex items-center space-x-2"
              data-testid="predict-resources-demo"
            >
              <Activity className="w-4 h-4" />
              <span>{resourceMutation.isPending ? 'Calculating...' : 'Predict Resources'}</span>
            </Button>

            <Button
              onClick={generateMockPredictions}
              variant="outline"
              className="flex items-center space-x-2"
              data-testid="generate-mock-predictions"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Generate Sample Predictions</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Predictions Display */}
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prediction Results</CardTitle>
            <p className="text-sm text-gray-600">
              AI-generated predictions with confidence scores and actionable recommendations
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictions.map((prediction, index) => (
                <Card 
                  key={index} 
                  className={`border-l-4 ${prediction.riskScore ? getRiskColor(prediction.riskScore) : 'border-l-blue-500'}`}
                  data-testid={`prediction-${index}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{prediction.type}</h4>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(prediction.trend)}
                        <Badge variant="outline" className="text-xs">
                          {prediction.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{prediction.period}:</span>
                        <span className="font-mono text-lg">
                          {prediction.predicted}
                        </span>
                      </div>
                      
                      <Progress value={prediction.confidence} className="h-2" />
                      
                      <div className="text-xs text-gray-600 mt-2">
                        <span className="font-medium">Impact:</span> {prediction.impact}
                      </div>

                      {prediction.recommendations && (
                        <div className="mt-3 space-y-1">
                          <span className="text-xs font-medium text-gray-700">Recommendations:</span>
                          {prediction.recommendations.map((rec, i) => (
                            <div key={i} className="text-xs text-gray-600 flex items-start space-x-1">
                              <span>•</span>
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {predictions.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Brain className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Predictions Generated Yet
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Click one of the buttons above to demonstrate predictive analytics capabilities
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}