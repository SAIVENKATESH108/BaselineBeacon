// src/components/common/Disclaimer.tsx — Safety Boundary Language
import { ShieldCheck, Info } from 'lucide-react'

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 text-center px-4 py-3">
        <ShieldCheck size={14} className="text-teal-400 shrink-0" />
        <span>
          BaselineBeacon organizes caregiver-reported observations and does not diagnose, treat, or replace professional medical advice.
        </span>
      </div>
    )
  }
  return (
    <div className="rounded-2xl bg-amber-500/10 border border-amber-500/25 p-4.5 flex gap-3.5 items-start text-amber-200">
      <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
        <Info size={16} />
      </div>
      <div className="text-xs sm:text-sm leading-relaxed">
        <strong className="text-amber-300 font-bold block mb-0.5">Clinical Safety Notice</strong>
        BaselineBeacon organizes caregiver-reported observations and does{' '}
        <strong className="text-white font-bold">not</strong> diagnose, treat, or replace professional medical advice. All observations are
        caregiver-reported. Consider discussing any concerns with a qualified healthcare professional.
      </div>
    </div>
  )
}
