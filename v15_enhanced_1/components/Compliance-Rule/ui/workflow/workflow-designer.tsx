import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  Square, 
  Edit, 
  Trash2, 
  Plus, 
  Save, 
  Download, 
  Upload, 
  Settings,
  GitBranch,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Bell,
  Database,
  Zap,
  Copy,
  RotateCcw,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import useComplianceStore from '../../core/state-manager';
import { 
  complianceWorkflowEngine, 
  Workflow, 
  WorkflowStep, 
  WorkflowTemplate
} from '../../core/workflow-engine';
import { useEnterpriseCompliance } from '../../hooks/use-enterprise-compliance';

interface WorkflowNode {
  id: string;
  type: 'TASK' | 'APPROVAL' | 'NOTIFICATION' | 'INTEGRATION' | 'DECISION';
  name: string;
  x: number;
  y: number;
  parameters: Record<string, any>;
  connections: string[];
}

interface WorkflowConnection {
  from: string;
  to: string;
  condition?: string;
}

const WorkflowDesigner: React.FC = () => {
  const [activeTab, setActiveTab] = useState('designer');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>([]);
  const [workflowConnections, setWorkflowConnections] = useState<WorkflowConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDesigning, setIsDesigning] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');
  const [newWorkflowType, setNewWorkflowType] = useState<Workflow['type']>('COMPLIANCE_CHECK');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showNodeProperties, setShowNodeProperties] = useState(false);
  const [nodeProperties, setNodeProperties] = useState<Partial<WorkflowNode>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);

  const {
    rules,
    violations,
    audits
  } = useComplianceStore();

  const {
    workflowMetrics
  } = useEnterpriseCompliance();

  // Load workflow data
  useEffect(() => {
    loadWorkflowData();
    const interval = setInterval(loadWorkflowData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadWorkflowData = () => {
    try {
      // Get all workflows
      const allWorkflows = complianceWorkflowEngine.getAllWorkflows();
      setWorkflows(allWorkflows);

      // Get templates
      const allTemplates = complianceWorkflowEngine.getTemplates();
      setTemplates(allTemplates);

      // If a workflow is selected, convert to visual format
      if (selectedWorkflow) {
        const workflow = complianceWorkflowEngine.getWorkflow(selectedWorkflow);
        if (workflow) {
          convertWorkflowToNodes(workflow);
        }
      }
    } catch (error) {
      console.error('Error loading workflow data:', error);
    }
  };

  // Convert workflow to visual nodes
  const convertWorkflowToNodes = (workflow: Workflow) => {
    const nodes: WorkflowNode[] = workflow.steps.map((step, index) => ({
      id: step.id,
      type: step.type,
      name: step.name,
      x: 100 + (index % 4) * 200,
      y: 100 + Math.floor(index / 4) * 150,
      parameters: step.parameters,
      connections: step.nextSteps
    }));

    const connections: WorkflowConnection[] = [];
    workflow.steps.forEach(step => {
      step.nextSteps.forEach(nextStepName => {
        const nextStep = workflow.steps.find(s => s.name === nextStepName);
        if (nextStep) {
          connections.push({
            from: step.id,
            to: nextStep.id
          });
        }
      });
    });

    setWorkflowNodes(nodes);
    setWorkflowConnections(connections);
  };

  // Create new workflow
  const createNewWorkflow = () => {
    if (!newWorkflowName.trim()) return;

    const workflow = complianceWorkflowEngine.createWorkflow('compliance-check-template', {
      name: newWorkflowName,
      description: newWorkflowDescription,
      type: newWorkflowType,
      createdBy: 'current-user'
    });

    setSelectedWorkflow(workflow.id);
    setNewWorkflowName('');
    setNewWorkflowDescription('');
    setShowCreateDialog(false);
    setIsDesigning(true);
    loadWorkflowData();
  };

  // Add new node to workflow
  const addNode = (type: WorkflowNode['type']) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      name: `New ${type}`,
      x: 200 + workflowNodes.length * 50,
      y: 200 + workflowNodes.length * 30,
      parameters: {},
      connections: []
    };

    setWorkflowNodes([...workflowNodes, newNode]);
    setSelectedNode(newNode.id);
    setNodeProperties(newNode);
    setShowNodeProperties(true);
  };

  // Update node position
  const updateNodePosition = (nodeId: string, x: number, y: number) => {
    setWorkflowNodes(nodes => 
      nodes.map(node => 
        node.id === nodeId ? { ...node, x, y } : node
      )
    );
  };

  // Update node properties
  const updateNodeProperties = () => {
    if (!selectedNode) return;

    setWorkflowNodes(nodes => 
      nodes.map(node => 
        node.id === selectedNode ? { ...node, ...nodeProperties } : node
      )
    );

    setShowNodeProperties(false);
    setSelectedNode(null);
  };

  // Delete node
  const deleteNode = (nodeId: string) => {
    setWorkflowNodes(nodes => nodes.filter(node => node.id !== nodeId));
    setWorkflowConnections(connections => 
      connections.filter(conn => conn.from !== nodeId && conn.to !== nodeId)
    );
    
    if (selectedNode === nodeId) {
      setSelectedNode(null);
      setShowNodeProperties(false);
    }
  };

  // Connect nodes
  const connectNodes = (fromId: string, toId: string) => {
    const existingConnection = workflowConnections.find(
      conn => conn.from === fromId && conn.to === toId
    );

    if (!existingConnection) {
      setWorkflowConnections([...workflowConnections, { from: fromId, to: toId }]);
      
      // Update node connections
      setWorkflowNodes(nodes => 
        nodes.map(node => 
          node.id === fromId 
            ? { ...node, connections: [...node.connections, toId] }
            : node
        )
      );
    }
  };

  // Execute workflow
  const executeWorkflow = async () => {
    if (!selectedWorkflow) return;

    setIsExecuting(true);
    setExecutionProgress(0);

    try {
      // Start workflow execution
      complianceWorkflowEngine.startWorkflow(selectedWorkflow);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExecutionProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            setIsExecuting(false);
            return 100;
          }
          return newProgress;
        });
      }, 500);

    } catch (error) {
      console.error('Error executing workflow:', error);
      setIsExecuting(false);
    }
  };

  // Get node icon
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'TASK':
        return <CheckCircle className="h-4 w-4" />;
      case 'APPROVAL':
        return <User className="h-4 w-4" />;
      case 'NOTIFICATION':
        return <Bell className="h-4 w-4" />;
      case 'INTEGRATION':
        return <Database className="h-4 w-4" />;
      case 'DECISION':
        return <GitBranch className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  // Get node color
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'TASK':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'APPROVAL':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'NOTIFICATION':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'INTEGRATION':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'DECISION':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600';
      case 'PAUSED':
        return 'text-yellow-600';
      case 'COMPLETED':
        return 'text-blue-600';
      case 'CANCELLED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Designer</h1>
          <p className="text-muted-foreground">
            Design and manage compliance workflows visually
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Workflow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workflow</DialogTitle>
                <DialogDescription>
                  Design a new compliance workflow from scratch
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workflowName">Workflow Name</Label>
                  <Input
                    id="workflowName"
                    value={newWorkflowName}
                    onChange={(e) => setNewWorkflowName(e.target.value)}
                    placeholder="Enter workflow name"
                  />
                </div>
                <div>
                  <Label htmlFor="workflowDescription">Description</Label>
                  <Textarea
                    id="workflowDescription"
                    value={newWorkflowDescription}
                    onChange={(e) => setNewWorkflowDescription(e.target.value)}
                    placeholder="Describe the workflow purpose"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="workflowType">Workflow Type</Label>
                  <Select value={newWorkflowType} onValueChange={(value: Workflow['type']) => setNewWorkflowType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMPLIANCE_CHECK">Compliance Check</SelectItem>
                      <SelectItem value="VIOLATION_REMEDIATION">Violation Remediation</SelectItem>
                      <SelectItem value="AUDIT_PROCESS">Audit Process</SelectItem>
                      <SelectItem value="RULE_APPROVAL">Rule Approval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={createNewWorkflow}>Create Workflow</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="designer">Designer</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Designer Tab */}
        <TabsContent value="designer" className="space-y-4">
          <div className="grid grid-cols-4 gap-4 h-[calc(100vh-16rem)]">
            {/* Toolbox */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Toolbox</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['TASK', 'APPROVAL', 'NOTIFICATION', 'INTEGRATION', 'DECISION'].map((type) => (
                      <Button
                        key={type}
                        onClick={() => addNode(type as WorkflowNode['type'])}
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                      >
                        {getNodeIcon(type)}
                        <span className="ml-2">{type}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Current Workflow Info */}
              {selectedWorkflow && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Workflow Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        {workflows.find(w => w.id === selectedWorkflow)?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {workflowNodes.length} nodes, {workflowConnections.length} connections
                      </p>
                      <div className="flex space-x-2">
                        <Button onClick={executeWorkflow} size="sm" disabled={isExecuting}>
                          {isExecuting ? <Clock className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Save className="h-3 w-3" />
                        </Button>
                      </div>
                      {isExecuting && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Executing...</span>
                            <span>{executionProgress}%</span>
                          </div>
                          <Progress value={executionProgress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Canvas */}
            <div className="col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Workflow Canvas</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={isDesigning}
                        onCheckedChange={setIsDesigning}
                      />
                      <span className="text-xs">Design Mode</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative h-full min-h-96 bg-gray-50 border-2 border-dashed border-gray-200 overflow-auto">
                    {/* Grid Background */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <defs>
                        <pattern
                          id="grid"
                          width="20"
                          height="20"
                          patternUnits="userSpaceOnUse"
                        >
                          <path
                            d="M 20 0 L 0 0 0 20"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="1"
                          />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>

                    {/* Connections */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {workflowConnections.map((connection, index) => {
                        const fromNode = workflowNodes.find(n => n.id === connection.from);
                        const toNode = workflowNodes.find(n => n.id === connection.to);
                        
                        if (!fromNode || !toNode) return null;

                        return (
                          <line
                            key={index}
                            x1={fromNode.x + 60}
                            y1={fromNode.y + 25}
                            x2={toNode.x}
                            y2={toNode.y + 25}
                            stroke="#3b82f6"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                          />
                        );
                      })}
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
                            fill="#3b82f6"
                          />
                        </marker>
                      </defs>
                    </svg>

                    {/* Nodes */}
                    {workflowNodes.map((node) => (
                      <div
                        key={node.id}
                        style={{
                          position: 'absolute',
                          left: node.x,
                          top: node.y,
                        }}
                        className={`p-3 border-2 rounded-lg cursor-pointer min-w-32 ${getNodeColor(node.type)} ${
                          selectedNode === node.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => {
                          setSelectedNode(node.id);
                          setNodeProperties(node);
                          setShowNodeProperties(true);
                        }}
                        draggable={isDesigning}
                        onDragStart={() => setDraggedNode(node.id)}
                        onDragEnd={(e) => {
                          if (draggedNode) {
                            const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                            if (rect) {
                              updateNodePosition(
                                draggedNode,
                                e.clientX - rect.left,
                                e.clientY - rect.top
                              );
                            }
                          }
                          setDraggedNode(null);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          {getNodeIcon(node.type)}
                          <span className="text-sm font-medium">{node.name}</span>
                        </div>
                        <p className="text-xs mt-1">{node.type}</p>
                        
                        {isDesigning && (
                          <div className="absolute -top-2 -right-2">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNode(node.id);
                              }}
                              variant="destructive"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Empty State */}
                    {workflowNodes.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <GitBranch className="h-8 w-8 text-gray-400 mx-auto" />
                          <p className="text-sm text-gray-500">
                            Start designing your workflow by adding nodes from the toolbox
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Properties Panel */}
            <div className="space-y-4">
              {showNodeProperties && selectedNode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Node Properties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nodeName">Name</Label>
                        <Input
                          id="nodeName"
                          value={nodeProperties.name || ''}
                          onChange={(e) => setNodeProperties({
                            ...nodeProperties,
                            name: e.target.value
                          })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="nodeType">Type</Label>
                        <Select 
                          value={nodeProperties.type || ''} 
                          onValueChange={(value: WorkflowNode['type']) => 
                            setNodeProperties({
                              ...nodeProperties,
                              type: value
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TASK">Task</SelectItem>
                            <SelectItem value="APPROVAL">Approval</SelectItem>
                            <SelectItem value="NOTIFICATION">Notification</SelectItem>
                            <SelectItem value="INTEGRATION">Integration</SelectItem>
                            <SelectItem value="DECISION">Decision</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Type-specific parameters */}
                      {nodeProperties.type === 'APPROVAL' && (
                        <div>
                          <Label htmlFor="assignee">Assignee</Label>
                          <Input
                            id="assignee"
                            placeholder="Enter assignee"
                            value={nodeProperties.parameters?.assignee || ''}
                            onChange={(e) => setNodeProperties({
                              ...nodeProperties,
                              parameters: {
                                ...nodeProperties.parameters,
                                assignee: e.target.value
                              }
                            })}
                          />
                        </div>
                      )}

                      {nodeProperties.type === 'NOTIFICATION' && (
                        <div>
                          <Label htmlFor="recipients">Recipients</Label>
                          <Input
                            id="recipients"
                            placeholder="Enter recipients (comma separated)"
                            value={nodeProperties.parameters?.recipients?.join(', ') || ''}
                            onChange={(e) => setNodeProperties({
                              ...nodeProperties,
                              parameters: {
                                ...nodeProperties.parameters,
                                recipients: e.target.value.split(',').map(r => r.trim())
                              }
                            })}
                          />
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button onClick={updateNodeProperties} size="sm">
                          Save
                        </Button>
                        <Button 
                          onClick={() => setShowNodeProperties(false)} 
                          variant="outline" 
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Workflow List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Workflows</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {workflows.slice(0, 5).map((workflow) => (
                        <div
                          key={workflow.id}
                          onClick={() => setSelectedWorkflow(workflow.id)}
                          className={`p-2 border rounded cursor-pointer transition-colors ${
                            selectedWorkflow === workflow.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                          }`}
                        >
                          <p className="text-sm font-medium">{workflow.name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(workflow.status)}
                            >
                              {workflow.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {workflow.steps.length} steps
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <CardDescription>{workflow.description}</CardDescription>
                    </div>
                    <Badge 
                      variant={
                        workflow.status === 'ACTIVE' ? 'default' :
                        workflow.status === 'COMPLETED' ? 'secondary' :
                        workflow.status === 'PAUSED' ? 'outline' :
                        'destructive'
                      }
                    >
                      {workflow.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Type:</span>
                        <p className="text-muted-foreground">{workflow.type}</p>
                      </div>
                      <div>
                        <span className="font-medium">Steps:</span>
                        <p className="text-muted-foreground">{workflow.steps.length}</p>
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span>
                        <p className="text-muted-foreground">{workflow.priority}</p>
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>
                        <p className="text-muted-foreground">
                          {new Date(workflow.startedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => {
                          setSelectedWorkflow(workflow.id);
                          setActiveTab('designer');
                        }}
                        variant="outline" 
                        size="sm"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Play className="h-3 w-3 mr-1" />
                        Run
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-3 w-3 mr-1" />
                        Clone
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <span className="font-medium">Version:</span>
                      <span className="ml-2 text-muted-foreground">{template.version}</span>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium">Steps:</span>
                      <span className="ml-2 text-muted-foreground">{template.steps.length}</span>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => {
                          const workflow = complianceWorkflowEngine.createWorkflow(template.id, {
                            createdBy: 'current-user'
                          });
                          setSelectedWorkflow(workflow.id);
                          setActiveTab('designer');
                        }}
                        size="sm"
                      >
                        Use Template
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workflowMetrics?.total || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workflowMetrics?.active || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workflowMetrics?.completed || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workflowMetrics?.failed || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Executions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.filter(w => w.status !== 'DRAFT').slice(0, 5).map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{workflow.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Started: {new Date(workflow.startedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        workflow.status === 'ACTIVE' ? 'default' :
                        workflow.status === 'COMPLETED' ? 'secondary' :
                        'outline'
                      }>
                        {workflow.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowDesigner;