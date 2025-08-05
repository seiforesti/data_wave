"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import {
  Plus, Search, Filter, MoreVertical, Grid3X3, List, Play, Pause, Square,
  Clock, Calendar, Users, Settings, Copy, Share2, Download, Upload,
  GitBranch, Workflow, Network, Layers, Target, Zap, Brain, AlertTriangle,
  CheckCircle, Eye, Edit3, Trash2, RefreshCw, Save, Code, Terminal,
  ArrowRight, ArrowDown, ChevronRight, ChevronDown, Maximize2, Minimize2,
  BarChart3, PieChart, TrendingUp, Activity, FileText, Tag, Star,
  Lock, Unlock, Key, Crown, Award, Flame, Sparkles, MessageSquare,
  Bell, Mail, Webhook, Database, Cloud, Server, Cpu, HardDrive,
  ExternalLink, Import, Export, Archive, History, RotateCcw, FastForward
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Import types
import {
  JobWorkflow,
  WorkflowNode,
  WorkflowEdge,
  WorkflowTemplate,
  WorkflowExecution,
  WorkflowSchedule,
  WorkflowAnalytics,
  WorkflowPermission,
  AIAssistant,
  WorkflowTrigger,
  WorkflowVariable,
  WorkflowResource,
  WorkflowNotification
} from '../../types/racine.types'

// Import hooks and services
import { workflowService } from '../../services/workflow.service'
import { aiService } from '../../services/ai.service'

interface JobWorkflowSpaceProps {
  workflows: JobWorkflow[]
  activeWorkflow?: JobWorkflow
  templates: WorkflowTemplate[]
  onCreate: (config: Partial<JobWorkflow>) => Promise<JobWorkflow>
  onExecute: (workflowId: string, parameters?: Record<string, any>) => Promise<WorkflowExecution>
  analytics: WorkflowAnalytics
  aiAssistant: AIAssistant
  workspaceId?: string
  userId?: string
  permissions?: WorkflowPermission[]
  onWorkflowUpdate?: (workflow: JobWorkflow) => void
  onError?: (error: Error) => void
}

export const JobWorkflowSpace: React.FC<JobWorkflowSpaceProps> = ({
  workflows = [],
  activeWorkflow,
  templates = [],
  onCreate,
  onExecute,
  analytics,
  aiAssistant,
  workspaceId,
  userId,
  permissions = [],
  onWorkflowUpdate,
  onError
}) => {
  // Core state
  const [selectedWorkflow, setSelectedWorkflow] = useState<JobWorkflow | null>(activeWorkflow || null)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'canvas'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  // Workflow builder state
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [edges, setEdges] = useState<WorkflowEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [isBuilderMode, setIsBuilderMode] = useState(false)
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null)

  // UI state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showExecutionDialog, setShowExecutionDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [leftPanelSize, setLeftPanelSize] = useState(25)
  const [rightPanelSize, setRightPanelSize] = useState(25)

  // Advanced features state
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [schedules, setSchedules] = useState<WorkflowSchedule[]>([])
  const [variables, setVariables] = useState<WorkflowVariable[]>([])
  const [triggers, setTriggers] = useState<WorkflowTrigger[]>([])
  const [aiSuggestions, setAISuggestions] = useState<any[]>([])
  const [liveExecutions, setLiveExecutions] = useState<Map<string, WorkflowExecution>>(new Map())

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(true)

  // Toast for notifications
  const { toast } = useToast()

  // Node types for workflow builder
  const nodeTypes = [
    {
      type: 'data-source',
      label: 'Data Source',
      icon: Database,
      category: 'Input',
      description: 'Connect to data sources'
    },
    {
      type: 'scan-rule',
      label: 'Scan Rule',
      icon: Search,
      category: 'Processing',
      description: 'Apply scan rules'
    },
    {
      type: 'classification',
      label: 'Classification',
      icon: Tag,
      category: 'Processing',
      description: 'Classify data'
    },
    {
      type: 'compliance',
      label: 'Compliance Check',
      icon: Shield,
      category: 'Validation',
      description: 'Validate compliance'
    },
    {
      type: 'transformation',
      label: 'Transform',
      icon: Zap,
      category: 'Processing',
      description: 'Transform data'
    },
    {
      type: 'notification',
      label: 'Notification',
      icon: Bell,
      category: 'Output',
      description: 'Send notifications'
    },
    {
      type: 'condition',
      label: 'Condition',
      icon: GitBranch,
      category: 'Logic',
      description: 'Conditional logic'
    },
    {
      type: 'loop',
      label: 'Loop',
      icon: RotateCcw,
      category: 'Logic',
      description: 'Iterate over data'
    },
    {
      type: 'ai-analysis',
      label: 'AI Analysis',
      icon: Brain,
      category: 'Intelligence',
      description: 'AI-powered analysis'
    },
    {
      type: 'api-call',
      label: 'API Call',
      icon: Webhook,
      category: 'External',
      description: 'External API integration'
    }
  ]

  // Load workflow data
  useEffect(() => {
    const loadWorkflowData = async () => {
      if (!selectedWorkflow) return

      try {
        setIsLoading(true)

        // Load workflow executions
        const executionsData = await workflowService.getWorkflowExecutions(selectedWorkflow.id)
        setExecutions(executionsData)

        // Load schedules
        const schedulesData = await workflowService.getWorkflowSchedules(selectedWorkflow.id)
        setSchedules(schedulesData)

        // Load variables
        const variablesData = await workflowService.getWorkflowVariables(selectedWorkflow.id)
        setVariables(variablesData)

        // Load triggers
        const triggersData = await workflowService.getWorkflowTriggers(selectedWorkflow.id)
        setTriggers(triggersData)

        // Get AI suggestions
        const suggestions = await aiService.getWorkflowSuggestions({
          workflowId: selectedWorkflow.id,
          context: { executions: executionsData, analytics }
        })
        setAISuggestions(suggestions)

        // Load workflow definition
        if (selectedWorkflow.definition) {
          setNodes(selectedWorkflow.definition.nodes || [])
          setEdges(selectedWorkflow.definition.edges || [])
        }

      } catch (error) {
        console.error('Failed to load workflow data:', error)
        onError?.(error as Error)
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkflowData()
  }, [selectedWorkflow, analytics, onError])

  // Filter workflows
  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return workflow.name.toLowerCase().includes(query) ||
               workflow.description?.toLowerCase().includes(query) ||
               workflow.tags?.some(tag => tag.toLowerCase().includes(query))
      }
      return true
    })
  }, [workflows, searchQuery])

  // Handle workflow creation
  const handleCreateWorkflow = useCallback(async (config: Partial<JobWorkflow>) => {
    try {
      setIsLoading(true)
      
      const newWorkflow = await onCreate({
        ...config,
        workspaceId,
        createdBy: userId
      })

      setSelectedWorkflow(newWorkflow)
      setShowCreateDialog(false)

      toast({
        title: "Workflow Created",
        description: `Successfully created workflow "${newWorkflow.name}"`,
      })

    } catch (error) {
      console.error('Failed to create workflow:', error)
      toast({
        title: "Creation Failed",
        description: "Failed to create workflow. Please try again.",
        variant: "destructive"
      })
      onError?.(error as Error)
    } finally {
      setIsLoading(false)
    }
  }, [onCreate, workspaceId, userId, toast, onError])

  // Handle workflow execution
  const handleExecuteWorkflow = useCallback(async (workflowId: string, parameters?: Record<string, any>) => {
    try {
      setIsExecuting(true)
      
      const execution = await onExecute(workflowId, parameters)
      
      // Add to live executions
      setLiveExecutions(prev => new Map(prev.set(execution.id, execution)))

      toast({
        title: "Workflow Started",
        description: `Workflow execution started with ID: ${execution.id}`,
      })

      return execution
    } catch (error) {
      console.error('Failed to execute workflow:', error)
      toast({
        title: "Execution Failed",
        description: "Failed to start workflow execution. Please try again.",
        variant: "destructive"
      })
      onError?.(error as Error)
      throw error
    } finally {
      setIsExecuting(false)
    }
  }, [onExecute, toast, onError])

  // Handle node drag and drop
  const handleNodeDrop = useCallback((event: React.DragEvent, position: { x: number; y: number }) => {
    event.preventDefault()
    
    if (!draggedNodeType) return

    const nodeType = nodeTypes.find(nt => nt.type === draggedNodeType)
    if (!nodeType) return

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: draggedNodeType,
      label: nodeType.label,
      position,
      data: {
        config: {},
        inputs: [],
        outputs: []
      },
      status: 'idle'
    }

    setNodes(prev => [...prev, newNode])
    setDraggedNodeType(null)
  }, [draggedNodeType, nodeTypes])

  // Handle edge connection
  const handleConnect = useCallback((params: { source: string; target: string; sourceHandle?: string; targetHandle?: string }) => {
    const newEdge: WorkflowEdge = {
      id: `edge-${params.source}-${params.target}`,
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
      type: 'default',
      data: {}
    }

    setEdges(prev => [...prev, newEdge])
  }, [])

  // Save workflow definition
  const handleSaveWorkflow = useCallback(async () => {
    if (!selectedWorkflow) return

    try {
      const updatedWorkflow = await workflowService.updateWorkflow(selectedWorkflow.id, {
        definition: {
          nodes,
          edges,
          variables,
          triggers
        }
      })

      setSelectedWorkflow(updatedWorkflow)
      onWorkflowUpdate?.(updatedWorkflow)

      toast({
        title: "Workflow Saved",
        description: "Workflow definition has been saved successfully",
      })

    } catch (error) {
      console.error('Failed to save workflow:', error)
      toast({
        title: "Save Failed",
        description: "Failed to save workflow. Please try again.",
        variant: "destructive"
      })
      onError?.(error as Error)
    }
  }, [selectedWorkflow, nodes, edges, variables, triggers, onWorkflowUpdate, toast, onError])

  // Render workflow card
  const renderWorkflowCard = (workflow: JobWorkflow) => {
    const isSelected = selectedWorkflow?.id === workflow.id
    const lastExecution = executions.find(ex => ex.workflowId === workflow.id)
    
    return (
      <motion.div
        key={workflow.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -2 }}
        className="group relative"
      >
        <Card 
          className={cn(
            "h-full transition-all duration-200 cursor-pointer",
            isSelected && "ring-2 ring-primary",
            "hover:shadow-lg"
          )}
          onClick={() => setSelectedWorkflow(workflow)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Workflow className="h-5 w-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-sm truncate">{workflow.name}</h3>
                    {workflow.isTemplate && <Badge variant="outline" className="text-xs">Template</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {workflow.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleExecuteWorkflow(workflow.id)}>
                      <Play className="h-4 w-4 mr-2" />
                      Execute Workflow
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsBuilderMode(true)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Workflow
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Clone Workflow
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Workflow
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Status and Last Execution */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    workflow.status === 'active' && "bg-green-500",
                    workflow.status === 'paused' && "bg-yellow-500",
                    workflow.status === 'error' && "bg-red-500",
                    workflow.status === 'draft' && "bg-gray-500"
                  )} />
                  <span className="text-sm capitalize">{workflow.status}</span>
                </div>
                
                {lastExecution && (
                  <Badge 
                    variant={lastExecution.status === 'completed' ? 'default' : 
                            lastExecution.status === 'failed' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {lastExecution.status}
                  </Badge>
                )}
              </div>

              {/* Tags */}
              {workflow.tags && workflow.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {workflow.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {workflow.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{workflow.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-semibold">{workflow.nodeCount || 0}</div>
                  <div className="text-xs text-muted-foreground">Nodes</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{workflow.executionCount || 0}</div>
                  <div className="text-xs text-muted-foreground">Runs</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{workflow.successRate || 0}%</div>
                  <div className="text-xs text-muted-foreground">Success</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExecuteWorkflow(workflow.id)
                  }}
                  disabled={isExecuting}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Run
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsBuilderMode(true)
                  }}
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Render workflow builder
  const renderWorkflowBuilder = () => (
    <div className="h-full flex flex-col">
      {/* Builder Toolbar */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBuilderMode(false)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Workflows
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <h2 className="text-lg font-semibold">
              {selectedWorkflow?.name || 'New Workflow'}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Code className="h-4 w-4 mr-2" />
              Code View
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleSaveWorkflow}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            
            <Button size="sm" onClick={() => selectedWorkflow && handleExecuteWorkflow(selectedWorkflow.id)}>
              <Play className="h-4 w-4 mr-2" />
              Run
            </Button>
          </div>
        </div>
      </div>

      {/* Builder Canvas */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Node Palette */}
        <ResizablePanel defaultSize={leftPanelSize} minSize={15} maxSize={35}>
          <div className="h-full border-r">
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3">Node Palette</h3>
              <Input placeholder="Search nodes..." className="mb-3" />
            </div>
            
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {Object.entries(
                  nodeTypes.reduce((acc, node) => {
                    if (!acc[node.category]) acc[node.category] = []
                    acc[node.category].push(node)
                    return acc
                  }, {} as Record<string, typeof nodeTypes>)
                ).map(([category, categoryNodes]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                      {category}
                    </h4>
                    <div className="space-y-1">
                      {categoryNodes.map((nodeType) => (
                        <div
                          key={nodeType.type}
                          className="p-2 rounded-lg border cursor-move hover:bg-muted transition-colors"
                          draggable
                          onDragStart={() => setDraggedNodeType(nodeType.type)}
                        >
                          <div className="flex items-center space-x-2">
                            <nodeType.icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{nodeType.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {nodeType.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Canvas */}
        <ResizablePanel defaultSize={100 - leftPanelSize - rightPanelSize}>
          <div 
            ref={canvasRef}
            className="h-full bg-dot-black/[0.2] dark:bg-dot-white/[0.2] relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect()
              if (rect) {
                handleNodeDrop(e, {
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top
                })
              }
            }}
          >
            {/* Render Nodes */}
            {nodes.map((node) => (
              <div
                key={node.id}
                className={cn(
                  "absolute p-3 bg-white border rounded-lg shadow-sm cursor-pointer",
                  selectedNode?.id === node.id && "ring-2 ring-primary"
                )}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  minWidth: '150px'
                }}
                onClick={() => setSelectedNode(node)}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {nodeTypes.find(nt => nt.type === node.type)?.icon && (
                    <nodeTypes.find(nt => nt.type === node.type)!.icon className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">{node.label}</span>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Status: {node.status}
                </div>

                {/* Connection Points */}
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
            ))}

            {/* Render Edges */}
            <svg className="absolute inset-0 pointer-events-none">
              {edges.map((edge) => {
                const sourceNode = nodes.find(n => n.id === edge.source)
                const targetNode = nodes.find(n => n.id === edge.target)
                
                if (!sourceNode || !targetNode) return null

                const x1 = sourceNode.position.x + 150 // Node width
                const y1 = sourceNode.position.y + 40  // Node height / 2
                const x2 = targetNode.position.x
                const y2 = targetNode.position.y + 40

                return (
                  <line
                    key={edge.id}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#888"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                )
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
                    fill="#888"
                  />
                </marker>
              </defs>
            </svg>

            {/* Empty State */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Start Building Your Workflow</h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop nodes from the palette to create your workflow
                  </p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Properties Panel */}
        <ResizablePanel defaultSize={rightPanelSize} minSize={15} maxSize={35}>
          <div className="h-full border-l">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Properties</h3>
            </div>
            
            <ScrollArea className="h-full p-4">
              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="node-name">Node Name</Label>
                    <Input
                      id="node-name"
                      value={selectedNode.label}
                      onChange={(e) => {
                        setNodes(prev => 
                          prev.map(n => 
                            n.id === selectedNode.id 
                              ? { ...n, label: e.target.value }
                              : n
                          )
                        )
                        setSelectedNode({ ...selectedNode, label: e.target.value })
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="node-description">Description</Label>
                    <Textarea
                      id="node-description"
                      value={selectedNode.data?.description || ''}
                      onChange={(e) => {
                        const updatedNode = {
                          ...selectedNode,
                          data: { ...selectedNode.data, description: e.target.value }
                        }
                        setNodes(prev => 
                          prev.map(n => n.id === selectedNode.id ? updatedNode : n)
                        )
                        setSelectedNode(updatedNode)
                      }}
                    />
                  </div>

                  {/* Node-specific configuration */}
                  <div>
                    <Label>Configuration</Label>
                    <div className="mt-2 space-y-2">
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Node-specific configuration options will appear here based on the selected node type.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a node to view its properties</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )

  // Create workflow dialog
  const CreateWorkflowDialog = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      tags: '',
      isTemplate: false
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      handleCreateWorkflow({
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      })
    }

    return (
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              Set up a new workflow for data governance automation
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Workflow Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter workflow name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="governance, automation, scan"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the workflow purpose and functionality"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="template"
                checked={formData.isTemplate}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isTemplate: checked }))}
              />
              <Label htmlFor="template">Create as template</Label>
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Workflow'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  if (isBuilderMode) {
    return renderWorkflowBuilder()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Workflow Manager</h1>
          <p className="text-muted-foreground">
            Design, execute, and monitor data governance workflows
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowTemplateDialog(true)}
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Templates
          </Button>
          
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">AI Workflow Suggestions</h3>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{suggestion.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {suggestion.description}
                  </p>
                  <Button size="sm" variant="outline" className="text-xs">
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-1 border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'canvas' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('canvas')}
              className="rounded-l-none"
            >
              <Network className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Workflows</p>
                  <p className="text-2xl font-bold">{workflows.length}</p>
                </div>
                <Workflow className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Executions</p>
                  <p className="text-2xl font-bold">{liveExecutions.size}</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{analytics.successRate || 0}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Duration</p>
                  <p className="text-2xl font-bold">{analytics.avgDuration || '0m'}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Workflows Grid */}
      <div className={cn(
        "gap-6",
        viewMode === 'grid' ? "grid md:grid-cols-2 lg:grid-cols-3" : "space-y-4"
      )}>
        <AnimatePresence>
          {filteredWorkflows.map(renderWorkflowCard)}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredWorkflows.length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <CardContent>
            <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Workflows Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? "No workflows match your search criteria."
                : "You don't have any workflows yet. Create your first workflow to get started."
              }
            </p>
            <div className="flex justify-center space-x-3">
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CreateWorkflowDialog />
    </div>
  )
}

export default JobWorkflowSpace