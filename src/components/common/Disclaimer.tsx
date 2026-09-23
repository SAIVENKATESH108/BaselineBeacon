// src/components/common/Disclaimer.tsx
// REQUIRED on every page — safety boundary language from AI_AGENT_RULES.md §2

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-gray-500 text-center px-4 py-2">
        BaselineBeacon organizes caregiver-reported observations and does not diagnose, treat, or replace professional medical advice.
      </p>
    )
  }
  return (
    <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex gap-3 items-start">
      <span className="text-amber-500 mt-0.5 shrink-0" aria-hidden="true">ℹ️</span>
      <p className="text-sm text-amber-900 leading-relaxed">
        <strong>Important:</strong> BaselineBeacon organizes caregiver-reported observations and does{' '}
        <strong>not</strong> diagnose, treat, or replace professional medical advice. All observations are
        caregiver-reported. Consider discussing any concerns with a qualified healthcare professional.
      </p>
    </div>
  )
}
