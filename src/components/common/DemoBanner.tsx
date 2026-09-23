// src/components/common/DemoBanner.tsx — Sleek Frosted Amber Banner
import { useAppStore } from '@/state/appStore'
import { AppMode } from '@/domain/models'
import { Sparkles, X } from 'lucide-react'

export function DemoBanner() {
  const { mode, disableDemoMode } = useAppStore()

  if (mode !== AppMode.Demo) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 backdrop-blur-md border-b border-amber-500/30 text-amber-200 text-xs font-medium px-4 py-2 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span>
          <strong className="text-amber-300 font-bold">Interactive Demo Mode</strong> — Demonstrating caregiver observations for <strong>Ravi Kumar</strong>. No private health data is saved or transmitted.
        </span>
      </div>
      <button
        onClick={disableDemoMode}
        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 hover:text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1"
      >
        <span>Exit Demo</span>
        <X size={12} />
      </button>
    </div>
  )
}
