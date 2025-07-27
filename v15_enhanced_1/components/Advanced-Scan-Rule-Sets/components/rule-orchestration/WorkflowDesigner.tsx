"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useOrchestration } from "../../hooks/useOrchestration"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Workflow,
  Play,
  Pause,
  Stop,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Maximize,
  Minimize,
  Split,
  Merge,
  GitBranch,
  GitCommit,
  GitPullRequest,
  GitMerge,
  GitCompare,
  GitFork,
  RefreshCw,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Layers,
  Palette,
  Code,
  Database,
  Shield,
  Globe,
  Lock,
  Unlock,
  Key,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  UserCog,
  UserEdit,
  UserSettings,
  UserKey,
  UserShield,
  UserLock,
  UserUnlock,
  UserSearch,
  UserList,
  UserCheck2,
  UserX2,
  UserPlus2,
  UserMinus2,
  UserCog2,
  UserEdit2,
  UserSettings2,
  UserKey2,
  UserShield2,
  UserLock2,
  UserUnlock2,
  UserSearch2,
  UserList2,
  UserCheck3,
  UserX3,
  UserPlus3,
  UserMinus3,
  UserCog3,
  UserEdit3,
  UserSettings3,
  UserKey3,
  UserShield3,
  UserLock3,
  UserUnlock3,
  UserSearch3,
  UserList3,
} from "lucide-react"

interface WorkflowDesignerProps {
  workflowId?: string
  embedded?: boolean
}

interface WorkflowNode {
  id: string
  type: "start" | "rule" | "condition" | "action" | "end"
  name: string
  description: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  data: any
  connections: string[]
  status: "idle" | "running" | "completed" | "failed" | "error"
  metadata: {
    ruleSetId?: number
    condition?: string
    action?: string
    timeout?: number
    retryCount?: number
    priority?: string
  }
}

interface WorkflowConnection {
  id: string
  sourceNodeId: string
  targetNodeId: string
  sourcePort: string
  targetPort: string
  condition?: string
  label?: string
  type: "success" | "failure" | "conditional" | "default"
}

interface Workflow {
  id: string
  name: string
  description: string
  version: string
  status: "draft" | "active" | "paused" | "archived"
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  metadata: {
    author: string
    createdAt: string
    updatedAt: string
    tags: string[]
    category: string
    complexity: "simple" | "medium" | "complex"
    estimatedDuration: number
    maxConcurrency: number
  }
}

interface NodeTemplate {
  type: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  defaultData: any
  ports: {
    input: string[]
    output: string[]
  }
}

export const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({
  workflowId,
  embedded = false,
}) => {
  // State management
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [selectedConnection, setSelectedConnection] = useState<WorkflowConnection | null>(null)
  const [draggedNode, setDraggedNode] = useState<WorkflowNode | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<{ nodeId: string; port: string } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [showNodePanel, setShowNodePanel] = useState(true)
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true)
  const [activeTab, setActiveTab] = useState("design")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "general",
    tags: [] as string[],
    complexity: "simple" as const,
    maxConcurrency: 1,
  })

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Hooks
  const { getWorkflow, createWorkflow, updateWorkflow, deleteWorkflow, executeWorkflow } = useOrchestration()

  // Node templates
  const nodeTemplates: NodeTemplate[] = useMemo(() => [
    {
      type: "start",
      name: "Start",
      description: "Workflow entry point",
      icon: <Play className="h-4 w-4" />,
      category: "control",
      defaultData: { trigger: "manual" },
      ports: { input: [], output: ["out"] },
    },
    {
      type: "rule",
      name: "Scan Rule",
      description: "Execute a scan rule set",
      icon: <Shield className="h-4 w-4" />,
      category: "execution",
      defaultData: { ruleSetId: null, parameters: {} },
      ports: { input: ["in"], output: ["success", "failure"] },
    },
    {
      type: "condition",
      name: "Condition",
      description: "Evaluate a condition",
      icon: <GitBranch className="h-4 w-4" />,
      category: "control",
      defaultData: { expression: "", operator: "equals" },
      ports: { input: ["in"], output: ["true", "false"] },
    },
    {
      type: "action",
      name: "Action",
      description: "Perform an action",
      icon: <Code className="h-4 w-4" />,
      category: "execution",
      defaultData: { action: "", parameters: {} },
      ports: { input: ["in"], output: ["out"] },
    },
    {
      type: "end",
      name: "End",
      description: "Workflow exit point",
      icon: <Stop className="h-4 w-4" />,
      category: "control",
      defaultData: { result: "success" },
      ports: { input: ["in"], output: [] },
    },
  ], [])

  // Effects
  useEffect(() => {
    if (workflowId) {
      loadWorkflow()
    }
  }, [workflowId])

  // Helper functions
  const loadWorkflow = async () => {
    if (!workflowId) return
    setLoading(true)
    try {
      const result = await getWorkflow(workflowId)
      setWorkflow(result)
    } catch (error) {
      console.error("Error loading workflow:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWorkflow = async () => {
    setSaving(true)
    try {
      const newWorkflow = await createWorkflow({
        ...formData,
        nodes: [],
        connections: [],
      })
      setWorkflow(newWorkflow)
      setShowCreateDialog(false)
      resetForm()
    } catch (error) {
      console.error("Error creating workflow:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveWorkflow = async () => {
    if (!workflow) return
    setSaving(true)
    try {
      const updatedWorkflow = await updateWorkflow(workflow.id, workflow)
      setWorkflow(updatedWorkflow)
      setShowSaveDialog(false)
    } catch (error) {
      console.error("Error saving workflow:", error)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "general",
      tags: [],
      complexity: "simple",
      maxConcurrency: 1,
    })
  }

  const addNode = (template: NodeTemplate, position: { x: number; y: number }) => {
    if (!workflow) return

    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: template.type as any,
      name: template.name,
      description: template.description,
      position,
      size: { width: 120, height: 80 },
      data: { ...template.defaultData },
      connections: [],
      status: "idle",
      metadata: {},
    }

    setWorkflow(prev => prev ? {
      ...prev,
      nodes: [...prev.nodes, newNode],
    } : null)
  }

  const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    if (!workflow) return

    setWorkflow(prev => prev ? {
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      ),
    } : null)
  }

  const deleteNode = (nodeId: string) => {
    if (!workflow) return

    setWorkflow(prev => prev ? {
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(conn => 
        conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
      ),
    } : null)
  }

  const addConnection = (sourceNodeId: string, targetNodeId: string, sourcePort: string, targetPort: string) => {
    if (!workflow) return

    const newConnection: WorkflowConnection = {
      id: `conn_${Date.now()}`,
      sourceNodeId,
      targetNodeId,
      sourcePort,
      targetPort,
      type: "default",
    }

    setWorkflow(prev => prev ? {
      ...prev,
      connections: [...prev.connections, newConnection],
    } : null)
  }

  const deleteConnection = (connectionId: string) => {
    if (!workflow) return

    setWorkflow(prev => prev ? {
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== connectionId),
    } : null)
  }

  const handleNodeDragStart = (node: WorkflowNode) => {
    setDraggedNode(node)
  }

  const handleNodeDrag = (nodeId: string, position: { x: number; y: number }) => {
    updateNode(nodeId, { position })
  }

  const handleNodeDragEnd = () => {
    setDraggedNode(null)
  }

  const handleConnectionStart = (nodeId: string, port: string) => {
    setIsConnecting(true)
    setConnectionStart({ nodeId, port })
  }

  const handleConnectionEnd = (nodeId: string, port: string) => {
    if (isConnecting && connectionStart && connectionStart.nodeId !== nodeId) {
      addConnection(connectionStart.nodeId, nodeId, connectionStart.port, port)
    }
    setIsConnecting(false)
    setConnectionStart(null)
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1))
  const handleZoomReset = () => setZoom(1)

  const getNodeIcon = (type: string) => {
    const template = nodeTemplates.find(t => t.type === type)
    return template?.icon || <Workflow className="h-4 w-4" />
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case "start": return "bg-green-100 border-green-300 text-green-800"
      case "end": return "bg-red-100 border-red-300 text-red-800"
      case "rule": return "bg-blue-100 border-blue-300 text-blue-800"
      case "condition": return "bg-yellow-100 border-yellow-300 text-yellow-800"
      case "action": return "bg-purple-100 border-purple-300 text-purple-800"
      default: return "bg-gray-100 border-gray-300 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-blue-500"
      case "completed": return "bg-green-500"
      case "failed": return "bg-red-500"
      case "error": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  // Render functions
  const renderNode = (node: WorkflowNode) => (
    <div
      key={node.id}
      className={`absolute border-2 rounded-lg p-3 cursor-move ${getNodeColor(node.type)} ${
        selectedNode?.id === node.id ? "ring-2 ring-blue-500" : ""
      }`}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: node.size.width,
        height: node.size.height,
        transform: `scale(${zoom})`,
      }}
      onMouseDown={() => setSelectedNode(node)}
      onDragStart={() => handleNodeDragStart(node)}
    >
      <div className="flex items-center gap-2 mb-2">
        {getNodeIcon(node.type)}
        <span className="text-sm font-medium truncate">{node.name}</span>
        <div className={`w-2 h-2 rounded-full ${getStatusColor(node.status)}`} />
      </div>
      <div className="text-xs text-gray-600 truncate">{node.description}</div>
      
      {/* Input ports */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
        {nodeTemplates.find(t => t.type === node.type)?.ports.input.map(port => (
          <div
            key={port}
            className="w-3 h-3 bg-blue-500 rounded-full cursor-crosshair"
            onMouseDown={() => handleConnectionEnd(node.id, port)}
          />
        ))}
      </div>
      
      {/* Output ports */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2">
        {nodeTemplates.find(t => t.type === node.type)?.ports.output.map(port => (
          <div
            key={port}
            className="w-3 h-3 bg-green-500 rounded-full cursor-crosshair"
            onMouseDown={() => handleConnectionStart(node.id, port)}
          />
        ))}
      </div>
    </div>
  )

  const renderConnection = (connection: WorkflowConnection) => {
    const sourceNode = workflow?.nodes.find(n => n.id === connection.sourceNodeId)
    const targetNode = workflow?.nodes.find(n => n.id === connection.targetNodeId)
    
    if (!sourceNode || !targetNode) return null

    const startX = sourceNode.position.x + sourceNode.size.width
    const startY = sourceNode.position.y + sourceNode.size.height / 2
    const endX = targetNode.position.x
    const endY = targetNode.position.y + targetNode.size.height / 2

    return (
      <g key={connection.id}>
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={selectedConnection?.id === connection.id ? "#3b82f6" : "#6b7280"}
          strokeWidth={2}
          markerEnd="url(#arrowhead)"
          className="cursor-pointer"
          onClick={() => setSelectedConnection(connection)}
        />
        {connection.label && (
          <text
            x={(startX + endX) / 2}
            y={(startY + endY) / 2}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            {connection.label}
          </text>
        )}
      </g>
    )
  }

  const renderNodePanel = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Node Library</CardTitle>
        <CardDescription>Drag nodes to the canvas</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {nodeTemplates.map(template => (
              <div
                key={template.type}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-move hover:bg-gray-50"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("nodeType", template.type)
                }}
              >
                {template.icon}
                <div>
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-gray-500">{template.description}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )

  const renderPropertiesPanel = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Properties</CardTitle>
        <CardDescription>
          {selectedNode ? "Node properties" : selectedConnection ? "Connection properties" : "Select an element"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedNode ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={selectedNode.name}
                onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={selectedNode.description}
                onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={selectedNode.status}
                onValueChange={(value: any) => updateNode(selectedNode.id, { status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idle">Idle</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                deleteNode(selectedNode.id)
                setSelectedNode(null)
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Node
            </Button>
          </div>
        ) : selectedConnection ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select
                value={selectedConnection.type}
                onValueChange={(value: any) => {
                  if (!workflow) return
                  setWorkflow(prev => prev ? {
                    ...prev,
                    connections: prev.connections.map(conn => 
                      conn.id === selectedConnection.id ? { ...conn, type: value } : conn
                    ),
                  } : null)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                  <SelectItem value="conditional">Conditional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Label</label>
              <Input
                value={selectedConnection.label || ""}
                onChange={(e) => {
                  if (!workflow) return
                  setWorkflow(prev => prev ? {
                    ...prev,
                    connections: prev.connections.map(conn => 
                      conn.id === selectedConnection.id ? { ...conn, label: e.target.value } : conn
                    ),
                  } : null)
                }}
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                deleteConnection(selectedConnection.id)
                setSelectedConnection(null)
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Connection
            </Button>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Select a node or connection to edit properties
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className={`space-y-4 ${embedded ? "p-0" : "p-6"}`}>
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Workflow className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Workflow Designer</h1>
              <p className="text-muted-foreground">
                Visual workflow design and orchestration for scan rule sets
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </Button>
            <Button variant="outline" onClick={() => setShowSaveDialog(true)}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Execute
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex h-[600px] gap-4">
        {/* Left Panel - Node Library */}
        {showNodePanel && (
          <div className="w-64 flex-shrink-0">
            {renderNodePanel()}
          </div>
        )}

        {/* Center - Canvas */}
        <div className="flex-1 relative border rounded-lg overflow-hidden bg-gray-50">
          {/* Canvas Toolbar */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white rounded-lg shadow-lg p-2">
            <Button size="sm" variant="outline" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleZoomReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button size="sm" variant="outline" onClick={() => setShowNodePanel(!showNodePanel)}>
              {showNodePanel ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}>
              {showPropertiesPanel ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>

          {/* Canvas */}
          <div
            ref={canvasRef}
            className="w-full h-full relative"
            onDrop={(e) => {
              e.preventDefault()
              const nodeType = e.dataTransfer.getData("nodeType")
              const template = nodeTemplates.find(t => t.type === nodeType)
              if (template && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect()
                const x = (e.clientX - rect.left - pan.x) / zoom
                const y = (e.clientY - rect.top - pan.y) / zoom
                addNode(template, { x, y })
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => {
              setSelectedNode(null)
              setSelectedConnection(null)
            }}
          >
            {/* SVG for connections */}
            <svg
              ref={svgRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                </marker>
              </defs>
              {workflow?.connections.map(renderConnection)}
            </svg>

            {/* Nodes */}
            {workflow?.nodes.map(renderNode)}
          </div>
        </div>

        {/* Right Panel - Properties */}
        {showPropertiesPanel && (
          <div className="w-64 flex-shrink-0">
            {renderPropertiesPanel()}
          </div>
        )}
      </div>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              Create a new workflow for scan rule orchestration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workflow name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter workflow description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="data-quality">Data Quality</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Complexity</label>
              <Select
                value={formData.complexity}
                onValueChange={(value: "simple" | "medium" | "complex") => 
                  setFormData(prev => ({ ...prev, complexity: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="complex">Complex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkflow} disabled={saving}>
              {saving ? "Creating..." : "Create Workflow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Workflow Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Workflow</DialogTitle>
            <DialogDescription>
              Save the current workflow changes
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveWorkflow} disabled={saving}>
              {saving ? "Saving..." : "Save Workflow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}