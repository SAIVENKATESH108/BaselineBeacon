// src/components/ui/Badge.tsx
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

type BadgeVariant = 'routine' | 'noteworthy' | 'incident' | 'navy' | 'teal' | 'indigo' | 'amber' | 'emerald' | 'neutral'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
}

const variants: Record<BadgeVariant, string> = {
  routine:    'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium shadow-sm shadow-emerald-500/10',
  noteworthy: 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-semibold',
  incident:   'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.25)] font-bold',
  navy:       'bg-navy-900/90 text-teal-300 border border-teal-500/30 shadow-sm',
  teal:       'bg-teal-500/15 text-teal-300 border border-teal-500/30 font-medium shadow-sm shadow-teal-500/10',
  indigo:     'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium shadow-sm shadow-indigo-500/10',
  amber:      'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium shadow-sm shadow-amber-500/10',
  emerald:    'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium shadow-sm shadow-emerald-500/10',
  neutral:    'bg-slate-800/80 text-slate-300 border border-slate-700/80 font-medium',
}

export function Badge({ variant = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
