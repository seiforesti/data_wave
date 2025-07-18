"use client"

import { useState, useEffect, useMemo } from "react"
import { useDataSourceVersionHistoryQuery } from "@/hooks/useDataSources"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { GitBranch, Clock, User, FileText, Download, Eye, RotateCcw, Plus } from "lucide-react"

import { DataSource } from "./types"

interface VersionHistoryProps {
  dataSource: DataSource
  onNavigateToComponent?: (componentId: string, data?: any) => void
  className?: string
}

interface Version {
  id: string
  version: string
  description: string
  changes: string[]
  author: string
  timestamp: string
  type: "major" | "minor" | "patch"
  status: "active" | "deprecated" | "draft"
}

export function DataSourceVersionHistory({
  dataSource,
  onNavigateToComponent,
  className = ""}: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const [showCreateVersion, setShowCreateVersion] = useState(false)

  // Use API hook to fetch version history
  const { 
    data: versionResponse, 
    isLoading, 
    error, 
    refetch 
  } = useDataSourceVersionHistoryQuery(dataSource.id)

  const versions = versionResponse?.data?.versions || []

  // Mock data for fallback
  const mockVersions: Version[] = useMemo(() => ([
    {
      id: "1",
      version: "2.1.0",
      description: "Added new encryption features and performance improvements",
      changes: [
        "Implemented AES-256cryption",
        "Added connection pooling",
        "Improved query performance by 25%",
        "Fixed memory leak in connection handling"
      ],
      author: "john.doe",
      timestamp: "2024-01-10T10:30:00",
      type: "minor",
      status: "active"
    },
    {
      id: "2",
      version: "2.0.0",
      description: "Major refactor with new API and improved security",
      changes: [
        "Complete API redesign",
        "Enhanced security protocols",
        "Added multi-factor authentication",
        "Improved error handling"
      ],
      author: "jane.smith",
      timestamp: "2024-01-09T09:00:00",
      type: "major",
      status: "active"
    },
    {
      id: "3",
      version: "1.9.2",
      description: "Bug fixes and minor improvements",
      changes: [
        "Fixed connection timeout issues",
        "Updated dependencies",
        "Improved logging"
      ],
      author: "mike.wilson",
      timestamp: "2023-12-14T14:15:00",
      type: "patch",
      status: "deprecated"
    }
  ]), [])

  // Remove useEffect since we're using the API hook directly

  // Use API data if available, otherwise fallback to mock data
  const displayVersions = versions.length > 0 ? versions : []

  const getVersionTypeColor = (type: string) => {
    switch (type) {
      case "major": return "text-red-600 bg-red-50"
      case "minor": return "text-yellow-600 bg-yellow-50"
      case "patch": return "text-blue-600 bg-blue-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-50"
      case "deprecated": return "text-gray-600 bg-gray-50"
      case "draft": return "text-yellow-600 bg-yellow-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-blue-600" />
            Version History
          </h2>
          <p className="text-muted-foreground">
            Track changes and version history for {dataSource.name}
          </p>
        </div>
        <Button onClick={() => setShowCreateVersion(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Version
        </Button>
      </div>

      {/* Version List */}
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
          <CardDescription>
            Complete history of changes and versions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {displayVersions.map((version) => (
              <div key={version.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">v{version.version}</h3>
                      <Badge className={getVersionTypeColor(version.type)}>
                        {version.type}
                      </Badge>
                      <Badge className={getStatusColor(version.status)}>
                        {version.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {version.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {version.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(version.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedVersion(version)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Version Details Dialog */}
      <Dialog open={!!selectedVersion} onOpenChange={() => setSelectedVersion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version Details - v{selectedVersion?.version}</DialogTitle>
            <DialogDescription>
              Detailed information about this version
            </DialogDescription>
          </DialogHeader>
          {selectedVersion && (
            <div className="space-y-4">
              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1">{selectedVersion.description}</p>
              </div>
              <div>
                <Label>Changes</Label>
                <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                  {selectedVersion.changes.map((change, index) => (
                    <li key={index}>{change}</li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Author</Label>
                  <p className="text-sm">{selectedVersion.author}</p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p className="text-sm">{new Date(selectedVersion.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="text-sm capitalize">{selectedVersion.type}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="text-sm capitalize">{selectedVersion.status}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedVersion(null)}>
              Close
            </Button>
            <Button>
              <RotateCcw className="h-4 w-4 mr-2" />
              Rollback to This Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Version Dialog */}
      <Dialog open={showCreateVersion} onOpenChange={setShowCreateVersion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
            <DialogDescription>
              Create a new version with your changes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="version-number">Version Number</Label>
              <Input id="version-number" placeholder="e.g., 2.20" />
            </div>
            <div>
              <Label htmlFor="version-description">Description</Label>
              <Input id="version-description" placeholder="Brief description of changes" />
            </div>
            <div>
              <Label htmlFor="version-type">Version Type</Label>
              <select id="version-type" className="w-full px-3 py-2 border rounded-md">
                <option value="patch">Patch (Bug fixes)</option>
                <option value="minor">Minor (New features)</option>
                <option value="major">Major (Breaking changes)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateVersion(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateVersion(false)}>
              Create Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}