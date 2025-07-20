import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, AlertTriangle, Zap } from 'lucide-react';
import { SensitivityLevel } from '../types/classification.types';

interface SensitivityLabelBadgeProps {
  level: SensitivityLevel;
  showIcon?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const SensitivityLabelBadge: React.FC<SensitivityLabelBadgeProps> = ({
  level,
  showIcon = true,
  variant = 'default',
  size = 'md'
}) => {
  const getSensitivityConfig = (level: SensitivityLevel) => {
    const configs = {
      public: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: Eye,
        label: 'Public'
      },
      internal: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Shield,
        label: 'Internal'
      },
      confidential: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertTriangle,
        label: 'Confidential'
      },
      restricted: {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Lock,
        label: 'Restricted'
      },
      top_secret: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: Zap,
        label: 'Top Secret'
      }
    };
    return configs[level] || configs.public;
  };

  const config = getSensitivityConfig(level);
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Badge 
      className={`
        ${config.color} 
        ${sizeClasses[size]}
        inline-flex items-center space-x-1
        border font-medium
      `}
      variant={variant}
    >
      {showIcon && <IconComponent className={iconSizes[size]} />}
      <span>{config.label}</span>
    </Badge>
  );
};

export default SensitivityLabelBadge;