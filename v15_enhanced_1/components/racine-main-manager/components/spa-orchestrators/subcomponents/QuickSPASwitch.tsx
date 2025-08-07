'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Icons
import {
  Database,
  Shield,
  FileText,
  BookOpen,
  Scan,
  Users,
  Search,
  ArrowRight,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Monitor,
  Zap,
  ExternalLink,
  ChevronDown,
  Star,
  History,
  Filter,
  Command as CommandIcon,
} from 'lucide-react';

// Import racine hooks
import { useCrossGroupIntegration } from '../../../hooks/useCrossGroupIntegration';
import { useWorkspaceManagement } from '../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../hooks/useUserManagement';
import { useActivityTracking } from '../../../hooks/useActivityTracking';

// Types
interface SPAInfo {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  status: 'healthy' | 'degraded' | 'failed' | 'loading';
  health: number;
  lastAccessed?: string;
  notifications: number;
  metrics: {
    activeItems: number;
    totalItems: number;
    performance: number;
  };
  quickActions: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    action: () => void;
  }>;
  permissions: string[];
}

interface QuickSPASwitchProps {
  className?: string;
  currentSPA?: string;
  onSPASwitch?: (spaId: string) => void;
  showRecentlyAccessed?: boolean;
  showFavorites?: boolean;
  showSearch?: boolean;
  compact?: boolean;
}

const QuickSPASwitch: React.FC<QuickSPASwitchProps> = ({
  className = '',
  currentSPA,
  onSPASwitch,
  showRecentlyAccessed = true,
  showFavorites = true,
  showSearch = true,
  compact = false,
}) => {
  // State management
  const [open, setOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [spaData, setSpaData] = useState<SPAInfo[]>([]);
  const [recentlyAccessed, setRecentlyAccessed] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hooks
  const router = useRouter();
  const pathname = usePathname();

  const {
    getAllExistingSPAStatus,
    navigateToSPA,
    getSPAMetrics,
    loading: integrationLoading
  } = useCrossGroupIntegration();

  const { currentWorkspace } = useWorkspaceManagement();
  const { currentUser, hasPermission } = useUserManagement();
  const { trackActivity } = useActivityTracking();

  // Initialize SPA data
  useEffect(() => {
    const initializeSPAData = async () => {
      try {
        setIsLoading(true);

        // Get status for all existing SPAs
        const spaStatuses = await getAllExistingSPAStatus();
        
        // Define SPA configurations
        const spaConfigs: SPAInfo[] = [
          {
            id: 'data-sources',
            name: 'data-sources',
            displayName: 'Data Sources',
            description: 'Manage and monitor data source connections',
            icon: Database,
            route: '/v15_enhanced_1/components/data-sources',
            status: spaStatuses['data-sources']?.status || 'loading',
            health: spaStatuses['data-sources']?.health || 0,
            notifications: spaStatuses['data-sources']?.notifications || 0,
            metrics: {
              activeItems: spaStatuses['data-sources']?.metrics?.activeConnections || 0,
              totalItems: spaStatuses['data-sources']?.metrics?.totalDataSources || 0,
              performance: spaStatuses['data-sources']?.metrics?.performance || 0,
            },
            quickActions: [
              {
                id: 'create-data-source',
                label: 'Create Data Source',
                icon: Database,
                action: () => console.log('Create data source')
              },
              {
                id: 'test-connections',
                label: 'Test Connections',
                icon: Activity,
                action: () => console.log('Test connections')
              }
            ],
            permissions: ['data-sources:read']
          },
          {
            id: 'scan-rule-sets',
            name: 'scan-rule-sets',
            displayName: 'Scan Rule Sets',
            description: 'Define and manage data scanning rules',
            icon: Shield,
            route: '/v15_enhanced_1/components/Advanced-Scan-Rule-Sets',
            status: spaStatuses['scan-rule-sets']?.status || 'loading',
            health: spaStatuses['scan-rule-sets']?.health || 0,
            notifications: spaStatuses['scan-rule-sets']?.notifications || 0,
            metrics: {
              activeItems: spaStatuses['scan-rule-sets']?.metrics?.activeRules || 0,
              totalItems: spaStatuses['scan-rule-sets']?.metrics?.totalRules || 0,
              performance: spaStatuses['scan-rule-sets']?.metrics?.performance || 0,
            },
            quickActions: [
              {
                id: 'create-rule',
                label: 'Create Rule',
                icon: Shield,
                action: () => console.log('Create rule')
              },
              {
                id: 'run-scan',
                label: 'Run Scan',
                icon: Scan,
                action: () => console.log('Run scan')
              }
            ],
            permissions: ['scan-rules:read']
          },
          {
            id: 'classifications',
            name: 'classifications',
            displayName: 'Classifications',
            description: 'Classify and categorize data assets',
            icon: FileText,
            route: '/v15_enhanced_1/components/classifications',
            status: spaStatuses['classifications']?.status || 'loading',
            health: spaStatuses['classifications']?.health || 0,
            notifications: spaStatuses['classifications']?.notifications || 0,
            metrics: {
              activeItems: spaStatuses['classifications']?.metrics?.activeClassifications || 0,
              totalItems: spaStatuses['classifications']?.metrics?.totalClassifications || 0,
              performance: spaStatuses['classifications']?.metrics?.performance || 0,
            },
            quickActions: [
              {
                id: 'create-classification',
                label: 'Create Classification',
                icon: FileText,
                action: () => console.log('Create classification')
              },
              {
                id: 'auto-classify',
                label: 'Auto Classify',
                icon: Zap,
                action: () => console.log('Auto classify')
              }
            ],
            permissions: ['classifications:read']
          },
          {
            id: 'compliance-rule',
            name: 'compliance-rule',
            displayName: 'Compliance Rules',
            description: 'Ensure data compliance and governance',
            icon: BookOpen,
            route: '/v15_enhanced_1/components/Compliance-Rule',
            status: spaStatuses['compliance-rule']?.status || 'loading',
            health: spaStatuses['compliance-rule']?.health || 0,
            notifications: spaStatuses['compliance-rule']?.notifications || 0,
            metrics: {
              activeItems: spaStatuses['compliance-rule']?.metrics?.activeRules || 0,
              totalItems: spaStatuses['compliance-rule']?.metrics?.totalRules || 0,
              performance: spaStatuses['compliance-rule']?.metrics?.performance || 0,
            },
            quickActions: [
              {
                id: 'create-compliance-rule',
                label: 'Create Rule',
                icon: BookOpen,
                action: () => console.log('Create compliance rule')
              },
              {
                id: 'run-audit',
                label: 'Run Audit',
                icon: Monitor,
                action: () => console.log('Run audit')
              }
            ],
            permissions: ['compliance:read']
          },
          {
            id: 'advanced-catalog',
            name: 'advanced-catalog',
            displayName: 'Advanced Catalog',
            description: 'Explore and manage data catalog',
            icon: BookOpen,
            route: '/v15_enhanced_1/components/Advanced-Catalog',
            status: spaStatuses['advanced-catalog']?.status || 'loading',
            health: spaStatuses['advanced-catalog']?.health || 0,
            notifications: spaStatuses['advanced-catalog']?.notifications || 0,
            metrics: {
              activeItems: spaStatuses['advanced-catalog']?.metrics?.catalogedAssets || 0,
              totalItems: spaStatuses['advanced-catalog']?.metrics?.totalAssets || 0,
              performance: spaStatuses['advanced-catalog']?.metrics?.performance || 0,
            },
            quickActions: [
              {
                id: 'search-catalog',
                label: 'Search Catalog',
                icon: Search,
                action: () => console.log('Search catalog')
              },
              {
                id: 'create-asset',
                label: 'Create Asset',
                icon: BookOpen,
                action: () => console.log('Create asset')
              }
            ],
            permissions: ['catalog:read']
          },
          {
            id: 'scan-logic',
            name: 'scan-logic',
            displayName: 'Scan Logic',
            description: 'Advanced scanning and processing logic',
            icon: Scan,
            route: '/v15_enhanced_1/components/Advanced-Scan-Logic',
            status: spaStatuses['scan-logic']?.status || 'loading',
            health: spaStatuses['scan-logic']?.health || 0,
            notifications: spaStatuses['scan-logic']?.notifications || 0,
            metrics: {
              activeItems: spaStatuses['scan-logic']?.metrics?.activeScans || 0,
              totalItems: spaStatuses['scan-logic']?.metrics?.totalScans || 0,
              performance: spaStatuses['scan-logic']?.metrics?.performance || 0,
            },
            quickActions: [
              {
                id: 'start-scan',
                label: 'Start Scan',
                icon: Scan,
                action: () => console.log('Start scan')
              },
              {
                id: 'view-results',
                label: 'View Results',
                icon: BarChart3,
                action: () => console.log('View results')
              }
            ],
            permissions: ['scan-logic:read']
          },
          {
            id: 'rbac-system',
            name: 'rbac-system',
            displayName: 'RBAC System',
            description: 'Role-based access control management',
            icon: Users,
            route: '/v15_enhanced_1/components/Advanced_RBAC_Datagovernance_System',
            status: spaStatuses['rbac-system']?.status || 'loading',
            health: spaStatuses['rbac-system']?.health || 0,
            notifications: spaStatuses['rbac-system']?.notifications || 0,
            metrics: {
              activeItems: spaStatuses['rbac-system']?.metrics?.activeUsers || 0,
              totalItems: spaStatuses['rbac-system']?.metrics?.totalUsers || 0,
              performance: spaStatuses['rbac-system']?.metrics?.performance || 0,
            },
            quickActions: [
              {
                id: 'manage-users',
                label: 'Manage Users',
                icon: Users,
                action: () => console.log('Manage users')
              },
              {
                id: 'assign-roles',
                label: 'Assign Roles',
                icon: Shield,
                action: () => console.log('Assign roles')
              }
            ],
            permissions: ['rbac:read', 'admin']
          }
        ];

        // Filter SPAs based on user permissions
        const allowedSPAs = spaConfigs.filter(spa => 
          spa.permissions.some(permission => hasPermission(permission))
        );

        setSpaData(allowedSPAs);

        // Load user preferences
        const recentlyAccessedData = localStorage.getItem(`spa-recent-${currentUser?.id}`) || '[]';
        const favoritesData = localStorage.getItem(`spa-favorites-${currentUser?.id}`) || '[]';
        
        setRecentlyAccessed(JSON.parse(recentlyAccessedData));
        setFavorites(JSON.parse(favoritesData));

      } catch (err) {
        console.error('Failed to initialize SPA data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSPAData();
  }, [getAllExistingSPAStatus, hasPermission, currentUser?.id]);

  // Handle SPA switch
  const handleSPASwitch = useCallback(async (spaInfo: SPAInfo) => {
    try {
      // Track activity
      await trackActivity('spa-switch', {
        fromSPA: currentSPA,
        toSPA: spaInfo.id,
        workspaceId: currentWorkspace?.id
      });

      // Update recently accessed
      const updatedRecent = [spaInfo.id, ...recentlyAccessed.filter(id => id !== spaInfo.id)].slice(0, 5);
      setRecentlyAccessed(updatedRecent);
      localStorage.setItem(`spa-recent-${currentUser?.id}`, JSON.stringify(updatedRecent));

      // Navigate to SPA
      await navigateToSPA(spaInfo.id, spaInfo.route);
      router.push(spaInfo.route);

      // Call callback
      onSPASwitch?.(spaInfo.id);

      setOpen(false);
    } catch (err) {
      console.error('Failed to switch SPA:', err);
    }
  }, [
    currentSPA,
    currentWorkspace?.id,
    recentlyAccessed,
    currentUser?.id,
    trackActivity,
    navigateToSPA,
    router,
    onSPASwitch
  ]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback((spaId: string) => {
    const updatedFavorites = favorites.includes(spaId)
      ? favorites.filter(id => id !== spaId)
      : [...favorites, spaId];
    
    setFavorites(updatedFavorites);
    localStorage.setItem(`spa-favorites-${currentUser?.id}`, JSON.stringify(updatedFavorites));
  }, [favorites, currentUser?.id]);

  // Filter SPAs based on search query
  const filteredSPAs = useMemo(() => {
    if (!searchQuery) return spaData;
    
    return spaData.filter(spa =>
      spa.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spa.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spa.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [spaData, searchQuery]);

  // Get recently accessed SPAs
  const recentSPAs = useMemo(() => {
    return recentlyAccessed
      .map(id => spaData.find(spa => spa.id === id))
      .filter(Boolean) as SPAInfo[];
  }, [recentlyAccessed, spaData]);

  // Get favorite SPAs
  const favoriteSPAs = useMemo(() => {
    return favorites
      .map(id => spaData.find(spa => spa.id === id))
      .filter(Boolean) as SPAInfo[];
  }, [favorites, spaData]);

  // Get current SPA info
  const currentSPAInfo = useMemo(() => {
    return spaData.find(spa => spa.id === currentSPA || pathname.includes(spa.route));
  }, [spaData, currentSPA, pathname]);

  // Render SPA item
  const renderSPAItem = useCallback((spa: SPAInfo, showQuickActions = false) => {
    const Icon = spa.icon;
    const isFavorite = favorites.includes(spa.id);
    const isRecent = recentlyAccessed.includes(spa.id);

    return (
      <div className="flex items-center justify-between p-2 hover:bg-accent rounded-lg group">
        <div 
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={() => handleSPASwitch(spa)}
        >
          <div className="relative">
            <Icon className="h-4 w-4" />
            {spa.notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
              >
                {spa.notifications > 99 ? '99+' : spa.notifications}
              </Badge>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{spa.displayName}</span>
              
              {/* Status indicator */}
              <div 
                className={`w-2 h-2 rounded-full ${
                  spa.status === 'healthy' ? 'bg-green-500' :
                  spa.status === 'degraded' ? 'bg-yellow-500' :
                  spa.status === 'failed' ? 'bg-red-500' :
                  'bg-gray-400'
                }`}
              />
              
              {/* Badges */}
              {isRecent && (
                <Badge variant="outline" className="h-4 px-1 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Recent
                </Badge>
              )}
              
              {isFavorite && (
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              )}
            </div>
            
            {!compact && (
              <p className="text-xs text-muted-foreground">{spa.description}</p>
            )}
            
            {!compact && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <span>{spa.metrics.activeItems}/{spa.metrics.totalItems} items</span>
                <span>{spa.health}% health</span>
              </div>
            )}
          </div>
          
          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        {/* Quick actions */}
        {showQuickActions && spa.quickActions.length > 0 && (
          <div className="flex items-center gap-1 ml-2">
            {spa.quickActions.slice(0, 2).map((action) => {
              const ActionIcon = action.icon;
              return (
                <TooltipProvider key={action.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          action.action();
                        }}
                      >
                        <ActionIcon className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{action.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        )}
        
        {/* Favorite toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            handleFavoriteToggle(spa.id);
          }}
        >
          <Star className={`h-3 w-3 ${isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
        </Button>
      </div>
    );
  }, [favorites, recentlyAccessed, compact, handleSPASwitch, handleFavoriteToggle]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-32 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className={`quick-spa-switch ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
            size={compact ? "sm" : "default"}
          >
            <div className="flex items-center gap-2">
              {currentSPAInfo ? (
                <>
                  <currentSPAInfo.icon className="h-4 w-4" />
                  <span>{compact ? currentSPAInfo.name : currentSPAInfo.displayName}</span>
                  {currentSPAInfo.notifications > 0 && (
                    <Badge variant="destructive" className="h-4 w-4 p-0 text-xs">
                      {currentSPAInfo.notifications > 99 ? '99+' : currentSPAInfo.notifications}
                    </Badge>
                  )}
                </>
              ) : (
                <>
                  <CommandIcon className="h-4 w-4" />
                  <span>Switch SPA</span>
                </>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            {showSearch && (
              <CommandInput 
                placeholder="Search SPAs..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
            )}
            
            <CommandList>
              {filteredSPAs.length === 0 && (
                <CommandEmpty>No SPAs found.</CommandEmpty>
              )}
              
              {/* Favorites */}
              {showFavorites && favoriteSPAs.length > 0 && (
                <CommandGroup heading="Favorites">
                  {favoriteSPAs.map((spa) => (
                    <CommandItem key={spa.id} value={spa.id} className="p-0">
                      {renderSPAItem(spa, true)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {/* Recently Accessed */}
              {showRecentlyAccessed && recentSPAs.length > 0 && favoriteSPAs.length > 0 && (
                <CommandSeparator />
              )}
              
              {showRecentlyAccessed && recentSPAs.length > 0 && (
                <CommandGroup heading="Recently Accessed">
                  {recentSPAs.map((spa) => (
                    <CommandItem key={spa.id} value={spa.id} className="p-0">
                      {renderSPAItem(spa, true)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {/* All SPAs */}
              {(favoriteSPAs.length > 0 || recentSPAs.length > 0) && (
                <CommandSeparator />
              )}
              
              <CommandGroup heading="All SPAs">
                {filteredSPAs.map((spa) => (
                  <CommandItem key={spa.id} value={spa.id} className="p-0">
                    {renderSPAItem(spa, !compact)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default QuickSPASwitch;