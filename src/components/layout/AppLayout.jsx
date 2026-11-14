'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * Master Responsive Layout Wrapper (2026 SaaS Layout Standard)
 * Features:
 * 1. Strict Auth Route Guard: Redirects to /login if user is not authenticated.
 * 2. Fixed Viewport (h-screen overflow-hidden) - Zero window scroll, zero bottom gap.
 * 3. Dedicated scrollable content area (<main className="flex-1 overflow-y-auto">).
 * 4. Desktop & Mobile Sidebar Collapse/Expand toggle state + Ctrl+B shortcut.
 */
export default function AppLayout({
  children,
  title,
  subtitle,
  actionButton = null,
}) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Client-Side Auth Verification Guard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('careguide_token');
      if (!token) {
        router.replace('/login');
        return;
      }
      setCheckingAuth(false);
    }
  }, [router]);

  // Toggle sidebar for both mobile and desktop
  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show security spinner while verifying authentication
  if (checkingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-teal-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Verifying security credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-800 antialiased">
      {/* Desktop Persistent Full-Height Sidebar */}
      <div
        className={`hidden lg:block shrink-0 h-full transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 shadow-2xl">
            <Sidebar
              isCollapsed={false}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Header
          title={title}
          subtitle={subtitle}
          actionButton={actionButton}
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
