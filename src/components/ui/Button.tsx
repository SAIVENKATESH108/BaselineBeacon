// src/components/ui/Button.tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'amber' | 'indigo'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/25 hover:from-teal-400 hover:to-teal-500 hover:shadow-lg hover:shadow-teal-500/35 focus-visible:ring-teal-400 active:scale-[0.98]',
  amber:
    'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-navy-950 font-bold shadow-md shadow-amber-500/25 hover:from-amber-300 hover:to-amber-400 hover:shadow-lg hover:shadow-amber-500/35 focus-visible:ring-amber-400 active:scale-[0.98]',
  indigo:
    'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white font-medium shadow-md shadow-indigo-500/25 hover:from-indigo-400 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-500/35 focus-visible:ring-indigo-400 active:scale-[0.98]',
  secondary:
    'bg-slate-800/80 text-slate-200 border border-slate-700/80 shadow-sm hover:bg-slate-700/80 hover:text-white hover:border-slate-600 hover:shadow focus-visible:ring-teal-400 active:scale-[0.98]',
  ghost:
    'bg-transparent text-slate-300 hover:bg-slate-800/70 hover:text-white focus-visible:ring-teal-400 active:scale-[0.98]',
  danger:
    'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25 hover:from-rose-400 hover:to-red-500 hover:shadow-lg hover:shadow-rose-500/35 focus-visible:ring-red-400 active:scale-[0.98]',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg min-h-[36px]',
  md: 'px-5 py-2.5 text-sm font-semibold rounded-xl min-h-[44px]',
  lg: 'px-7 py-3.5 text-base font-bold rounded-2xl min-h-[52px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium',
          'transition-all duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'select-none',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {isLoading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
