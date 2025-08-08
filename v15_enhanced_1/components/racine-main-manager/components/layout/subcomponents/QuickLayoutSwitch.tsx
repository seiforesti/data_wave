'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Layout,
  Grid,
  Columns,
  Rows,
  Layers,
  LayoutDashboard,
  Square,
} from 'lucide-react';

type LayoutMode = 'single' | 'split-horizontal' | 'split-vertical' | 'grid' | 'tabs' | 'dashboard' | 'custom';

interface QuickLayoutSwitchProps {
  currentMode: LayoutMode;
  onModeChange: (mode: LayoutMode) => void;
  compact?: boolean;
}

export const QuickLayoutSwitch: React.FC<QuickLayoutSwitchProps> = ({
  currentMode,
  onModeChange,
  compact = false,
}) => {
  const layouts = [
    { mode: 'single', icon: Square, label: 'Single' },
    { mode: 'split-horizontal', icon: Columns, label: 'H-Split' },
    { mode: 'split-vertical', icon: Rows, label: 'V-Split' },
    { mode: 'grid', icon: Grid, label: 'Grid' },
    { mode: 'tabs', icon: Layers, label: 'Tabs' },
    { mode: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ];

  const currentLayout = layouts.find(l => l.mode === currentMode);
  const CurrentIcon = currentLayout?.icon || Layout;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={compact ? "sm" : "default"}>
          <CurrentIcon className="h-4 w-4 mr-1" />
          {!compact && <span>{currentLayout?.label || 'Layout'}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {layouts.map(({ mode, icon: Icon, label }) => (
          <DropdownMenuItem
            key={mode}
            onClick={() => onModeChange(mode as LayoutMode)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            {mode === currentMode && <Badge variant="default" className="ml-auto">Active</Badge>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};