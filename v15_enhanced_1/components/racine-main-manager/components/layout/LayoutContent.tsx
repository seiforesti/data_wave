"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Maximize2, Minimize2, RotateCcw, Settings, Grid3X3, 
  SplitSquareHorizontal, SplitSquareVertical, Columns, Rows,
  Monitor, Smartphone, Tablet, Eye, EyeOff, Layout,
  Fullscreen, Minimize, PanelLeft, PanelRight, PanelTop,
  PanelBottom, Square, Rectangle, Circle, Triangle,
  Move, Resize, Lock, Unlock, Save, RefreshCw
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Import types
import { RacineView } from '../../types/racine.types'

interface LayoutConfig {
  id: string
  name: string
  type: 'single' | 'split-horizontal' | 'split-vertical' | 'grid' | 'tabs' | 'nested'
  sections: LayoutSection[]
  responsive: boolean
  persistState: boolean
  customizable: boolean
}

interface LayoutSection {
  id: string
  x: number
  y: number
  width: number
  height: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  resizable: boolean
  movable: boolean
  visible: boolean
  content?: React.ReactNode
  title?: string
  icon?: React.ComponentType<any>
  actions?: Array<{
    id: string
    label: string
    icon: React.ComponentType<any>
    action: () => void
  }>
}

interface LayoutContentProps {
  collapsed: boolean
  currentView: RacineView
  isFullscreen: boolean
  children?: React.ReactNode
  layoutConfig?: LayoutConfig
  onLayoutChange?: (config: LayoutConfig) => void
  className?: string
}

const DEFAULT_LAYOUT_CONFIGS: Record<string, LayoutConfig> = {
  single: {
    id: 'single',
    name: 'Single View',
    type: 'single',
    sections: [{
      id: 'main',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      resizable: false,
      movable: false,
      visible: true
    }],
    responsive: true,
    persistState: true,
    customizable: false
  },
  splitHorizontal: {
    id: 'split-horizontal',
    name: 'Split Horizontal',
    type: 'split-horizontal',
    sections: [
      {
        id: 'left',
        x: 0,
        y: 0,
        width: 50,
        height: 100,
        resizable: true,
        movable: false,
        visible: true,
        minWidth: 20,
        maxWidth: 80
      },
      {
        id: 'right',
        x: 50,
        y: 0,
        width: 50,
        height: 100,
        resizable: true,
        movable: false,
        visible: true,
        minWidth: 20,
        maxWidth: 80
      }
    ],
    responsive: true,
    persistState: true,
    customizable: true
  },
  splitVertical: {
    id: 'split-vertical',
    name: 'Split Vertical',
    type: 'split-vertical',
    sections: [
      {
        id: 'top',
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        resizable: true,
        movable: false,
        visible: true,
        minHeight: 20,
        maxHeight: 80
      },
      {
        id: 'bottom',
        x: 0,
        y: 50,
        width: 100,
        height: 50,
        resizable: true,
        movable: false,
        visible: true,
        minHeight: 20,
        maxHeight: 80
      }
    ],
    responsive: true,
    persistState: true,
    customizable: true
  },
  grid: {
    id: 'grid',
    name: 'Grid Layout',
    type: 'grid',
    sections: [
      {
        id: 'top-left',
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        resizable: true,
        movable: true,
        visible: true,
        minWidth: 25,
        minHeight: 25
      },
      {
        id: 'top-right',
        x: 50,
        y: 0,
        width: 50,
        height: 50,
        resizable: true,
        movable: true,
        visible: true,
        minWidth: 25,
        minHeight: 25
      },
      {
        id: 'bottom-left',
        x: 0,
        y: 50,
        width: 50,
        height: 50,
        resizable: true,
        movable: true,
        visible: true,
        minWidth: 25,
        minHeight: 25
      },
      {
        id: 'bottom-right',
        x: 50,
        y: 50,
        width: 50,
        height: 50,
        resizable: true,
        movable: true,
        visible: true,
        minWidth: 25,
        minHeight: 25
      }
    ],
    responsive: true,
    persistState: true,
    customizable: true
  }
}

export const LayoutContent: React.FC<LayoutContentProps> = ({
  collapsed,
  currentView,
  isFullscreen,
  children,
  layoutConfig,
  onLayoutChange,
  className
}) => {
  // Local state
  const [activeLayout, setActiveLayout] = useState<LayoutConfig>(
    layoutConfig || DEFAULT_LAYOUT_CONFIGS.single
  )
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [showLayoutOptions, setShowLayoutOptions] = useState(false)
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [sections, setSections] = useState<LayoutSection[]>(activeLayout.sections)
  const [draggedSection, setDraggedSection] = useState<string | null>(null)
  const [resizingSection, setResizingSection] = useState<string | null>(null)

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const resizeObserverRef = useRef<ResizeObserver>()

  // Layout presets for different views
  const viewLayoutPresets = useMemo(() => ({
    'dashboard': DEFAULT_LAYOUT_CONFIGS.single,
    'workspace': DEFAULT_LAYOUT_CONFIGS.splitHorizontal,
    'workflow': DEFAULT_LAYOUT_CONFIGS.grid,
    'pipeline': DEFAULT_LAYOUT_CONFIGS.splitVertical,
    'ai-assistant': DEFAULT_LAYOUT_CONFIGS.single,
    'activity-tracker': DEFAULT_LAYOUT_CONFIGS.splitHorizontal,
    'collaboration': DEFAULT_LAYOUT_CONFIGS.splitVertical,
    'settings': DEFAULT_LAYOUT_CONFIGS.single
  }), [])

  // Responsive breakpoints
  const breakpoints = useMemo(() => ({
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  }), [])

  // Get current device type based on container width
  const getCurrentDeviceType = useCallback(() => {
    if (!containerRef.current) return 'desktop'
    
    const width = containerRef.current.offsetWidth
    if (width < breakpoints.mobile) return 'mobile'
    if (width < breakpoints.tablet) return 'tablet'
    return 'desktop'
  }, [breakpoints])

  // Handle layout changes
  const handleLayoutChange = useCallback((newLayout: LayoutConfig) => {
    setActiveLayout(newLayout)
    setSections(newLayout.sections)
    onLayoutChange?.(newLayout)
    
    // Persist layout if enabled
    if (newLayout.persistState) {
      localStorage.setItem(`layout-${currentView}`, JSON.stringify(newLayout))
    }
  }, [currentView, onLayoutChange])

  // Load saved layout for current view
  useEffect(() => {
    const savedLayout = localStorage.getItem(`layout-${currentView}`)
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout)
        setActiveLayout(parsed)
        setSections(parsed.sections)
      } catch (error) {
        console.error('Failed to load saved layout:', error)
      }
    } else {
      // Use preset layout for view
      const preset = viewLayoutPresets[currentView] || DEFAULT_LAYOUT_CONFIGS.single
      setActiveLayout(preset)
      setSections(preset.sections)
    }
  }, [currentView, viewLayoutPresets])

  // Handle responsive layout adjustments
  useEffect(() => {
    if (!activeLayout.responsive) return

    const handleResize = () => {
      const deviceType = getCurrentDeviceType()
      setDevicePreview(deviceType)
      
      // Adjust layout for mobile devices
      if (deviceType === 'mobile' && activeLayout.type !== 'single') {
        const mobileLayout = {
          ...activeLayout,
          type: 'single' as const,
          sections: [{
            id: 'main',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            resizable: false,
            movable: false,
            visible: true
          }]
        }
        setSections(mobileLayout.sections)
      } else {
        setSections(activeLayout.sections)
      }
    }

    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect()
    }

    resizeObserverRef.current = new ResizeObserver(handleResize)
    
    if (containerRef.current) {
      resizeObserverRef.current.observe(containerRef.current)
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
    }
  }, [activeLayout, getCurrentDeviceType])

  // Handle section resize
  const handleSectionResize = useCallback((sectionId: string, newWidth: number, newHeight: number) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { 
            ...section, 
            width: Math.max(section.minWidth || 10, Math.min(section.maxWidth || 90, newWidth)),
            height: Math.max(section.minHeight || 10, Math.min(section.maxHeight || 90, newHeight))
          }
        : section
    ))
  }, [])

  // Handle section move
  const handleSectionMove = useCallback((sectionId: string, newX: number, newY: number) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, x: Math.max(0, Math.min(100 - section.width, newX)), y: Math.max(0, Math.min(100 - section.height, newY)) }
        : section
    ))
  }, [])

  // Toggle section visibility
  const toggleSectionVisibility = useCallback((sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, visible: !section.visible }
        : section
    ))
  }, [])

  // Reset layout to default
  const resetLayout = useCallback(() => {
    const defaultLayout = viewLayoutPresets[currentView] || DEFAULT_LAYOUT_CONFIGS.single
    handleLayoutChange(defaultLayout)
  }, [currentView, viewLayoutPresets, handleLayoutChange])

  // Save current layout
  const saveLayout = useCallback(() => {
    const currentLayout = {
      ...activeLayout,
      sections
    }
    handleLayoutChange(currentLayout)
    setIsCustomizing(false)
  }, [activeLayout, sections, handleLayoutChange])

  // Render layout controls
  const renderLayoutControls = () => (
    <div className="flex items-center gap-2 p-2 border-b border-border bg-muted/30">
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeLayout.type === 'single' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleLayoutChange(DEFAULT_LAYOUT_CONFIGS.single)}
              className="h-8 w-8 p-0"
            >
              <Square className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Single View</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeLayout.type === 'split-horizontal' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleLayoutChange(DEFAULT_LAYOUT_CONFIGS.splitHorizontal)}
              className="h-8 w-8 p-0"
            >
              <SplitSquareHorizontal className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Split Horizontal</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeLayout.type === 'split-vertical' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleLayoutChange(DEFAULT_LAYOUT_CONFIGS.splitVertical)}
              className="h-8 w-8 p-0"
            >
              <SplitSquareVertical className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Split Vertical</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeLayout.type === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleLayoutChange(DEFAULT_LAYOUT_CONFIGS.grid)}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Grid Layout</TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Badge variant="outline" className="text-xs">
          {devicePreview}
        </Badge>
        
        {activeLayout.customizable && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isCustomizing ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setIsCustomizing(!isCustomizing)}
                className="h-8 w-8 p-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Customize Layout</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetLayout}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset Layout</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex-1" />

      {isCustomizing && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomizing(false)}
            className="h-8"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={saveLayout}
            className="h-8"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
        </div>
      )}
    </div>
  )

  // Render layout section
  const renderLayoutSection = (section: LayoutSection) => {
    if (!section.visible) return null

    return (
      <motion.div
        key={section.id}
        className={cn(
          "absolute border-2 border-border bg-background rounded-lg overflow-hidden",
          isCustomizing && "border-dashed border-primary/50",
          draggedSection === section.id && "opacity-50",
          resizingSection === section.id && "border-primary"
        )}
        style={{
          left: `${section.x}%`,
          top: `${section.y}%`,
          width: `${section.width}%`,
          height: `${section.height}%`
        }}
        drag={isCustomizing && section.movable}
        dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
        dragElastic={0}
        onDragStart={() => setDraggedSection(section.id)}
        onDragEnd={(_, info) => {
          setDraggedSection(null)
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            const newX = (info.point.x / rect.width) * 100
            const newY = (info.point.y / rect.height) * 100
            handleSectionMove(section.id, newX, newY)
          }
        }}
        initial={false}
        animate={{
          scale: draggedSection === section.id ? 0.95 : 1,
          zIndex: draggedSection === section.id ? 10 : 1
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Section Header */}
        {isCustomizing && (
          <div className="flex items-center justify-between p-2 bg-muted/50 border-b border-border">
            <div className="flex items-center gap-2">
              {section.icon && <section.icon className="h-4 w-4" />}
              <span className="text-sm font-medium">{section.title || section.id}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSectionVisibility(section.id)}
                className="h-6 w-6 p-0"
              >
                <EyeOff className="h-3 w-3" />
              </Button>
              
              {section.resizable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={() => setResizingSection(section.id)}
                  className="h-6 w-6 p-0 cursor-se-resize"
                >
                  <Resize className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Section Content */}
        <div className={cn(
          "h-full w-full",
          isCustomizing && "pointer-events-none"
        )}>
          {section.content || (
            <div className="flex items-center justify-center h-full p-4">
              {children}
            </div>
          )}
        </div>

        {/* Resize handles */}
        {isCustomizing && section.resizable && (
          <>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary/20 cursor-se-resize" />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-primary/20 cursor-s-resize" />
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-4 bg-primary/20 cursor-e-resize" />
          </>
        )}
      </motion.div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col h-full bg-background transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50",
        className
      )}
    >
      {/* Layout Controls */}
      {renderLayoutControls()}

      {/* Main Layout Container */}
      <div className="flex-1 relative overflow-hidden">
        <motion.div 
          className="relative w-full h-full"
          animate={{ 
            marginLeft: collapsed ? '0px' : '0px',
            opacity: isCustomizing ? 0.8 : 1 
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Render layout sections */}
          <AnimatePresence>
            {sections.map(renderLayoutSection)}
          </AnimatePresence>

          {/* Single view fallback */}
          {sections.length === 0 && (
            <div className="w-full h-full p-4">
              {children}
            </div>
          )}

          {/* Customization overlay */}
          {isCustomizing && (
            <motion.div
              className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <Layout className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Drag sections to move, use resize handles to adjust size
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Layout Status Bar */}
      <div className="flex items-center justify-between p-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Layout: {activeLayout.name}</span>
          <Separator orientation="vertical" className="h-4" />
          <span>Sections: {sections.filter(s => s.visible).length}/{sections.length}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {devicePreview}
          </Badge>
          {activeLayout.persistState && (
            <Badge variant="outline" className="text-xs">
              Auto-save
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export default LayoutContent