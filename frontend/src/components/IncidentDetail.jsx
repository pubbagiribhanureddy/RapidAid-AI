import React, { useState } from 'react';
import PriorityBadge from './PriorityBadge.jsx';
import StatusTimeline from './StatusTimeline.jsx';
import { 
  X, 
  MapPin, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  Send, 
  Truck, 
  HelpCircle,
  FileText,
  UserCheck,
  Flame,
  Radio,
  ExternalLink
} from 'lucide-react';

export default function IncidentDetail({ incident, onClose, onUpdateStatus, onAddNote, onAssignTeam }) {
  if (!incident) return null;

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'reports' | 'timeline'
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(incident.status);

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    setSelectedStatus(status);
    if (onUpdateStatus) {
      await onUpdateStatus(incident.id, status);
    }
  };

  const handleAddNoteSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsSubmittingNote(true);
    if (onAddNote) {
      await onAddNote(incident.id, newNote);
      setNewNote('');
    }
    setIsSubmittingNote(false);
  };

  const ai = incident.ai_analysis || {};
  const hazards = ai.extracted_entities?.hazards || [];
  const missingInfo = ai.missing_information || [];
  const responders = ai.recommended_responders || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full max-h-[calc(100vh-6rem)]">
      {/* Top Header Banner */}
      <div className="p-4 md:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-mono text-xs text-red-400 font-bold bg-red-950/80 px-2 py-0.5 rounded border border-red-500/30">
              {incident.id}
            </span>
            <span className="text-xs text-slate-300 font-semibold bg-slate-800 px-2 py-0.5 rounded">
              {incident.category}
            </span>
            <PriorityBadge severity={incident.severity} score={ai.priority_score} size="sm" />
          </div>
          <h2 className="text-base md:text-lg font-bold text-white leading-snug">
            {incident.title}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1">
            <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>{incident.location_name}</span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-[11px] text-slate-400">
              ({incident.latitude?.toFixed(4)}, {incident.longitude?.toFixed(4)})
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'overview'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Analysis & Triage</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'reports'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Linked Reports ({incident.linked_reports?.length || incident.report_count || 1})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'timeline'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Audit Timeline</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5">
        {activeTab === 'overview' && (
          <>
            {/* AI Summary Box */}
            <div className="rounded-xl p-4 bg-gradient-to-br from-red-50/60 via-slate-50 to-blue-50/40 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-red-600 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  RapidAid AI Intelligence Brief
                </h4>
                <span className="ml-auto text-[10px] font-mono font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  Score: {ai.priority_score || 85}/100
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {ai.summary || incident.description}
              </p>
              {ai.priority_explanation && (
                <div className="mt-2 text-[11px] text-slate-500 bg-white/80 p-2.5 rounded-lg border border-slate-200/60">
                  <strong className="text-slate-700">Urgency Rationale: </strong>
                  {ai.priority_explanation}
                </div>
              )}
            </div>

            {/* Critical Hazard Alert Warnings */}
            {hazards.length > 0 && (
              <div className="rounded-xl p-3.5 bg-red-50 border border-red-200/80">
                <div className="flex items-center gap-2 text-red-700 font-bold text-xs mb-2">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Identified Site Hazards ({hazards.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {hazards.map((hazard, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-white text-red-800 font-semibold border border-red-200 shadow-2xs"
                    >
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                      {hazard}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Entities Grid */}
            {ai.extracted_entities && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  NLP Key Data Extraction
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(ai.extracted_entities).map(([key, value]) => {
                    if (key === 'hazards') return null;
                    return (
                      <div key={key} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommended Responders */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>AI Recommended Dispatch Units</span>
                <span className="text-[10px] text-blue-600 font-medium">Automatic Matching</span>
              </h4>
              <div className="space-y-1.5">
                {responders.length > 0 ? (
                  responders.map((resp, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/50 border border-blue-200/60 text-xs"
                    >
                      <div className="flex items-center gap-2 font-semibold text-blue-900">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span>{resp}</span>
                      </div>
                      <button
                        onClick={() => onAssignTeam && onAssignTeam(incident.id, resp)}
                        className="text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Dispatch Unit
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">All standard emergency protocols apply.</p>
                )}
              </div>
            </div>

            {/* Missing Information Checklist */}
            {missingInfo.length > 0 && (
              <div className="rounded-xl p-3.5 bg-amber-50/70 border border-amber-200/70">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs mb-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Information Gaps for Field Units</span>
                </div>
                <ul className="list-disc list-inside text-xs text-amber-900 space-y-1">
                  {missingInfo.map((gap, i) => (
                    <li key={i}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Tab 2: Linked Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 font-medium">
                {incident.linked_reports?.length || 0} citizen dispatches grouped by AI correlation
              </p>
            </div>

            {incident.linked_reports && incident.linked_reports.length > 0 ? (
              incident.linked_reports.map((report, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 hover:bg-slate-100/50 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700">{report.id || `REP-#${idx + 1}`}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                        {report.language === 'te' ? 'Telugu 🇮🇳' : 'English 🇬🇧'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 mb-2 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                    "{report.text}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Reporter: <strong>{report.reporter_name || 'Anonymous Citizen'}</strong></span>
                    {report.phone && <span className="font-mono">{report.phone}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No linked reports available for this incident.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Timeline */}
        {activeTab === 'timeline' && (
          <StatusTimeline events={incident.timeline || []} />
        )}
      </div>

      {/* Action Footer & Notes Bar */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
        {/* Quick Status Select */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Triage Status:</span>
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="new">NEW (Unverified)</option>
              <option value="verified">VERIFIED (Confirmed)</option>
              <option value="in_progress">IN PROGRESS (Dispatched)</option>
              <option value="resolved">RESOLVED (Closed)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAssignTeam && onAssignTeam(incident.id, 'Central Quick Response')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assign Responders</span>
            </button>
          </div>
        </div>

        {/* Add Note Input Form */}
        <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add operational dispatch note..."
            className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            disabled={isSubmittingNote || !newNote.trim()}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post Note</span>
          </button>
        </form>
      </div>
    </div>
  );
}
