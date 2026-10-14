import React from 'react';
import PriorityBadge from './PriorityBadge.jsx';
import { 
  Flame, 
  Car, 
  Waves, 
  Building2, 
  Stethoscope, 
  Wind, 
  Zap, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Users, 
  Check, 
  UserCheck, 
  ArrowUpRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function IncidentCard({
  incident,
  isSelected = false,
  onSelect,
  onQuickAction,
}) {
  if (!incident) return null;

  const getCategoryIcon = (cat = '') => {
    switch (cat.toLowerCase()) {
      case 'fire':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'road accident':
        return <Car className="w-4 h-4 text-rose-500" />;
      case 'flood':
        return <Waves className="w-4 h-4 text-cyan-500" />;
      case 'building collapse':
        return <Building2 className="w-4 h-4 text-amber-600" />;
      case 'medical emergency':
        return <Stethoscope className="w-4 h-4 text-emerald-500" />;
      case 'gas leak':
        return <Wind className="w-4 h-4 text-purple-500" />;
      case 'power outage':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status = '') => {
    const s = status.toLowerCase();
    const map = {
      new: { bg: 'bg-red-50 text-red-700 border-red-200', label: 'NEW REPORT' },
      verified: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'VERIFIED' },
      in_progress: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'RESPONDING' },
      resolved: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'RESOLVED' },
    };
    const c = map[s] || { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: status.toUpperCase() };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider ${c.bg}`}>
        {c.label}
      </span>
    );
  };

  const timeAgo = (dateStr) => {
    try {
      const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
      if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(incident)}
      className={`group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer border ${
        isSelected
          ? 'bg-red-50/60 border-red-500 shadow-md ring-2 ring-red-400/20'
          : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Top row: Category tag, ID, Priority Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-white border border-slate-200">
            {getCategoryIcon(incident.category)}
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              {incident.id}
            </span>
            <span className="text-[11px] font-semibold text-slate-700 block leading-none">
              {incident.category}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {getStatusBadge(incident.status)}
          <PriorityBadge severity={incident.severity} score={incident.ai_analysis?.priority_score} size="sm" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors line-clamp-1 mb-1">
        {incident.title}
      </h3>

      {/* Description Snippet */}
      <p className="text-xs text-slate-600 line-clamp-2 mb-3">
        {incident.description}
      </p>

      {/* Location and Metadata */}
      <div className="flex flex-col gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate font-medium text-slate-600">{incident.location_name}</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-slate-400" />
              {timeAgo(incident.created_at)}
            </span>
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <Users className="w-3 h-3 text-blue-500" />
              {incident.report_count} {incident.report_count === 1 ? 'report' : 'reports'}
            </span>
          </div>

          <span className="text-red-600 flex items-center font-semibold group-hover:translate-x-0.5 transition-transform text-[11px]">
            Details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </span>
        </div>
      </div>

      {/* Quick Action Toolbar */}
      <div
        className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        {incident.status === 'new' && (
          <button
            onClick={() => onQuickAction && onQuickAction('verify', incident)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Verify</span>
          </button>
        )}

        <button
          onClick={() => onQuickAction && onQuickAction('assign', incident)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
        >
          <UserCheck className="w-3 h-3" />
          <span>Assign Team</span>
        </button>

        {incident.severity !== 'critical' && (
          <button
            onClick={() => onQuickAction && onQuickAction('escalate', incident)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
          >
            <ArrowUpRight className="w-3 h-3" />
            <span>Escalate</span>
          </button>
        )}
      </div>
    </div>
  );
}
