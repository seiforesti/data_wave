import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ConfidenceLevel } from '../types/classification.types';

interface ConfidenceIndicatorProps {
  score: number; // 0-1 range
  level: ConfidenceLevel;
  showProgress?: boolean;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  score,
  level,
  showProgress = false,
  showPercentage = true,
  size = 'md'
}) => {
  const getConfidenceConfig = (level: ConfidenceLevel) => {
    const configs = {
      low: {
        color: 'bg-red-100 text-red-800 border-red-200',
        progressColor: 'bg-red-500',
        label: 'Low'
      },
      medium: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        progressColor: 'bg-yellow-500',
        label: 'Medium'
      },
      high: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        progressColor: 'bg-blue-500',
        label: 'High'
      },
      very_high: {
        color: 'bg-green-100 text-green-800 border-green-200',
        progressColor: 'bg-green-500',
        label: 'Very High'
      },
      certain: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        progressColor: 'bg-purple-500',
        label: 'Certain'
      }
    };
    return configs[level] || configs.medium;
  };

  const config = getConfidenceConfig(level);
  const percentage = Math.round(score * 100);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2'
  };

  if (showProgress) {
    return (
      <div className="flex items-center space-x-3">
        <Badge 
          className={`
            ${config.color} 
            ${sizeClasses[size]}
            border font-medium
          `}
        >
          {config.label}
        </Badge>
        <div className="flex-1 min-w-20">
          <Progress 
            value={percentage} 
            className="h-2"
          />
        </div>
        {showPercentage && (
          <span className="text-sm font-medium min-w-12 text-right">
            {percentage}%
          </span>
        )}
      </div>
    );
  }

  return (
    <Badge 
      className={`
        ${config.color} 
        ${sizeClasses[size]}
        border font-medium
      `}
    >
      {showPercentage ? `${percentage}%` : config.label}
    </Badge>
  );
};

export default ConfidenceIndicator;