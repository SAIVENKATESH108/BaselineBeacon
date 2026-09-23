// src/components/layout/AppShell.tsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ListPlus, TrendingUp, FileText, Settings,
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
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Demo banner */}
      <DemoBanner />

      {/* Top bar */}
      <header className="bg-navy-800 text-white sticky top-0 z-30 shadow-medium">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 font-semibold text-white hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded"
          >
            <span className="text-teal-400 text-xl">🔦</span>
            <span>BaselineBeacon</span>
          </button>
          {selectedRecipient && (
            <span className="text-xs text-navy-200 bg-navy-700 px-3 py-1 rounded-full">
              {selectedRecipient.name}
            </span>
          )}
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 max-w-5xl mx-auto w-full">
        {/* Sidebar — desktop only */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex flex-col w-56 shrink-0 pt-6 pr-4"
        >
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  'mb-1 min-h-[44px]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                  isActive
                    ? 'bg-teal-600 text-white shadow-teal'
                    : 'text-navy-700 hover:bg-navy-100',
                )
              }
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Page content */}
        <main className="flex-1 min-w-0 py-6 px-4 md:px-6 pb-24 md:pb-6">
          <Outlet />
          <div className="mt-10">
            <Disclaimer compact />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-cream-300 z-30 safe-area-bottom"
      >
        <div className="flex items-stretch">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium',
                  'min-h-[56px] transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400',
                  isActive ? 'text-teal-600' : 'text-navy-500',
                )
              }
            >
              <Icon size={20} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
