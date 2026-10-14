import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import { 
  AlertCircle, 
  MapPin, 
  LayoutDashboard, 
  PhoneCall, 
  Flame, 
  X, 
  ExternalLink,
  ShieldAlert,
  Radio,
  Clock,
  Sparkles
} from 'lucide-react';

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    {
      to: '/',
      label: 'Report Emergency',
      icon: AlertCircle,
      badge: 'Public SOS',
      badgeColor: 'bg-red-500/20 text-red-300'
    },
    {
      to: '/map',
      label: 'Live Incident Map',
      icon: MapPin,
      badge: 'GIS Live',
      badgeColor: 'bg-blue-500/20 text-blue-300'
    },
    {
      to: '/dashboard',
      label: 'Coordinator Dashboard',
      icon: LayoutDashboard,
      badge: 'Command',
      badgeColor: 'bg-emerald-500/20 text-emerald-300'
    },
  ];

  const emergencyContacts = [
    { label: 'National SOS', number: '112', desc: 'Police / Fire / Ambulance' },
    { label: 'Medical EMS', number: '108', desc: 'Emergency Medical Transit' },
    { label: 'Telangana Fire', number: '101', desc: 'Rescue & Hazard Control' },
    { label: 'GHMC Monsoon Cell', number: '040-21111111', desc: 'Urban Inundation / Trees' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Professional Dark Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-gradient-to-b from-[#0e1d2f] via-[#12243a] to-[#0a1523] text-white z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800/80 shadow-2xl ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Brand Banner */}
        <div>
          <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/90 flex items-center justify-center text-white shadow-lg shadow-red-600/30 ring-2 ring-red-400/30">
                <span className="text-xl">🚨</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">RapidAid</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-600 text-white tracking-widest uppercase">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Smart Disaster Intelligence</p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* AI Status Banner */}
          <div className="mx-4 mt-4 p-3 rounded-xl bg-gradient-to-r from-red-950/40 to-slate-900/60 border border-red-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-xs font-semibold text-slate-200">Gemini AI Triage Engine</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Multilingual deduplication, spatial clustering & priority scoring online.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 mt-2">
            <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-2">
              Platform Modules
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer: Emergency Hotlines Directory */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold text-xs">
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              <span>Hyderabad Hotlines</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-medium">24/7 TOLL-FREE</span>
          </div>

          <div className="space-y-1.5">
            {emergencyContacts.map((c, i) => (
              <a
                key={i}
                href={`tel:${c.number.replace(/-/g, '')}`}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-xs transition-colors group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-red-400 transition-colors">
                    {c.label}
                  </div>
                  <div className="text-[10px] text-slate-500">{c.desc}</div>
                </div>
                <div className="font-mono font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/20 group-hover:bg-red-600 group-hover:text-white transition-all">
                  {c.number}
                </div>
              </a>
            ))}
          </div>

          <div className="mt-3 text-center">
            <p className="text-[10px] text-slate-500">
              Prototype for Smart Cities Hackathon 2026
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 p-3 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
