// src/components/common/LoadingSpinner.tsx
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }

export function LoadingSpinner({ size = 'md', label = 'Loading…', className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)} role="status" aria-live="polite">
      <div className={cn('border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin', sizes[size])} />
      <span className="text-sm text-slate-400 font-medium">{label}</span>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b14]">
      <LoadingSpinner size="lg" label="Loading BaselineBeacon…" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-navy-900/80 border border-slate-800/90 p-5 animate-pulse">
      <div className="h-4 bg-slate-800 rounded-full w-1/3 mb-3" />
      <div className="h-3 bg-slate-800/60 rounded-full w-full mb-2" />
      <div className="h-3 bg-slate-800/60 rounded-full w-4/5" />
    </div>
  )
}
