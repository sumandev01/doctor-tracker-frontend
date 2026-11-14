'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { dataService } from '@/services/dataService';
import {
  LayoutDashboard,
  Users,
  UserRound,
  LogOut,
  HeartPulse,
  PanelLeftClose,
  PanelLeft,
  ShieldCheck,
} from 'lucide-react';

export default function Sidebar({
  isCollapsed = false,
  onToggleCollapse = () => {},
  onCloseMobile = () => {},
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = dataService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    dataService.logout();
    router.push('/login');
  };

  const allNavItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      label: 'Doctors',
      href: '/doctors',
      icon: UserRound,
    },
    {
      label: 'Patients',
      href: '/patients',
      icon: Users,
    },
    {
      label: 'Staff & Users',
      href: '/users',
      icon: ShieldCheck,
      adminOnly: true,
    },
  ];

  // Completely hide 'Staff & Users' menu unless explicitly logged in with Admin role
  const navItems = allNavItems.filter((item) => {
    if (item.adminOnly) {
      return currentUser?.role === 'Admin';
    }
    return true;
  });

  const displayName = currentUser?.name || 'Care Guide Admin';
  const displayEmail = currentUser?.email || 'admin@careguide.bd';
  const displayRole = currentUser?.role || 'Admin';
  const initials = displayName
    .replace('Dr. ', '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CG';

  return (
    <aside
      className={cn(
        'h-full bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-all duration-300 select-none overflow-hidden',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        {/* Brand / Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          {isCollapsed ? (
            <div className="w-full flex items-center justify-center">
              <button
                onClick={onToggleCollapse}
                type="button"
                title="Expand Sidebar (Ctrl+B)"
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 hover:scale-105 transition"
                aria-label="Expand Sidebar"
              >
                <HeartPulse className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/"
                onClick={onCloseMobile}
                className="flex items-center gap-3 min-w-0"
                title="Doctor Tracker"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white shrink-0">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-lg tracking-tight text-white block truncate">
                    Doctor<span className="text-teal-400">Tracker</span>
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider truncate">
                    Care Guide BD
                  </span>
                </div>
              </Link>

              {/* Desktop Collapse Button */}
              <button
                onClick={onToggleCollapse}
                type="button"
                title="Collapse Sidebar (Ctrl+B)"
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                aria-label="Collapse Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5 text-sm">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Main Menu
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center rounded-lg font-medium transition duration-150 select-none group cursor-pointer',
                  isCollapsed ? 'justify-center p-3 hover:scale-105' : 'gap-3 px-3.5 py-2.5 hover:translate-x-0.5',
                  isActive
                    ? 'bg-teal-600/20 text-teal-300 border border-teal-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                )}
              >
                <Icon
                  className={cn(
                    'shrink-0 transition-colors',
                    isCollapsed ? 'w-5 h-5' : 'w-4 h-4',
                    isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                />

                {!isCollapsed && (
                  <span className="truncate flex-1 tracking-normal">{item.label}</span>
                )}

                {!isCollapsed && isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-teal-400"></span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Authenticated User Profile & Live Logout */}
      <div className="p-3 border-t border-slate-800">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              title={`${displayName} (${displayRole})`}
              className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center border border-teal-500/30 text-xs cursor-default"
            >
              {initials}
            </div>
            <button
              onClick={handleLogout}
              type="button"
              title="Sign Out"
              className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center border border-teal-500/30 shrink-0 text-xs">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{displayName}</p>
              <p className="text-[11px] text-teal-400 truncate">{displayEmail} • {displayRole}</p>
            </div>
            <button
              onClick={handleLogout}
              type="button"
              title="Sign Out"
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
