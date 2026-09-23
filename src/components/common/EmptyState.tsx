// src/components/common/EmptyState.tsx
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in bg-navy-900/40 border border-slate-800 rounded-3xl">
      <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-3xl mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {action && (
        <Button variant="primary" onClick={action.onClick} className="font-bold shadow-md shadow-teal-500/20">
          {action.label}
        </Button>
      )}
    </div>
  )
}
