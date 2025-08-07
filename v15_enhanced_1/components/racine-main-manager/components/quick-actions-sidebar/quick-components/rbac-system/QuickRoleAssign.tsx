'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UserCheck, Users, Shield, X, Save, RefreshCw } from 'lucide-react';

interface QuickRoleAssignProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const QuickRoleAssign: React.FC<QuickRoleAssignProps> = ({
  isVisible, onClose, className = '',
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  const users = [
    { id: '1', name: 'John Doe', email: 'john@company.com', currentRole: 'Analyst' },
    { id: '2', name: 'Jane Smith', email: 'jane@company.com', currentRole: 'Viewer' },
    { id: '3', name: 'Mike Johnson', email: 'mike@company.com', currentRole: 'Data Steward' },
  ];

  const roles = [
    { id: 'admin', name: 'Admin', permissions: 45, level: 'high' },
    { id: 'steward', name: 'Data Steward', permissions: 28, level: 'medium' },
    { id: 'analyst', name: 'Analyst', permissions: 15, level: 'medium' },
    { id: 'viewer', name: 'Viewer', permissions: 8, level: 'low' },
  ];

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
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Assign Roles</h2>
              <p className="text-sm text-gray-500">Manage user permissions</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Select Role</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose role to assign" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{role.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {role.permissions} perms
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Select Users</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {user.currentRole}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">{selectedUsers.length}</span> users selected
            </div>
            <div className="text-sm text-blue-600">
              Role: {selectedRole ? roles.find(r => r.id === selectedRole)?.name : 'None'}
            </div>
          </div>

          <Button
            onClick={() => setIsAssigning(true)}
            disabled={selectedUsers.length === 0 || !selectedRole || isAssigning}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            {isAssigning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Assign Role to {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickRoleAssign;