// src/components/ui/Badge.tsx
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

type BadgeVariant = 'routine' | 'noteworthy' | 'incident' | 'navy' | 'teal' | 'neutral'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  routine:    'bg-cream-100 text-navy-700 border border-cream-300',
  noteworthy: 'bg-amber-100 text-amber-800 border border-amber-200',
  incident:   'bg-red-100 text-red-800 border border-red-200',
  navy:       'bg-navy-800 text-white',
  teal:       'bg-teal-100 text-teal-800 border border-teal-200',
  neutral:    'bg-gray-100 text-gray-700 border border-gray-200',
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
