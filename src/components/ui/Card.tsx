// src/components/ui/Card.tsx
import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'interactive'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-300',
          variant === 'default' &&
            'bg-navy-900/80 border border-slate-800/90 backdrop-blur-xl shadow-lg shadow-black/20 text-slate-100',
          variant === 'elevated' &&
            'bg-navy-900/95 border border-teal-500/20 shadow-xl shadow-black/40 backdrop-blur-xl text-slate-100',
          variant === 'outlined' &&
            'bg-transparent border border-slate-800 text-slate-200',
          variant === 'glass' && 'glass-card text-slate-100',
          variant === 'interactive' &&
            'bg-navy-900/80 border border-slate-800/90 backdrop-blur-xl shadow-lg hover:border-teal-500/40 hover:-translate-y-1 hover:shadow-teal-500/10 cursor-pointer transition-all duration-300 text-slate-100',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Card.displayName = 'Card'

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-5 pt-5 pb-3', className)} {...props} />
)

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-5 pb-5', className)} {...props} />
)

export const CardFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-5 py-3 border-t border-slate-800/80', className)} {...props} />
)
