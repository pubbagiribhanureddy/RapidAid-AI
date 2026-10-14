import React from 'react';
import { 
  AlertOctagon, 
  Flame, 
  Activity, 
  CheckCircle2, 
  FileText, 
  TrendingUp, 
  Layers 
} from 'lucide-react';

export default function StatsPanel({ stats }) {
  const s = stats || {
    total_incidents: 7,
    critical_incidents: 2,
    active_responses: 4,
    resolved_today: 1,
    reports_received: 28,
    categories: {
      'Road Accident': 1,
      'Flood': 1,
      'Fire': 1,
      'Building Collapse': 1,
      'Gas Leak': 1,
      'Medical Emergency': 1,
      'Power Outage': 1,
    },
    trend: '+14% vs yesterday'
  };

  const statCards = [
    {
      title: 'Total Active Incidents',
      value: s.total_incidents,
      subtitle: s.trend || '+12% vs last shift',
      icon: Layers,
      color: 'text-slate-900',
      bgColor: 'bg-white',
      borderColor: 'border-slate-200',
      badgeBg: 'bg-slate-100 text-slate-700',
      isCritical: false
    },
    {
      title: 'Critical Code Red',
      value: s.critical_incidents,
      subtitle: 'Immediate rescue required',
      icon: AlertOctagon,
      color: 'text-red-700',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100/50',
      borderColor: 'border-red-300',
      badgeBg: 'bg-red-600 text-white animate-pulse',
      isCritical: true
    },
    {
      title: 'Active Dispatches',
      value: s.active_responses,
      subtitle: 'Field units deployed',
      icon: Activity,
      color: 'text-blue-700',
      bgColor: 'bg-white',
      borderColor: 'border-slate-200',
      badgeBg: 'bg-blue-100 text-blue-800',
      isCritical: false
    },
    {
      title: 'Resolved Today',
      value: s.resolved_today,
      subtitle: 'All civilians stabilized',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bgColor: 'bg-white',
      borderColor: 'border-slate-200',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      isCritical: false
    },
    {
      title: 'Citizen Reports Triaged',
      value: s.reports_received,
      subtitle: 'AI correlated & grouped',
      icon: FileText,
      color: 'text-purple-700',
      bgColor: 'bg-white',
      borderColor: 'border-slate-200',
      badgeBg: 'bg-purple-100 text-purple-800',
      isCritical: false
    },
  ];

  const categories = s.categories || {};
  const maxCategoryCount = Math.max(1, ...Object.values(categories));

  const getCategoryColor = (catName) => {
    switch (catName.toLowerCase()) {
      case 'fire': return 'bg-orange-500';
      case 'flood': return 'bg-cyan-500';
      case 'road accident': return 'bg-red-500';
      case 'building collapse': return 'bg-amber-600';
      case 'gas leak': return 'bg-purple-500';
      case 'medical emergency': return 'bg-emerald-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border shadow-xs transition-all hover:shadow-md ${card.bgColor} ${card.borderColor}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 tracking-tight">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.badgeBg}`}>
                <card.icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className={`text-2xl md:text-3xl font-extrabold tracking-tight ${card.color}`}>
                {card.value}
              </span>
              {card.isCritical && (
                <span className="text-[10px] uppercase font-black tracking-widest text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                  P1
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 mt-1 font-medium truncate">
              {card.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* Category Breakdown Bar Chart */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Incident Distribution by Category
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Real-time breakdown</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {Object.entries(categories).map(([cat, count]) => {
            const percentage = Math.round((count / maxCategoryCount) * 100);
            return (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="truncate">{cat}</span>
                  <span className="font-mono text-slate-900">{count}</span>
                </div>
                {/* Visual Bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getCategoryColor(cat)}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
