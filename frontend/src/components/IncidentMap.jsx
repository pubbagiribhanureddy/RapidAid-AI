import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Filter, 
  RotateCw, 
  Layers, 
  Compass, 
  Eye, 
  ChevronRight,
  Flame,
  AlertTriangle,
  Waves,
  Car,
  Wind,
  Stethoscope,
  Building2,
  Zap,
  Info
} from 'lucide-react';

export default function IncidentMap({
  incidents = [],
  selectedIncident,
  onSelectIncident,
  onRefresh,
  height = '100%',
  showFilters = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [activeFilterCategory, setActiveFilterCategory] = useState('all');
  const [activeFilterSeverity, setActiveFilterSeverity] = useState('all');
  const [activeFilterStatus, setActiveFilterStatus] = useState('all');
  const [mapStyle, setMapStyle] = useState('standard'); // 'standard' | 'dark' | 'topo'
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(30);

  // Tile layer configurations
  const tileLayers = {
    standard: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors'
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CARTO &copy; OpenStreetMap contributors'
    },
    topo: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CARTO &copy; OpenStreetMap contributors'
    }
  };

  // Category emoji lookup for custom pin markers
  const getCategoryEmoji = (category = '') => {
    switch (category.toLowerCase()) {
      case 'fire': return '🔥';
      case 'road accident': return '🚗';
      case 'flood': return '🌊';
      case 'building collapse': return '🏢';
      case 'medical emergency': return '🩺';
      case 'gas leak': return '💨';
      case 'power outage': return '⚡';
      default: return '⚠️';
    }
  };

  // Severity color lookup
  const getSeverityColors = (severity = 'medium') => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return {
          bg: '#dc2626',
          border: '#ffffff',
          ring: 'rgba(220, 38, 38, 0.45)',
          pulse: true,
          label: 'Critical'
        };
      case 'high':
        return {
          bg: '#ea580c',
          border: '#ffffff',
          ring: 'rgba(234, 88, 12, 0.35)',
          pulse: false,
          label: 'High'
        };
      case 'medium':
        return {
          bg: '#eab308',
          border: '#ffffff',
          ring: 'rgba(234, 179, 8, 0.3)',
          pulse: false,
          label: 'Medium'
        };
      case 'low':
      default:
        return {
          bg: '#2563eb',
          border: '#ffffff',
          ring: 'rgba(37, 99, 235, 0.3)',
          pulse: false,
          label: 'Low'
        };
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent duplicate init

    // Default center: Hyderabad, India
    const map = L.map(mapContainerRef.current, {
      center: [17.4200, 78.4350],
      zoom: 12,
      zoomControl: false,
    });

    // Add zoom controls to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial base tile layer
    const initialTile = L.tileLayer(tileLayers.standard.url, {
      attribution: tileLayers.standard.attribution,
      maxZoom: 19,
    }).addTo(map);
    tileLayerRef.current = initialTile;

    // Feature group for markers
    const markersGroup = L.featureGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    // Invalidate size once DOM stabilizes
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Base Tile Style changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const cfg = tileLayers[mapStyle] || tileLayers.standard;
    const newTile = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: 19,
    }).addTo(map);
    tileLayerRef.current = newTile;
  }, [mapStyle]);

  // Handle Markers Rendering based on incidents & filters
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // Filter incidents
    const filtered = incidents.filter((inc) => {
      if (activeFilterCategory !== 'all' && inc.category.toLowerCase() !== activeFilterCategory.toLowerCase()) return false;
      if (activeFilterSeverity !== 'all' && inc.severity.toLowerCase() !== activeFilterSeverity.toLowerCase()) return false;
      if (activeFilterStatus !== 'all' && inc.status.toLowerCase() !== activeFilterStatus.toLowerCase()) return false;
      return true;
    });

    filtered.forEach((inc) => {
      if (!inc.latitude || !inc.longitude) return;

      const colors = getSeverityColors(inc.severity);
      const emoji = getCategoryEmoji(inc.category);
      const isSelected = selectedIncident && selectedIncident.id === inc.id;

      // Custom marker icon HTML
      const markerHtml = `
        <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${colors.pulse ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: ${colors.ring}; animation: pulse-ring 1.8s infinite;"></div>` : ''}
          <div style="
            width: ${isSelected ? '36px' : '32px'};
            height: ${isSelected ? '36px' : '32px'};
            background: ${colors.bg};
            border: 2.5px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: ${isSelected ? '16px' : '14px'};
              user-select: none;
            ">${emoji}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-incident-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon });

      // Interactive popup
      const popupHtml = `
        <div style="font-family: inherit; width: 250px; padding: 12px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; font-family: monospace; color: #64748b; text-transform: uppercase;">${inc.id}</span>
            <span style="font-size: 10px; font-weight: 700; background: ${colors.bg}; color: white; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${inc.severity}
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">
            ${inc.title}
          </h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; display: flex; align-items: center; gap: 4px;">
            📍 ${inc.location_name}
          </p>
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-bottom: 8px;">
            <span>Reports: <strong>${inc.report_count || 1}</strong></span>
            <span>Status: <strong style="text-transform: uppercase;">${inc.status}</strong></span>
          </div>
          <button id="btn-inspect-${inc.id}" style="
            width: 100%;
            background: #dc2626;
            color: white;
            border: none;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          ">
            Inspect Full Incident Details
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${inc.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectIncident) onSelectIncident(inc);
            map.closePopup();
          };
        }
      });

      marker.on('click', () => {
        if (onSelectIncident) onSelectIncident(inc);
      });

      markersGroup.addLayer(marker);
    });

    // Pan map to selected incident if any
    if (selectedIncident && selectedIncident.latitude && selectedIncident.longitude) {
      map.flyTo([selectedIncident.latitude, selectedIncident.longitude], 14, {
        duration: 1.2
      });
    }
  }, [incidents, selectedIncident, activeFilterCategory, activeFilterSeverity, activeFilterStatus]);

  // Auto-refresh countdown (30s)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          if (onRefresh) onRefresh();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRefresh]);

  const handleManualRefresh = () => {
    setSecondsUntilRefresh(30);
    if (onRefresh) onRefresh();
  };

  const handleRecenterHyderabad = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([17.4200, 78.4350], 12, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />

      {/* Floating Header Controls */}
      {showFilters && (
        <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Quick Filter Bar (Left) */}
          <div className="bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-200 pointer-events-auto flex flex-wrap items-center gap-2 max-w-full">
            <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-red-600" />
              <span>Filters:</span>
            </div>

            {/* Severity Filter */}
            <select
              value={activeFilterSeverity}
              onChange={(e) => setActiveFilterSeverity(e.target.value)}
              className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Only</option>
              <option value="medium">Medium Only</option>
              <option value="low">Low Only</option>
            </select>

            {/* Category Filter */}
            <select
              value={activeFilterCategory}
              onChange={(e) => setActiveFilterCategory(e.target.value)}
              className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
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

            {/* Status Filter */}
            <select
              value={activeFilterStatus}
              onChange={(e) => setActiveFilterStatus(e.target.value)}
              className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="verified">Verified</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Map Layer Switcher & Re-center (Right) */}
          <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-slate-200 pointer-events-auto flex items-center gap-1.5">
            <button
              onClick={() => setMapStyle(mapStyle === 'standard' ? 'dark' : mapStyle === 'dark' ? 'topo' : 'standard')}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-medium"
              title="Toggle Map Style (Street / Tactical Dark / Detailed)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="capitalize">{mapStyle}</span>
            </button>

            <button
              onClick={handleRecenterHyderabad}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Recenter on Hyderabad"
            >
              <Compass className="w-4 h-4 text-blue-600" />
            </button>

            <button
              onClick={handleManualRefresh}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              title="Refresh Incident Feed"
            >
              <RotateCw className="w-3 h-3 text-red-600" />
              <span className="font-mono text-[11px]">{secondsUntilRefresh}s</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Legend (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200 text-xs pointer-events-auto max-w-xs hidden sm:block">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
          Incident Severity Key
        </span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            <span className="font-semibold text-slate-700">Critical (Code Red)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
            <span className="font-semibold text-slate-700">High Priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span className="font-semibold text-slate-700">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="font-semibold text-slate-700">Low / Monitored</span>
          </div>
        </div>
      </div>
    </div>
  );
}
