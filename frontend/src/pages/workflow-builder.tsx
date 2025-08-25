import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Save, 
  Trash2, 
  Plus, 
  Settings, 
  Workflow,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  ArrowRight,
  GripVertical
} from "lucide-react";

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  title: string;
  description?: string;
  config?: Record<string, any>;
  position: { x: number; y: number };
}

interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  status: 'active' | 'draft' | 'inactive';
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'patient-alert-flow',
    name: 'Critical Patient Alert',
    description: 'Automatically notify medical staff when patient vitals exceed thresholds',
    category: 'Patient Care',
    status: 'active',
    nodes: [
      { id: 'trigger-1', type: 'trigger', title: 'Vital Signs Update', position: { x: 50, y: 100 } },
      { id: 'condition-1', type: 'condition', title: 'Check Critical Values', position: { x: 250, y: 100 } },
      { id: 'action-1', type: 'action', title: 'Send Alert to Staff', position: { x: 450, y: 50 } },
      { id: 'action-2', type: 'action', title: 'Log to Audit Trail', position: { x: 450, y: 150 } },
    ],
    connections: [
      { id: 'conn-1', source: 'trigger-1', target: 'condition-1' },
      { id: 'conn-2', source: 'condition-1', target: 'action-1' },
      { id: 'conn-3', source: 'condition-1', target: 'action-2' },
    ]
  },
  {
    id: 'discharge-flow',
    name: 'Patient Discharge Process',
    description: 'Streamlined workflow for patient discharge procedures',
    category: 'Administrative',
    status: 'active',
    nodes: [
      { id: 'trigger-2', type: 'trigger', title: 'Discharge Order', position: { x: 50, y: 100 } },
      { id: 'action-3', type: 'action', title: 'Generate Summary', position: { x: 250, y: 50 } },
      { id: 'action-4', type: 'action', title: 'Schedule Follow-up', position: { x: 250, y: 150 } },
      { id: 'delay-1', type: 'delay', title: 'Wait 24 Hours', position: { x: 450, y: 100 } },
      { id: 'action-5', type: 'action', title: 'Send Survey', position: { x: 650, y: 100 } },
    ],
    connections: [
      { id: 'conn-4', source: 'trigger-2', target: 'action-3' },
      { id: 'conn-5', source: 'trigger-2', target: 'action-4' },
      { id: 'conn-6', source: 'action-4', target: 'delay-1' },
      { id: 'conn-7', source: 'delay-1', target: 'action-5' },
    ]
  },
  {
    id: 'medication-reminder',
    name: 'Medication Reminder',
    description: 'Automated medication administration reminders',
    category: 'Patient Care',
    status: 'draft',
    nodes: [
      { id: 'trigger-3', type: 'trigger', title: 'Medication Schedule', position: { x: 50, y: 100 } },
      { id: 'condition-2', type: 'condition', title: 'Check Patient Status', position: { x: 250, y: 100 } },
      { id: 'action-6', type: 'action', title: 'Notify Nurse', position: { x: 450, y: 100 } },
    ],
    connections: [
      { id: 'conn-8', source: 'trigger-3', target: 'condition-2' },
      { id: 'conn-9', source: 'condition-2', target: 'action-6' },
    ]
  }
];

const nodeTypeConfig = {
  trigger: { 
    color: 'bg-blue-500', 
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Play 
  },
  condition: { 
    color: 'bg-yellow-500', 
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: AlertTriangle 
  },
  action: { 
    color: 'bg-green-500', 
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle 
  },
  delay: { 
    color: 'bg-purple-500', 
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: Clock 
  }
};

export default function WorkflowBuilder() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Draft</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const openWorkflowBuilder = (workflow?: WorkflowTemplate) => {
    if (workflow) {
      setSelectedWorkflow(workflow);
    }
    setIsBuilderOpen(true);
  };

  if (isBuilderOpen) {
    return (
      <div className="p-6 h-full" data-testid="workflow-builder">
        {/* Builder Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-clinical-gray-900">
              {selectedWorkflow ? `Edit: ${selectedWorkflow.name}` : 'New Workflow'}
            </h1>
            <p className="text-clinical-gray-600 mt-1">
              Design automated workflows for healthcare processes
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setIsBuilderOpen(false)}>
              Back to List
            </Button>
            <Button variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Test Run
            </Button>
          </div>
        </div>

        {/* Workflow Canvas */}
        <div className="grid grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          {/* Node Palette */}
          <div className="space-y-4">
            <Card className="border-clinical-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Node Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0">
                {Object.entries(nodeTypeConfig).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <div
                      key={type}
                      className={`p-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${config.borderColor} ${config.bgColor} hover:opacity-80`}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('nodeType', type)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                        <Icon className={`w-4 h-4 ${config.textColor}`} />
                        <span className={`text-sm font-medium capitalize ${config.textColor}`}>
                          {type}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-clinical-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Properties</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-clinical-gray-500">
                  Select a node to edit its properties
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Canvas Area */}
          <div className="col-span-3">
            <Card className="border-clinical-gray-200 h-full">
              <CardHeader className="border-b border-clinical-gray-200">
                <CardTitle className="flex items-center">
                  <Workflow className="w-5 h-5 mr-2 text-medical-blue-500" />
                  Canvas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <div className="relative w-full h-full bg-clinical-gray-50 overflow-hidden">
                  {/* Grid Background */}
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px'
                    }}
                  ></div>

                  {/* Workflow Nodes */}
                  {selectedWorkflow?.nodes.map((node) => {
                    const config = nodeTypeConfig[node.type];
                    const Icon = config.icon;
                    
                    return (
                      <div
                        key={node.id}
                        className={`absolute cursor-pointer transition-all hover:shadow-lg`}
                        style={{
                          left: `${node.position.x}px`,
                          top: `${node.position.y}px`,
                        }}
                      >
                        <Card className={`w-48 border-2 ${config.borderColor} ${config.bgColor}`}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                                <Icon className={`w-4 h-4 ${config.textColor}`} />
                              </div>
                              <GripVertical className="w-4 h-4 text-clinical-gray-400" />
                            </div>
                            <h4 className={`text-sm font-medium ${config.textColor} mb-1`}>
                              {node.title}
                            </h4>
                            {node.description && (
                              <p className="text-xs text-clinical-gray-600">{node.description}</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}

                  {/* Connections */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {selectedWorkflow?.connections.map((connection) => {
                      const sourceNode = selectedWorkflow.nodes.find(n => n.id === connection.source);
                      const targetNode = selectedWorkflow.nodes.find(n => n.id === connection.target);
                      
                      if (!sourceNode || !targetNode) return null;
                      
                      const startX = sourceNode.position.x + 192; // node width
                      const startY = sourceNode.position.y + 40; // roughly center
                      const endX = targetNode.position.x;
                      const endY = targetNode.position.y + 40;
                      
                      return (
                        <g key={connection.id}>
                          <line
                            x1={startX}
                            y1={startY}
                            x2={endX}
                            y2={endY}
                            stroke="#6B7280"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                          />
                        </g>
                      );
                    })}
                    
                    {/* Arrow marker definition */}
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill="#6B7280"
                        />
                      </marker>
                    </defs>
                  </svg>

                  {/* Drop Zone */}
                  <div
                    className="absolute inset-0"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const nodeType = e.dataTransfer.getData('nodeType');
                      // In a real implementation, you'd add the node to the workflow
                      console.log('Dropped node type:', nodeType, 'at position:', { x: e.clientX, y: e.clientY });
                    }}
                  >
                    {selectedWorkflow?.nodes.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-clinical-gray-500">
                          <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">Start Building</p>
                          <p className="text-sm">
                            Drag nodes from the palette to create your workflow
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="workflow-builder-page">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-clinical-gray-900">Workflow Builder</h1>
          <p className="text-clinical-gray-600 mt-1">Design and manage automated healthcare workflows</p>
        </div>
        <Button onClick={() => openWorkflowBuilder()}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Workflow
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-clinical-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-clinical-gray-600 text-sm font-medium">Total Workflows</p>
                <p className="text-2xl font-bold text-clinical-gray-900 mt-1">
                  {workflowTemplates.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Workflow className="text-blue-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-clinical-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-clinical-gray-600 text-sm font-medium">Active</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {workflowTemplates.filter(w => w.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="text-green-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-clinical-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-clinical-gray-600 text-sm font-medium">Draft</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {workflowTemplates.filter(w => w.status === 'draft').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Settings className="text-yellow-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-clinical-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-clinical-gray-600 text-sm font-medium">Executions Today</p>
                <p className="text-2xl font-bold text-clinical-gray-900 mt-1">247</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Play className="text-purple-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Templates */}
      <Card className="border-clinical-gray-200">
        <CardHeader className="border-b border-clinical-gray-200">
          <CardTitle className="text-lg font-semibold text-clinical-gray-900">
            Workflow Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {workflowTemplates.map((workflow) => (
              <Card 
                key={workflow.id} 
                className="border-clinical-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openWorkflowBuilder(workflow)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-clinical-gray-900 mb-2">
                        {workflow.name}
                      </h3>
                      <p className="text-sm text-clinical-gray-600 mb-3">
                        {workflow.description}
                      </p>
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {workflow.category}
                        </Badge>
                        {getStatusBadge(workflow.status)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-clinical-gray-500">
                    <span>{workflow.nodes.length} nodes</span>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}