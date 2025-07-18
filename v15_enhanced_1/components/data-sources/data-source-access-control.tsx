"use client"

import { useState, useEffect, useMemo } from "react"
import { useDataSourceAccessControlQuery } from "@/hooks/useDataSources"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, UserCheck, Shield, Lock, Unlock, Plus, Edit, Trash2, Search } from "lucide-react"

import { useAccessControlQuery } from "./services/apis"
import { DataSource } from "./types"

interface AccessControlProps {
  dataSource: DataSource
  onNavigateToComponent?: (componentId: string, data?: any) => void
  className?: string
}

interface UserPermission {
  id: string
  userId: string
  username: string
  email: string
  role: "admin" | "read" | "write" | "execute"
  permissions: string[]
  grantedAt: string
  grantedBy: string
  expiresAt?: string
  status: "active" | "expired" | "revoked"
}

export function DataSourceAccessControl({
  dataSource,
  onNavigateToComponent,
  className = ""}: AccessControlProps) {
  const [permissions, setPermissions] = useState<UserPermission[]>([])
  const [selectedPermission, setSelectedPermission] = useState<UserPermission | null>(null)
  const showAddPermission, setShowAddPermission] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [object Object] data: accessData, isLoading, error, refetch } = useAccessControlQuery(dataSource.id)

  // Enterprise features integration
  const enterpriseFeatures = useEnterpriseFeatures({
    componentName: 'DataSourceAccessControl',
    dataSourceId: dataSource.id,
    enableAnalytics: true,
    enableRealTimeUpdates: true,
    enableNotifications: true,
    enableAuditLogging: true
  })

  // Backend data queries
  const { data: permissionsData, isLoading, error, refetch } = useAccessControlQuery(dataSource.id)

  // Transform backend data to component format
  const permissions: UserPermission[] = useMemo(() => {
    if (!permissionsData) return []
    
    return permissionsData.map(permission => ({
      id: permission.id,
      userId: permission.user_id,
      userName: permission.user_name,
      userEmail: permission.user_email,
      role: permission.role || 'viewer',
      permissions: permission.permissions || [],
      grantedAt: new Date(permission.granted_at),
      grantedBy: permission.granted_by || 'System',
      expiresAt: permission.expires_at ? new Date(permission.expires_at) : null,
      status: permission.status || 'active'
    }))
  }, [permissionsData])

  // Remove mock data
    {
      id: "1",
      userId: "user-1",
      username: "john.doe",
      email: "john.doe@company.com",
      role: "admin",
      permissions: ["read", "write", "execute", "delete"],
      grantedAt: "2024-01-01T10:00:00Z",
      grantedBy: "system-admin",
      status: "active"
    },
    {
      id: "2",
      userId: "user-2",
      username: "jane.smith",
      email: "jane.smith@company.com",
      role: "write",
      permissions: ["read", "execute"],
      grantedAt: "2024-01-01T10:00:00Z",
      grantedBy: "john.doe",
      status: "active"
    }
  ]), [])

  useEffect(() => {
    setPermissions(mockPermissions)
  }, [mockPermissions])

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "text-red-600 bg-red-50"
      case "write": return "text-orange-600 bg-orange-50"
      case "read": return "text-blue-600 bg-blue-50"
      case "execute": return "text-green-600 bg-green-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-50"
      case "expired": return "text-yellow-600 bg-yellow-50"
      case "revoked": return "text-red-600 bg-red-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const filteredPermissions = useMemo(() => {
    return permissions.filter(permission => {
      const matchesSearch = !searchTerm ||
        permission.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.role.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [permissions, searchTerm])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 <Shield className="h-6 text-blue-600">
            Access Control
          </h2>
          <p className="text-muted-foreground">
            Manage user permissions and access rights for {dataSource.name}
          </p>
        </div>
        <Button onClick={() => setShowAddPermission(true)}>
          <Plus className="h-4 w-4 mr-2" />    Add Permission
        </Button>
      </div>

      {/* Access Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              With access rights
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.filter(p => p.status === "active").length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admin Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.filter(p => p.role === "admin").length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Full access
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expired Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.filter(p => p.status === "expired").length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Need renewal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Permissions List */}
      <Card>
        <CardHeader>
          <CardTitle>User Permissions</CardTitle>
          <CardDescription>
            Manage user access and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredPermissions.map((permission) => (
              <div key={permission.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{permission.username}</h3>
                      <Badge className={getRoleColor(permission.role)}>
                        {permission.role}
                      </Badge>
                      <Badge className={getStatusColor(permission.status)}>
                        {permission.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {permission.email}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Granted: {new Date(permission.grantedAt).toLocaleDateString()}</span>
                      <span>By: {permission.grantedBy}</span>
                      {permission.expiresAt && (
                        <span>Expires: {new Date(permission.expiresAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {permission.permissions.map((perm) => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPermission(permission)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPermissions(permissions.filter(p => p.id !== permission.id))
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Permission Dialog */}
      <Dialog open={showAddPermission} onOpenChange={setShowAddPermission}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User Permission</DialogTitle>
            <DialogDescription>
              Grant access to a user for this data source
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-email">User Email</Label>
              <Input id="user-email" placeholder="Enter user email" />
            </div>
            <div>
              <Label htmlFor="user-role">Role</Label>
              <select id="user-role" className="w-full px-3 py-2 border rounded-md">
                <option value="read">Read Only</option>
                <option value="write">Read & Write</option>
                <option value="execute">Execute</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <Label htmlFor="expires-at">Expires At (Optional)</Label>
              <Input id="expires-at" type="datetime-local" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPermission(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddPermission(false)}>
              Grant Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permission Dialog */}
      <Dialog open={!!selectedPermission} onOpenChange={() => setSelectedPermission(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Permission</DialogTitle>
            <DialogDescription>
              Modify user access permissions
            </DialogDescription>
          </DialogHeader>
          {selectedPermission && (
            <div className="space-y-4">
              <div>
                <Label>User</Label>
                <p className="text-sm">{selectedPermission.username} ({selectedPermission.email})</p>
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <select id="edit-role" className="w-full px-3 py-2 border rounded-md">
                  <option value="read" selected={selectedPermission.role === "read"}>Read Only</option>
                  <option value="write" selected={selectedPermission.role === "write"}>Read & Write</option>
                  <option value="execute" selected={selectedPermission.role === "execute"}>Execute</option>
                  <option value="admin" selected={selectedPermission.role === "admin"}>Admin</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-expires">Expires At</Label>
                <Input 
                  id="edit-expires" 
                  type="datetime-local"
                  defaultValue={selectedPermission.expiresAt?.slice(0, 16)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPermission(null)}>
              Cancel
            </Button>
            <Button onClick={() => setSelectedPermission(null)}>
              Update Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}