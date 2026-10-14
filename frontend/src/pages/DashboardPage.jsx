import React, { useState, useEffect } from 'react';
import StatsPanel from '../components/StatsPanel.jsx';
import IncidentCard from '../components/IncidentCard.jsx';
import IncidentDetail from '../components/IncidentDetail.jsx';
import IncidentMap from '../components/IncidentMap.jsx';
import { 
  getIncidents, 
  getDashboardStats, 
  updateIncident 
} from '../services/api.js';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  MapPin, 
  LayoutList, 
  Map, 
  Download, 
  ShieldCheck, 
  ArrowUpDown, 
  RotateCw,
  Bell,
  Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [rightViewMode, setRightViewMode] = useState('detail'); // 'detail' | 'map'
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('severity'); // 'severity' | 'time' | 'reports'

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incidentList, dashboardStats] = await Promise.all([
        getIncidents(),
        getDashboardStats()
      ]);
      setIncidents(incidentList || []);
      setStats(dashboardStats);

      // Default select the highest priority incident if none selected
      if (!selectedIncident && incidentList && incidentList.length > 0) {
        const sorted = [...incidentList].sort((a, b) => {
          const scoreA = a.ai_analysis?.priority_score || 50;
          const scoreB = b.ai_analysis?.priority_score || 50;
          return scoreB - scoreA;
        });
        setSelectedIncident(sorted[0]);
      } else if (selectedIncident) {
        const updated = (incidentList || []).find((i) => i.id === selectedIncident.id);
        if (updated) setSelectedIncident(updated);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Status handler
  const handleUpdateStatus = async (incidentId, newStatus) => {
    try {
      const updated = await updateIncident(incidentId, { status: newStatus });
      await fetchData();
      setSelectedIncident(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Add Note handler
  const handleAddNote = async (incidentId, note) => {
    try {
      const updated = await updateIncident(incidentId, { note });
      await fetchData();
      setSelectedIncident(updated);
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  // Assign Team handler
  const handleAssignTeam = async (incidentId, teamName) => {
    try {
      const updated = await updateIncident(incidentId, {
        status: 'in_progress',
        note: `Dispatched unit: ${teamName}`
      });
      await fetchData();
      setSelectedIncident(updated);
      alert(`Unit "${teamName}" dispatched to Incident #${incidentId}.`);
    } catch (err) {
      console.error('Failed to dispatch unit:', err);
    }
  };

  // Card Quick Actions
  const handleQuickAction = async (action, incident) => {
    if (action === 'verify') {
      await handleUpdateStatus(incident.id, 'verified');
    } else if (action === 'assign') {
      await handleAssignTeam(incident.id, 'Hyderabad Central Rapid Unit');
    } else if (action === 'escalate') {
      try {
        const updated = await updateIncident(incident.id, {
          severity: 'critical',
          note: 'Escalated to Critical Code Red by Coordinator.'
        });
        await fetchData();
        setSelectedIncident(updated);
      } catch (err) {
        console.error('Escalation failed:', err);
      }
    }
  };

  // Bulk Action: Verify all new
  const handleVerifyAllNew = async () => {
    const newIncidents = incidents.filter((i) => i.status === 'new');
    if (newIncidents.length === 0) {
      alert('No unverified "NEW" incidents found.');
      return;
    }
    for (const inc of newIncidents) {
      await updateIncident(inc.id, { status: 'verified', note: 'Batch-verified by Dispatch Coordinator.' });
    }
    await fetchData();
    alert(`Successfully batch verified ${newIncidents.length} incident(s).`);
  };

  // Bulk Action: Export JSON
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(incidents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `RapidAid_Incidents_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter & Sort Logic
  const filteredIncidents = incidents
    .filter((inc) => {
      if (filterSeverity !== 'all' && inc.severity.toLowerCase() !== filterSeverity.toLowerCase()) return false;
      if (filterStatus !== 'all' && inc.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
      if (filterCategory !== 'all' && inc.category.toLowerCase() !== filterCategory.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = inc.id.toLowerCase().includes(q);
        const matchesTitle = inc.title.toLowerCase().includes(q);
        const matchesLoc = inc.location_name.toLowerCase().includes(q);
        const matchesDesc = inc.description.toLowerCase().includes(q);
        if (!matchesId && !matchesTitle && !matchesLoc && !matchesDesc) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'severity') {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.severity] || 0) - (priorityOrder[a.severity] || 0);
      } else if (sortBy === 'reports') {
        return (b.report_count || 1) - (a.report_count || 1);
      } else {
        // sortBy === 'time'
        return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  const unreadNewCount = incidents.filter((i) => i.status === 'new').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Stats Overview Panel */}
      <StatsPanel stats={stats} />

      {/* Control Toolbar: Search, Filters, Bulk Actions */}
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by incident ID, location (e.g. Begumpet), keywords..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Bulk Actions & View Modes */}
          <div className="flex flex-wrap items-center gap-2">
            {unreadNewCount > 0 && (
              <button
                onClick={handleVerifyAllNew}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-colors"
                title="Verify all pending unverified reports"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Verify All New ({unreadNewCount})</span>
              </button>
            )}

            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Download Incident Audit Data"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export Audit</span>
            </button>

            <button
              onClick={fetchData}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Refresh Data"
            >
              <RotateCw className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Filter by:
            </span>

            {/* Severity Filter */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="verified">Verified</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Categories</option>
              <option value="Road Accident">Road Accident</option>
              <option value="Flood">Flood</option>
              <option value="Fire">Fire</option>
              <option value="Building Collapse">Building Collapse</option>
              <option value="Medical Emergency">Medical Emergency</option>
              <option value="Gas Leak">Gas Leak</option>
              <option value="Power Outage">Power Outage</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="severity">Priority & Severity</option>
              <option value="time">Most Recent</option>
              <option value="reports">Report Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Incident Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Triage Queue ({filteredIncidents.length})
            </h3>
            <span className="text-[11px] text-slate-400">Click card to inspect</span>
          </div>

          <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  isSelected={selectedIncident && selectedIncident.id === incident.id}
                  onSelect={(inc) => setSelectedIncident(inc)}
                  onQuickAction={handleQuickAction}
                />
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No incidents matched your filter parameters.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Incident Detail OR Map Overview (7 cols) */}
        <div className="lg:col-span-7 sticky top-20 space-y-3">
          {/* View Mode Toggle: Detail vs Map */}
          <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setRightViewMode('detail')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  rightViewMode === 'detail'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>AI Triage Inspection</span>
              </button>

              <button
                onClick={() => setRightViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  rightViewMode === 'map'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Live Location Map</span>
              </button>
            </div>

            {selectedIncident && (
              <span className="text-xs font-mono font-bold text-slate-500 pr-2">
                Active: {selectedIncident.id}
              </span>
            )}
          </div>

          {/* Dynamic Content Panel */}
          {rightViewMode === 'detail' ? (
            selectedIncident ? (
              <IncidentDetail
                incident={selectedIncident}
                onUpdateStatus={handleUpdateStatus}
                onAddNote={handleAddNote}
                onAssignTeam={handleAssignTeam}
              />
            ) : (
              <div className="h-96 flex items-center justify-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                Select an incident from the queue to review AI details.
              </div>
            )
          ) : (
            <div className="h-[650px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <IncidentMap
                incidents={incidents}
                selectedIncident={selectedIncident}
                onSelectIncident={(inc) => {
                  setSelectedIncident(inc);
                  setRightViewMode('detail');
                }}
                onRefresh={fetchData}
                height="100%"
                showFilters={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
