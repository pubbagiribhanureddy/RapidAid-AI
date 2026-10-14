import React, { useState, useEffect } from 'react';
import IncidentMap from '../components/IncidentMap.jsx';
import IncidentDetail from '../components/IncidentDetail.jsx';
import { getIncidents, updateIncident } from '../services/api.js';
import { 
  Layers, 
  AlertCircle, 
  Radio, 
  X, 
  RefreshCw, 
  MapPin, 
  ShieldAlert,
  Flame,
  Users
} from 'lucide-react';

export default function MapPage() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadIncidents = async () => {
    try {
      const data = await getIncidents();
      setIncidents(data || []);
      // If selected incident is currently viewed, refresh its state too
      if (selectedIncident) {
        const updated = (data || []).find((i) => i.id === selectedIncident.id);
        if (updated) setSelectedIncident(updated);
      }
    } catch (err) {
      console.warn('Failed to fetch incidents for map:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleUpdateStatus = async (incidentId, newStatus) => {
    try {
      const updated = await updateIncident(incidentId, { status: newStatus });
      await loadIncidents();
      setSelectedIncident(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleAddNote = async (incidentId, note) => {
    try {
      const updated = await updateIncident(incidentId, { note });
      await loadIncidents();
      setSelectedIncident(updated);
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const handleAssignTeam = async (incidentId, teamName) => {
    try {
      const updated = await updateIncident(incidentId, {
        status: 'in_progress',
        note: `Dispatched unit: ${teamName}`
      });
      await loadIncidents();
      setSelectedIncident(updated);
      alert(`Unit "${teamName}" dispatched to Incident #${incidentId}.`);
    } catch (err) {
      console.error('Failed to assign team:', err);
    }
  };

  // KPI counts
  const criticalCount = incidents.filter((i) => i.severity === 'critical').length;
  const activeCount = incidents.filter((i) => i.status !== 'resolved').length;
  const totalReportsCount = incidents.reduce((sum, i) => sum + (i.report_count || 1), 0);

  return (
    <div className="relative w-full h-[calc(100vh-6rem)] -m-3 md:-m-6 lg:-m-8 overflow-hidden">
      {/* Floating Incident Count Summary (Top Left) */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl border border-slate-200 pointer-events-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
          </span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Hyderabad Live GIS Telemetry
          </h2>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Active</span>
            <span className="text-base font-extrabold text-slate-900">{activeCount}</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-red-500 uppercase font-bold block">Critical</span>
            <span className="text-base font-extrabold text-red-600">{criticalCount}</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Triaged Reports</span>
            <span className="text-base font-extrabold text-blue-600">{totalReportsCount}</span>
          </div>
        </div>
      </div>

      {/* Main Full-Size Map */}
      <IncidentMap
        incidents={incidents}
        selectedIncident={selectedIncident}
        onSelectIncident={(inc) => setSelectedIncident(inc)}
        onRefresh={loadIncidents}
        height="100%"
        showFilters={true}
      />

      {/* Right Slide-in Incident Detail Drawer */}
      {selectedIncident && (
        <div className="absolute top-0 right-0 bottom-0 w-full sm:w-[480px] lg:w-[540px] z-[1100] p-3 sm:p-4 animate-slide-up pointer-events-auto">
          <IncidentDetail
            incident={selectedIncident}
            onClose={() => setSelectedIncident(null)}
            onUpdateStatus={handleUpdateStatus}
            onAddNote={handleAddNote}
            onAssignTeam={handleAssignTeam}
          />
        </div>
      )}
    </div>
  );
}
