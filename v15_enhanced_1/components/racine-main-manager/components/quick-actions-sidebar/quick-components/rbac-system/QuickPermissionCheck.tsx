'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Search, Shield, CheckCircle, XCircle, AlertTriangle, X, Eye, Lock, Unlock } from 'lucide-react';

interface QuickPermissionCheckProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const QuickPermissionCheck: React.FC<QuickPermissionCheckProps> = ({
  isVisible, onClose, className = '',
}) => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [checkResult, setCheckResult] = useState<any>(null);

  const users = [
    { id: '1', name: 'John Doe', email: 'john@company.com', role: 'Analyst' },
    { id: '2', name: 'Jane Smith', email: 'jane@company.com', role: 'Admin' },
    { id: '3', name: 'Mike Johnson', email: 'mike@company.com', role: 'Viewer' },
  ];

  const resources = [
    { id: 'catalog:read', name: 'Read Catalog', category: 'Catalog' },
    { id: 'catalog:write', name: 'Modify Catalog', category: 'Catalog' },
    { id: 'scan:execute', name: 'Execute Scans', category: 'Scanning' },
    { id: 'admin:users', name: 'Manage Users', category: 'Administration' },
  ];

  const handlePermissionCheck = () => {
    if (selectedUser && selectedResource) {
      const user = users.find(u => u.id === selectedUser);
      const resource = resources.find(r => r.id === selectedResource);
      
      // Mock permission check logic
      const hasPermission = user?.role === 'Admin' || 
                           (user?.role === 'Analyst' && !selectedResource.includes('admin')) ||
                           (user?.role === 'Viewer' && selectedResource.includes('read'));
      
      setCheckResult({
        user: user?.name,
        resource: resource?.name,
        hasPermission,
        reason: hasPermission ? 'User has required role' : 'Insufficient permissions',
        details: [
          { permission: 'catalog:read', granted: true },
          { permission: 'catalog:write', granted: user?.role !== 'Viewer' },
          { permission: 'scan:execute', granted: user?.role === 'Admin' || user?.role === 'Analyst' },
          { permission: 'admin:users', granted: user?.role === 'Admin' },
        ]
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  if (!isVisible) return null;

  return (
    <TooltipProvider>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`bg-white rounded-xl shadow-xl border border-gray-200 ${className}`}
        style={{ width: '420px', maxHeight: '85vh' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Permission Check</h2>
              <p className="text-sm text-gray-500">Validate user access</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Check Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{user.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {user.role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Resource/Permission</Label>
                <Select value={selectedResource} onValueChange={setSelectedResource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{resource.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {resource.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handlePermissionCheck}
                disabled={!selectedUser || !selectedResource}
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                Check Permission
              </Button>
            </CardContent>
          </Card>

          {checkResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  {checkResult.hasPermission ? (
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                  )}
                  Permission Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`p-3 rounded-lg ${checkResult.hasPermission ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{checkResult.user}</div>
                      <div className="text-xs text-gray-500">{checkResult.resource}</div>
                    </div>
                    <Badge variant={checkResult.hasPermission ? 'default' : 'destructive'}>
                      {checkResult.hasPermission ? 'Granted' : 'Denied'}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    Reason: {checkResult.reason}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Detailed Permissions</h4>
                  <ScrollArea className="h-32">
                    <div className="space-y-1">
                      {checkResult.details.map((detail: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                          <div className="flex items-center space-x-2">
                            {detail.granted ? (
                              <Unlock className="h-3 w-3 text-green-500" />
                            ) : (
                              <Lock className="h-3 w-3 text-red-500" />
                            )}
                            <span>{detail.permission}</span>
                          </div>
                          <Badge variant={detail.granted ? 'default' : 'secondary'} className="text-xs">
                            {detail.granted ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickPermissionCheck;