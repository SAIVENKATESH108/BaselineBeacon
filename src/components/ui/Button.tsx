// src/components/ui/Button.tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'amber'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-teal-600 text-white hover:bg-teal-500 focus-visible:ring-teal-400 active:bg-teal-700',
  secondary:
    'bg-navy-100 text-navy-800 hover:bg-navy-200 focus-visible:ring-navy-400 active:bg-navy-300',
  ghost:
    'bg-transparent text-navy-700 hover:bg-navy-50 focus-visible:ring-navy-400 active:bg-navy-100',
  danger:
    'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-400 active:bg-red-700',
  amber:
    'bg-amber-400 text-navy-900 hover:bg-amber-300 focus-visible:ring-amber-400 active:bg-amber-500 font-semibold',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg min-h-[36px]',
  md: 'px-5 py-2.5 text-base rounded-xl min-h-[44px]',
  lg: 'px-7 py-3.5 text-lg rounded-2xl min-h-[52px]',
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
