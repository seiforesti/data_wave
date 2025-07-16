import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { DataSource, FilterState, SortConfig } from '../types';

export const useDataSourceFilters = (dataSources: DataSource[] = []) => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "all",
    status: "all",
    location: "all",
    environment: "all",
    criticality: "all",
    tags: [],
    healthScore: [0, 100],
    complianceScore: [0, 100],
    owner: "all",
    team: "all",
    hasIssues: false,
    favorites: false,
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "asc",
  });

  // Debounce search to avoid excessive API calls
  const [debouncedSearch] = useDebounce(filters.search, 300);

  // Get unique filter options from data
  const filterOptions = useMemo(() => {
    return {
      types: [...new Set(dataSources.map(ds => ds.source_type))],
      statuses: [...new Set(dataSources.map(ds => ds.status).filter(Boolean))],
      locations: [...new Set(dataSources.map(ds => ds.location))],
      environments: [...new Set(dataSources.map(ds => ds.environment).filter(Boolean))],
      criticalities: [...new Set(dataSources.map(ds => ds.criticality).filter(Boolean))],
      owners: [...new Set(dataSources.map(ds => ds.owner).filter(Boolean))],
      teams: [...new Set(dataSources.map(ds => ds.team).filter(Boolean))],
      tags: [...new Set(dataSources.flatMap(ds => ds.tags || []))]
    };
  }, [dataSources]);

  // Apply filters and sorting
  const filteredAndSortedDataSources = useMemo(() => {
    let filtered = dataSources;

    // Search filter (using debounced value)
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(ds =>
        ds.name.toLowerCase().includes(searchLower) ||
        ds.host.toLowerCase().includes(searchLower) ||
        ds.source_type.toLowerCase().includes(searchLower) ||
        ds.description?.toLowerCase().includes(searchLower) ||
        ds.owner?.toLowerCase().includes(searchLower) ||
        ds.team?.toLowerCase().includes(searchLower) ||
        ds.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Type filter
    if (filters.type !== "all") {
      filtered = filtered.filter(ds => ds.source_type === filters.type);
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(ds => ds.status === filters.status);
    }

    // Location filter
    if (filters.location !== "all") {
      filtered = filtered.filter(ds => ds.location === filters.location);
    }

    // Environment filter
    if (filters.environment !== "all") {
      filtered = filtered.filter(ds => ds.environment === filters.environment);
    }

    // Criticality filter
    if (filters.criticality !== "all") {
      filtered = filtered.filter(ds => ds.criticality === filters.criticality);
    }

    // Owner filter
    if (filters.owner !== "all") {
      filtered = filtered.filter(ds => ds.owner === filters.owner);
    }

    // Team filter
    if (filters.team !== "all") {
      filtered = filtered.filter(ds => ds.team === filters.team);
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(ds => 
        ds.tags?.some(tag => filters.tags.includes(tag))
      );
    }

    // Health score filter
    filtered = filtered.filter(ds => {
      const healthScore = ds.health_score || 0;
      return healthScore >= filters.healthScore[0] && healthScore <= filters.healthScore[1];
    });

    // Compliance score filter
    filtered = filtered.filter(ds => {
      const complianceScore = ds.compliance_score || 0;
      return complianceScore >= filters.complianceScore[0] && complianceScore <= filters.complianceScore[1];
    });

    // Has issues filter
    if (filters.hasIssues) {
      filtered = filtered.filter(ds => 
        ds.status === 'error' || 
        (ds.health_score && ds.health_score < 80) ||
        (ds.compliance_score && ds.compliance_score < 80)
      );
    }

    // Favorites filter
    if (filters.favorites) {
      filtered = filtered.filter(ds => ds.favorite);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof DataSource];
      const bValue = b[sortConfig.key as keyof DataSource];
      
      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [dataSources, debouncedSearch, filters, sortConfig]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "all",
      status: "all",
      location: "all",
      environment: "all",
      criticality: "all",
      tags: [],
      healthScore: [0, 100],
      complianceScore: [0, 100],
      owner: "all",
      team: "all",
      hasIssues: false,
      favorites: false,
    });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search ||
      filters.type !== "all" ||
      filters.status !== "all" ||
      filters.location !== "all" ||
      filters.environment !== "all" ||
      filters.criticality !== "all" ||
      filters.owner !== "all" ||
      filters.team !== "all" ||
      filters.tags.length > 0 ||
      filters.healthScore[0] > 0 ||
      filters.healthScore[1] < 100 ||
      filters.complianceScore[0] > 0 ||
      filters.complianceScore[1] < 100 ||
      filters.hasIssues ||
      filters.favorites
    );
  }, [filters]);

  return {
    filters,
    sortConfig,
    filteredAndSortedDataSources,
    filterOptions,
    updateFilter,
    setSortConfig,
    clearFilters,
    hasActiveFilters,
    debouncedSearch
  };
};