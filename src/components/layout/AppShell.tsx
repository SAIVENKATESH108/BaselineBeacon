// src/components/layout/AppShell.tsx — Unified Deep Glassmorphic Shell
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ListPlus, TrendingUp, FileText, Settings, Plus, Sparkles
} from 'lucide-react'
import { DemoBanner } from '@/components/common/DemoBanner'
import { Disclaimer } from '@/components/common/Disclaimer'
import { useAppStore } from '@/state/appStore'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/observe',   icon: ListPlus,        label: 'Add Note' },
  { to: '/timeline',  icon: TrendingUp,      label: 'Timeline' },
  { to: '/report',    icon: FileText,        label: 'Report' },
  { to: '/baseline',  icon: Settings,        label: 'Baseline' },
]

export function AppShell() {
  const { selectedRecipient } = useAppStore()
  const navigate = useNavigate()

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Demo Notification Banner (fixed shrink-0) */}
      <div className="shrink-0 z-40">
        <DemoBanner />
      </div>

      {/* Top Glassmorphic Navigation Bar (fixed shrink-0) */}
      <header className="shrink-0 bg-navy-950/90 backdrop-blur-xl border-b border-slate-800/90 text-white z-30 shadow-lg shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 font-bold text-white hover:opacity-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-lg group"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 shadow-md shadow-teal-500/30 group-hover:scale-105 transition-transform">
              <span className="text-lg">🔦</span>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-teal-100 to-teal-300 bg-clip-text text-transparent">
                BaselineBeacon
              </span>
              <span className="hidden sm:block text-[10px] text-teal-300/80 font-medium -mt-1">
                Caregiver Companion
              </span>
            </div>
          </button>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* Recipient Profile Chip */}
            {selectedRecipient && (
              <div className="flex items-center gap-2 bg-navy-900/90 border border-teal-500/30 px-3.5 py-1.5 rounded-full shadow-sm">
                <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-teal-400 to-cyan-500 text-navy-950 text-[10px] font-black flex items-center justify-center">
                  {selectedRecipient.name.slice(0, 1)}
                </span>
                <span className="text-xs font-bold text-teal-200">
                  {selectedRecipient.name}
                </span>
              </div>
            )}

            {/* Quick Add Note Button in Header */}
            <button
              onClick={() => navigate('/observe')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-teal-500/25 active:scale-95 transition-all"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Add Note</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout (fills remaining viewport, sidebar fixed, main scrolls) */}
      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full px-4 sm:px-6">
        {/* Desktop Sidebar Navigation (FIXED in place, no-scrollbar) */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex flex-col w-64 shrink-0 py-6 pr-6 overflow-y-auto no-scrollbar justify-between"
        >
          <div className="space-y-1.5">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200',
                    'min-h-[46px] group border',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-teal-400/40 shadow-lg shadow-teal-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border-transparent hover:border-slate-800',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      className={cn(
                        'transition-transform duration-200 group-hover:scale-110',
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400',
                      )}
                      aria-hidden="true"
                    />
                    <span>{label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Quick Helper Card in Sidebar */}
          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-navy-900/90 to-teal-950/40 border border-teal-500/20 shadow-md text-xs space-y-2 shrink-0">
            <div className="flex items-center gap-1.5 font-bold text-teal-300">
              <Sparkles size={14} className="text-teal-400" />
              <span>Caregiver Tip</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-normal">
              Daily notes build an objective multi-day pattern. Compare with saved baseline before appointments.
            </p>
          </div>
        </nav>

        {/* Page Main Content (ONLY this section scrolls vertically, no visible scrollbar) */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto no-scrollbar py-6 md:px-6 pb-28 md:pb-12">
          <Outlet />
          <div className="mt-12">
            <Disclaimer compact />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-navy-950/95 backdrop-blur-xl border-t border-slate-800/90 z-30 safe-area-bottom shadow-2xl"
      >
        <div className="flex items-stretch justify-around px-2">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[11px] font-bold',
                  'min-h-[58px] transition-all relative',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400',
                  isActive ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={21}
                    className={cn(
                      'transition-transform duration-150',
                      isActive ? 'scale-110 text-teal-400' : 'text-slate-500',
                    )}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                  {isActive && (
                    <span className="absolute top-1 w-6 h-0.5 rounded-full bg-teal-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
