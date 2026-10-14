import React, { useState, useEffect } from 'react';
import ReportForm from '../components/ReportForm.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import { getIncidents } from '../services/api.js';
import { 
  PhoneCall, 
  Sparkles, 
  Cpu, 
  Send, 
  MapPin, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Radio, 
  CheckCircle2,
  Users
} from 'lucide-react';

export default function ReportPage() {
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);

  const fetchRecent = async () => {
    try {
      const data = await getIncidents();
      setRecentIncidents((data || []).slice(0, 5));
    } catch (err) {
      console.warn('Failed to fetch recent incidents:', err);
    } finally {
      setLoadingIncidents(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const timeAgo = (dateStr) => {
    try {
      const diff = Math.floor((new Date() - new Date(dateStr)) / 1000 / 60);
      if (diff < 1) return 'Just now';
      if (diff < 60) return `${diff}m ago`;
      return `${Math.floor(diff / 60)}h ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Immediate Emergency SOS Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white p-4 sm:p-5 shadow-lg shadow-red-600/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <PhoneCall className="w-6 h-6 text-white animate-bounce" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              Life-Threatening Emergency? Dial 112 Immediately
            </h2>
            <p className="text-xs sm:text-sm text-red-100 font-medium">
              National Emergency Services are active 24/7. Use RapidAid AI for high-accuracy location tracking & evidence sharing.
            </p>
          </div>
        </div>

        <a
          href="tel:112"
          className="px-5 py-2.5 rounded-xl bg-white text-red-700 hover:bg-red-50 font-black text-sm tracking-wide shadow-md transition-all shrink-0"
        >
          CALL 112 NOW
        </a>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <ReportForm onReportSubmitted={fetchRecent} />
        </div>

        {/* Right Column: Informational Sidebar & Recent Reports (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* How RapidAid AI Works */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                How RapidAid AI Works
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Submit In Any Language</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Speak or type in Telugu or English. Add GPS location & scene photos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">AI Correlates & De-duplicates</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    NLP clusters separate reports within 150m, extracting trapped persons and hazards.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Smart Agency Dispatch</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Traffic Police, Fire Services, SDRF and 108 EMS dispatched with exact coordinates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Hyderabad Incidents Feed */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                <span>Active In Hyderabad</span>
              </h3>
              <a
                href="/map"
                className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5"
              >
                <span>Live Map</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {loadingIncidents ? (
              <p className="text-xs text-slate-400 py-4 text-center">Loading live dispatch feed...</p>
            ) : recentIncidents.length > 0 ? (
              <div className="space-y-2.5">
                {recentIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-500">{inc.id}</span>
                      <PriorityBadge severity={inc.severity} size="sm" showIcon={false} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{inc.title}</h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                      <span className="truncate max-w-[160px] flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        {inc.location_name}
                      </span>
                      <span className="font-mono text-slate-400">{timeAgo(inc.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No active incidents in your zone.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
