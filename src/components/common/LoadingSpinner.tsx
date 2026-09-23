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
      <div className={cn('border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin', sizes[size])} />
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50">
      <LoadingSpinner size="lg" label="Loading BaselineBeacon…" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white shadow-soft p-5 animate-pulse">
      <div className="h-4 bg-cream-200 rounded-full w-1/3 mb-3" />
      <div className="h-3 bg-cream-100 rounded-full w-full mb-2" />
      <div className="h-3 bg-cream-100 rounded-full w-4/5" />
    </div>
  )
}
