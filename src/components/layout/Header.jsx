'use client';

import React from 'react';
import { Search, Bell, PanelLeft, PanelLeftClose, Menu } from 'lucide-react';

export default function Header({
  title = 'Hospital Analytics Dashboard',
  subtitle = 'Live Doctor-Patient Monitoring & Metrics Overview',
  actionButton = null,
  onToggleSidebar = () => {},
  isSidebarCollapsed = false,
}) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Toggle Button for BOTH Desktop and Mobile */}
        <button
          onClick={onToggleSidebar}
          type="button"
          title={isSidebarCollapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar (Ctrl+B)'}
          className="p-2 text-slate-600 hover:text-teal-600 rounded-lg hover:bg-slate-100 border border-slate-200/80 shadow-xs transition shrink-0"
          aria-label="Toggle Sidebar Navigation"
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="w-5 h-5 text-teal-600" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        <div className="min-w-0">
          <h1 className="text-sm md:text-base lg:text-lg font-bold text-slate-900 tracking-tight truncate">
            {title}
          </h1>
          <p className="text-[11px] md:text-xs text-slate-500 hidden sm:block truncate">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Global Search Bar */}
        <div className="relative hidden xl:block w-64">
          <input
            type="text"
            placeholder="Search portal..."
            className="w-full bg-slate-50 text-xs text-slate-700 pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        {/* Action Button (e.g. + New Doctor) */}
        {actionButton}

        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
}
