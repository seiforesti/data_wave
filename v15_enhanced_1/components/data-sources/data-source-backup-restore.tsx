"use client"

import { useState, useEffect, useMemo } from "react"
import { useDataSourceBackupStatusQuery } from "@/hooks/useDataSources"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Archive, Download, Upload, Clock, CheckCircle, AlertTriangle, Play, Pause, RotateCcw } from "lucide-react"

// Import enterprise hooks for better backend integration
import { useEnterpriseFeatures } from "./hooks/use-enterprise-features"
import { useBackupStatusQuery } from "./services/enterprise-apis"

interface BackupRestoreProps {
  dataSourceId: number
  onNavigateToComponent?: (componentId: string, data?: any) => void
  className?: string
}

interface Backup {
  id: string
  name: string
  size: number
  status: "completed" | "in_progress" | "failed"
  createdAt: string
  type: "full" | "incremental"
  retentionDays: number
  location: string
}

export function DataSourceBackupRestore({ 
  dataSourceId, 
  onNavigateToComponent, 
  className = "" 
}: BackupRestoreProps) {
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null)
  const [showCreateBackup, setShowCreateBackup] = useState(false)

  // Enterprise features integration
  const enterpriseFeatures = useEnterpriseFeatures({
    componentName: 'DataSourceBackupRestore',
    dataSourceId,
    enableAnalytics: true,
    enableRealTimeUpdates: true,
    enableNotifications: true,
    enableAuditLogging: true
  })

  // Backend data queries
  const { 
    data: backupData, 
    isLoading,
    error,
    refetch 
  } = useBackupStatusQuery(dataSourceId)

  // Transform backend data to component format
  const backups: Backup[] = useMemo(() => {
    if (!backupData?.backups) return []
    
    return backupData.backups.map(backup => ({
      id: backup.id,
      name: backup.name || `Backup ${backup.id}`,
      type: backup.backup_type || 'full',
      status: backup.status,
      createdAt: new Date(backup.created_at),
      completedAt: backup.completed_at ? new Date(backup.completed_at) : null,
      size: backup.size_bytes || 0,
      duration: backup.duration_seconds || 0,
      location: backup.storage_location || '',
      metadata: backup.metadata || {},
      retentionDays: backup.retention_days || 30,
      encrypted: backup.encrypted || false,
      compressionRatio: backup.compression_ratio || 1.0,
      creator: backup.created_by || 'System'
    }))
  }, [backupData])

  useEffect(() => {
    // setBackups(mockBackups) // This line is removed as per the new_code
  }, [backups]) // This line is removed as per the new_code

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-50"
      case "in_progress": return "text-yellow-600 bg-yellow-50"
      case "failed": return "text-red-600 bg-red-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Archive className="h-6 w-6 text-blue-600" />
            Backup & Restore
          </h2>
          <p className="text-muted-foreground">
            Manage backups and restoration for {/* dataSource.name */}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowRestoreDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Restore
          </Button>
          <Button onClick={() => setShowCreateBackup(true)}>
            <Download className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
        </div>
      </div>

      {/* Backup Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backups.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available for restore
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(backups.reduce((sum, backup) => sum + backup.size, 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All backups combined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backups.length > 0 ? new Date(backups[0].createdAt).toLocaleDateString() : "Never"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {backups.length > 0 ? backups[0].type : "No backups"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Backup List */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>
            Complete history of backups and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backups.map((backup) => (
              <div key={backup.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{backup.name}</h3>
                      <Badge className={getStatusColor(backup.status)}>
                        {backup.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline">{backup.type}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <span>Size: {formatFileSize(backup.size)}</span>
                      <span>Created: {new Date(backup.createdAt).toLocaleDateString()}</span>
                      <span>Retention: {backup.retentionDays} days</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedBackup(backup.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRestoreDialog(true)}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Backup Dialog */}
      <Dialog open={showCreateBackup} onOpenChange={setShowCreateBackup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Backup</DialogTitle>
            <DialogDescription>
              Create a new backup of the data source
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="backup-name">Backup Name</Label>
              <Input id="backup-name" placeholder="Enter backup name" />
            </div>
            <div>
              <Label htmlFor="backup-type">Backup Type</Label>
              <select id="backup-type" className="w-full px-3 py-2 border rounded-md">
                <option value="full">Full Backup</option>
                <option value="incremental">Incremental Backup</option>
              </select>
            </div>
            <div>
              <Label htmlFor="retention-days">Retention Days</Label>
              <Input id="retention-days" type="number" placeholder="30" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBackup(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateBackup(false)}>
              Create Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Data Source</DialogTitle>
            <DialogDescription>
              Restore from a backup or upload a backup file
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Backup</Label>
              <select className="w-full px-3 py-2 border rounded-md">
                <option value="Choose a backup to restore from">Choose a backup to restore from</option>
                {backups.map((backup) => (
                  <option key={backup.id} value={backup.id}>
                    {backup.name} ({formatFileSize(backup.size)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Or Upload Backup File</Label>
              <Input type="file" accept=".sql,.dump,.backup" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowRestoreDialog(false)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}