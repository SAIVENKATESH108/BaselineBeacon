// src/components/common/DemoBanner.tsx
import { useAppStore } from '@/state/appStore'
import { AppMode } from '@/domain/models'

export function DemoBanner() {
  const { mode, disableDemoMode } = useAppStore()

  if (mode !== AppMode.Demo) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-400 text-navy-900 text-sm font-medium px-4 py-2 flex items-center justify-between gap-4"
    >
      <span>
        🔬 <strong>Demo Mode</strong> — Using fictional data about Ravi Kumar. No real data is stored or transmitted.
      </span>
      <button
        onClick={disableDemoMode}
        className="underline text-navy-800 hover:text-navy-900 text-xs shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 rounded"
      >
        Exit Demo
      </button>
    </div>
  )
}
