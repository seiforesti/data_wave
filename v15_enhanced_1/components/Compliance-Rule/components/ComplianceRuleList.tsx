"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowUpDown,
  Edit,
  Trash2,
  Eye,
  PlusCircle,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  Info,
  MoreHorizontal,
  Search,
  Filter
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Enterprise Integration
import { ComplianceHooks } from '../hooks/use-enterprise-features'
import { useEnterpriseCompliance } from '../enterprise-integration'
import { ComplianceAPIs } from '../services/enterprise-apis'
import type { 
  ComplianceRequirement, 
  ComplianceListProps,
  TableColumn 
} from '../types'

const ComplianceRuleList: React.FC<ComplianceListProps> = ({
  dataSourceId,
  searchQuery: initialSearchQuery = '',
  filters: initialFilters = {},
  onRefresh,
  onError,
  className = '',
  items,
  loading: externalLoading,
  onItemSelect,
  onItemEdit,
  onItemDelete,
  columns
}) => {
  const enterprise = useEnterpriseCompliance()
  
  // Enterprise hooks
  const enterpriseFeatures = ComplianceHooks.useEnterpriseFeatures({
    componentName: 'ComplianceRuleList',
    dataSourceId
  })
  
  const auditFeatures = ComplianceHooks.useAuditFeatures('compliance_requirement')
  
  // State
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [filters, setFilters] = useState(initialFilters)
  const [sortField, setSortField] = useState<string>('updated_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ComplianceRequirement | null>(null)
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0
  })

  // Mock data for clean output
  const mockRequirements: ComplianceRequirement[] = [
    {
      id: 1,
      data_source_id: dataSourceId || 1,
      framework: 'SOC 2',
      requirement_id: 'CC1.1',
      title: 'Control Environment',
      description: 'The entity demonstrates a commitment to integrity and ethical values',
      category: 'Control Environment',
      status: 'compliant',
      compliance_percentage: 95,
      last_assessed: '2024-01-15T10:00:00Z',
      next_assessment: '2024-04-15T10:00:00Z',
      assessor: 'John Smith',
      assessment_notes: 'All controls are operating effectively',
      risk_level: 'low',
      remediation_plan: null,
      remediation_deadline: null,
      remediation_owner: null,
      evidence_files: ['control_environment_policy.pdf', 'ethics_training_records.xlsx'],
      documentation_links: ['https://company.com/policies/ethics'],
      impact_description: 'Ensures ethical behavior across the organization',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      created_by: 'admin',
      updated_by: 'john.smith',
      version: 1,
      tags: ['ethics', 'control_environment'],
      controls: [],
      gaps: [],
      evidence: [],
      metadata: {}
    },
    {
      id: 2,
      data_source_id: dataSourceId || 1,
      framework: 'GDPR',
      requirement_id: 'Art.32',
      title: 'Security of Processing',
      description: 'Implement appropriate technical and organizational measures',
      category: 'Security',
      status: 'partially_compliant',
      compliance_percentage: 75,
      last_assessed: '2024-01-10T14:30:00Z',
      next_assessment: '2024-02-10T14:30:00Z',
      assessor: 'Jane Doe',
      assessment_notes: 'Some security measures need improvement',
      risk_level: 'medium',
      remediation_plan: 'Implement additional encryption controls',
      remediation_deadline: '2024-03-01T00:00:00Z',
      remediation_owner: 'security-team',
      evidence_files: ['security_policy.pdf'],
      documentation_links: ['https://company.com/security'],
      impact_description: 'Protects personal data from unauthorized access',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-10T14:30:00Z',
      created_by: 'admin',
      updated_by: 'jane.doe',
      version: 2,
      tags: ['security', 'encryption'],
      controls: [],
      gaps: [],
      evidence: [],
      metadata: {}
    },
    {
      id: 3,
      data_source_id: dataSourceId || 1,
      framework: 'HIPAA',
      requirement_id: '164.312(a)(1)',
      title: 'Access Control',
      description: 'Implement technical safeguards to allow access only to authorized persons',
      category: 'Access Control',
      status: 'non_compliant',
      compliance_percentage: 45,
      last_assessed: '2024-01-05T09:15:00Z',
      next_assessment: '2024-02-05T09:15:00Z',
      assessor: 'Mike Johnson',
      assessment_notes: 'Access controls are insufficient',
      risk_level: 'high',
      remediation_plan: 'Implement role-based access control system',
      remediation_deadline: '2024-02-15T00:00:00Z',
      remediation_owner: 'it-team',
      evidence_files: [],
      documentation_links: [],
      impact_description: 'Critical for protecting PHI',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-05T09:15:00Z',
      created_by: 'admin',
      updated_by: 'mike.johnson',
      version: 1,
      tags: ['access_control', 'phi'],
      controls: [],
      gaps: [],
      evidence: [],
      metadata: {}
    }
  ]

  // Load requirements
  useEffect(() => {
    const loadRequirements = async () => {
      setLoading(true)
      try {
        // Use mock data for clean output
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
        setRequirements(mockRequirements)
        setPagination(prev => ({ ...prev, total: mockRequirements.length }))
      } catch (error) {
        console.error('Failed to load requirements:', error)
        onError?.('Failed to load compliance requirements')
      } finally {
        setLoading(false)
      }
    }

    loadRequirements()
  }, [dataSourceId, searchQuery, filters, sortField, sortDirection, pagination.page, pagination.limit])

  // Filter and sort requirements
  const filteredAndSortedRequirements = useMemo(() => {
    let filtered = requirements

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(req =>
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.framework.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requirement_id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply other filters
    if (filters.framework) {
      filtered = filtered.filter(req => req.framework === filters.framework)
    }
    if (filters.status) {
      filtered = filtered.filter(req => req.status === filters.status)
    }
    if (filters.risk_level) {
      filtered = filtered.filter(req => req.risk_level === filters.risk_level)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField as keyof ComplianceRequirement]
      const bValue = b[sortField as keyof ComplianceRequirement]
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [requirements, searchQuery, filters, sortField, sortDirection])

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!itemToDelete) return

    try {
      await ComplianceAPIs.Management.deleteRequirement(itemToDelete.id as number)
      setRequirements(prev => prev.filter(req => req.id !== itemToDelete.id))
      enterprise.sendNotification('success', 'Requirement deleted successfully')
      onItemDelete?.(itemToDelete)
    } catch (error) {
      console.error('Failed to delete requirement:', error)
      enterprise.sendNotification('error', 'Failed to delete requirement')
    } finally {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'default'
      case 'partially_compliant':
        return 'secondary'
      case 'non_compliant':
        return 'destructive'
      case 'not_assessed':
        return 'outline'
      case 'in_progress':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  // Get risk level badge variant
  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Compliance Requirements</h3>
          <p className="text-sm text-muted-foreground">
            Manage and track compliance requirements across frameworks
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Requirement
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filters.framework || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, framework: value || undefined }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Frameworks</SelectItem>
              <SelectItem value="SOC 2">SOC 2</SelectItem>
              <SelectItem value="GDPR">GDPR</SelectItem>
              <SelectItem value="HIPAA">HIPAA</SelectItem>
              <SelectItem value="PCI DSS">PCI DSS</SelectItem>
              <SelectItem value="ISO 27001">ISO 27001</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.status || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value || undefined }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="compliant">Compliant</SelectItem>
              <SelectItem value="partially_compliant">Partially Compliant</SelectItem>
              <SelectItem value="non_compliant">Non-Compliant</SelectItem>
              <SelectItem value="not_assessed">Not Assessed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.risk_level || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, risk_level: value || undefined }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Risks</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredAndSortedRequirements.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(filteredAndSortedRequirements.map(req => req.id.toString()))
                    } else {
                      setSelectedItems([])
                    }
                  }}
                />
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('requirement_id')}
              >
                <div className="flex items-center space-x-1">
                  <span>ID</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center space-x-1">
                  <span>Title</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('framework')}
              >
                <div className="flex items-center space-x-1">
                  <span>Framework</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('compliance_percentage')}
              >
                <div className="flex items-center space-x-1">
                  <span>Compliance</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('risk_level')}
              >
                <div className="flex items-center space-x-1">
                  <span>Risk</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('last_assessed')}
              >
                <div className="flex items-center space-x-1">
                  <span>Last Assessed</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading || externalLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 9 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredAndSortedRequirements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <Info className="h-8 w-8 mx-auto mb-2" />
                    <p>No compliance requirements found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedRequirements.map((requirement) => (
                <motion.tr
                  key={requirement.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => onItemSelect?.(requirement)}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(requirement.id.toString())}
                      onChange={(e) => {
                        e.stopPropagation()
                        if (e.target.checked) {
                          setSelectedItems(prev => [...prev, requirement.id.toString()])
                        } else {
                          setSelectedItems(prev => prev.filter(id => id !== requirement.id.toString()))
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {requirement.requirement_id}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{requirement.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {requirement.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{requirement.framework}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(requirement.status)}>
                      {requirement.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${requirement.compliance_percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium min-w-[3rem]">
                        {requirement.compliance_percentage}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRiskBadgeVariant(requirement.risk_level)}>
                      {requirement.risk_level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {requirement.last_assessed ? 
                      new Date(requirement.last_assessed).toLocaleDateString() : 
                      'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          onItemSelect?.(requirement)
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          onItemEdit?.(requirement)
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            setItemToDelete(requirement)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedRequirements.length} of {pagination.total} requirements
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Requirement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ComplianceRuleList
