// src/components/ui/Input.tsx
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-slate-200">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 rounded-xl border bg-navy-950/90 text-white placeholder:text-slate-400',
            'text-base min-h-[44px]',
            'transition-all duration-200 shadow-inner',
            error
              ? 'border-rose-500 focus:border-rose-400 focus-visible:ring-rose-400/30'
              : 'border-slate-700/80 focus:border-teal-400 focus-visible:ring-teal-400/30',
            'focus-visible:outline-none focus-visible:ring-2',
            'disabled:opacity-50 disabled:bg-navy-900',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-slate-400">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-rose-400 font-medium">
            {error}
          </p>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  maxLength?: number
  showCount?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, maxLength, showCount, value, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const charCount = typeof value === 'string' ? value.length : 0

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-slate-200">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxLength}
          className={cn(
            'w-full px-4 py-3 rounded-xl border bg-navy-950/90 text-white placeholder:text-slate-400',
            'text-base resize-none',
            'transition-all duration-200 shadow-inner',
            error
              ? 'border-rose-500 focus:border-rose-400 focus-visible:ring-rose-400/30'
              : 'border-slate-700/80 focus:border-teal-400 focus-visible:ring-teal-400/30',
            'focus-visible:outline-none focus-visible:ring-2',
            'disabled:opacity-50 disabled:bg-navy-900',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        <div className="flex justify-between items-start">
          <div>
            {hint && !error && (
              <p id={`${inputId}-hint`} className="text-xs text-gray-500">
                {hint}
              </p>
            )}
            {error && (
              <p id={`${inputId}-error`} role="alert" className="text-xs text-red-600">
                {error}
              </p>
            )}
          </div>
          {showCount && maxLength && (
            <span className={cn('text-xs ml-auto', charCount > maxLength * 0.9 ? 'text-amber-600' : 'text-gray-400')}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
