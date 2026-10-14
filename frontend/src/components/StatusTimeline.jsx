import React from 'react';
import { Clock, ShieldAlert, CheckCircle2, User, Activity, Bell } from 'lucide-react';

/**
 * StatusTimeline - Displays visual chronological audit trail of incident status changes,
 * triage notifications, and responder updates.
 */
export default function StatusTimeline({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-sm">
        <Clock className="w-6 h-6 mx-auto mb-2 text-slate-300" />
        No timeline events recorded yet.
      </div>
    );
  }

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getActionIcon = (actionText = '') => {
    const text = actionText.toLowerCase();
    if (text.includes('resolved')) return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    if (text.includes('critical') || text.includes('escalate')) return <ShieldAlert className="w-4 h-4 text-red-600" />;
    if (text.includes('responder') || text.includes('dispatch')) return <Activity className="w-4 h-4 text-blue-600" />;
    if (text.includes('verified')) return <CheckCircle2 className="w-4 h-4 text-orange-600" />;
    return <Bell className="w-4 h-4 text-slate-600" />;
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((event, idx) => (
        <div key={idx} className="relative group">
          {/* Timeline node dot */}
          <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-300 group-hover:border-red-500 flex items-center justify-center transition-colors shadow-xs">
            <span className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-red-500"></span>
          </div>

          <div className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-800">
                {getActionIcon(event.action)}
                <span>{event.action}</span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {formatDate(event.timestamp)} {formatTime(event.timestamp)}
              </div>
            </div>

            {event.note && (
              <p className="text-xs text-slate-600 leading-relaxed bg-white/70 p-2 rounded-lg border border-slate-100">
                {event.note}
              </p>
            )}

            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <User className="w-3 h-3 text-slate-400" />
              <span>Initiated by: <strong className="text-slate-700 font-medium">{event.user || 'System'}</strong></span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
