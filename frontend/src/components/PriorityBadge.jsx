import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

/**
 * PriorityBadge - Renders color-coded and animated badges for emergency severity & priority
 * Severities: critical (red pulsing), high (orange), medium (yellow), low (blue/green)
 */
export default function PriorityBadge({ severity = 'medium', score, showIcon = true, size = 'md' }) {
  const normSeverity = (severity || 'medium').toLowerCase();

  const configs = {
    critical: {
      bg: 'bg-red-500/15',
      text: 'text-red-700',
      border: 'border-red-500/30',
      dot: 'bg-red-600',
      pulse: 'animate-pulse',
      label: 'Critical',
      icon: AlertCircle,
    },
    high: {
      bg: 'bg-orange-500/15',
      text: 'text-orange-700',
      border: 'border-orange-500/30',
      dot: 'bg-orange-600',
      pulse: '',
      label: 'High',
      icon: AlertTriangle,
    },
    medium: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-700',
      border: 'border-amber-500/30',
      dot: 'bg-amber-600',
      pulse: '',
      label: 'Medium',
      icon: Info,
    },
    low: {
      bg: 'bg-blue-500/15',
      text: 'text-blue-700',
      border: 'border-blue-500/30',
      dot: 'bg-blue-600',
      pulse: '',
      label: 'Low',
      icon: CheckCircle,
    },
  };

  const config = configs[normSeverity] || configs.medium;
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  }[size] || 'text-xs px-2.5 py-1 gap-1.5 font-semibold';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} transition-all duration-200 select-none`}
    >
      <span className="relative flex h-2 w-2">
        {normSeverity === 'critical' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
      </span>

      {showIcon && <IconComponent className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}

      <span>{config.label}</span>

      {score !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-md bg-white/70 font-mono font-bold shadow-xs">
          {score}
        </span>
      )}
    </span>
  );
}
