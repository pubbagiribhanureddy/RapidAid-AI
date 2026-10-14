import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Menu, Shield, User, Radio, ExternalLink, AlertOctagon } from 'lucide-react';

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Dynamic page title based on path
  const getPageMeta = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'Citizen Emergency Reporting Portal',
          subtitle: 'Submit fast, location-tagged emergency reports with AI analysis',
          badge: 'PUBLIC ACCESS'
        };
      case '/map':
        return {
          title: 'Live Emergency Spatial Map',
          subtitle: 'Real-time Hyderabad incident GIS overview & cluster heat',
          badge: 'LIVE TELEMETRY'
        };
      case '/dashboard':
        return {
          title: 'Incident Command & Coordination Dashboard',
          subtitle: 'Multi-agency dispatch, resource triage & verification',
          badge: 'COORDINATOR PORTAL'
        };
      default:
        return {
          title: 'RapidAid AI',
          subtitle: 'Intelligent Emergency Response',
          badge: 'SYSTEM'
        };
    }
  };

  const meta = getPageMeta();

  const mockNotifications = [
    { id: 1, title: 'Code Red Pileup at Cyber Towers', time: '5m ago', unread: true },
    { id: 2, title: 'GHMC DRF deployed to Begumpet Flood', time: '14m ago', unread: true },
    { id: 3, title: 'Banjara Hills Medical Emergency Resolved', time: '1h ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left side: Hamburger (mobile) + Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {meta.title}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-red-100 text-red-700 uppercase">
                {meta.badge}
              </span>
            </div>
            <p className="hidden md:block text-xs text-slate-500 font-medium">
              {meta.subtitle}
            </p>
          </div>
        </div>

        {/* Right side: Live System Status, Notifications, Emergency Call, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live System Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="tracking-wide text-[11px]">HYDERABAD GRID ACTIVE</span>
          </div>

          {/* Quick 112 Hotline button */}
          <a
            href="tel:112"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors"
            title="Dial National Emergency Hotline"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>112 SOS</span>
          </a>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Incident Alerts</span>
                  <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">2 New</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {mockNotifications.map((n) => (
                    <div key={n.id} className={`px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer ${n.unread ? 'bg-red-50/40' : ''}`}>
                      <div className="flex justify-between items-start">
                        <p className={`text-xs ${n.unread ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{n.title}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-1.5 bg-slate-50 text-center border-t border-slate-100">
                  <button onClick={() => setShowNotifications(false)} className="text-[11px] text-slate-600 hover:text-slate-900 font-medium">Close</button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100">
              <Shield className="w-4 h-4 text-red-400" />
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">Hyd Duty Unit</p>
              <p className="text-[10px] text-slate-500 leading-none">Dispatcher #402</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
