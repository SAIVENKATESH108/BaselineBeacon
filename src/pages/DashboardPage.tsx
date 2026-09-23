// src/pages/DashboardPage.tsx — Cohesive, Colorful & Animated Deep Dashboard
import { useNavigate } from 'react-router-dom'
import {
  Plus, TrendingUp, AlertTriangle, Clock, Calendar, Shield,
  ArrowRight, Sparkles, CheckCircle2, ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { Disclaimer } from '@/components/common/Disclaimer'
import { useAppStore } from '@/state/appStore'
import { RAVI_OBSERVATIONS, RAVI_BASELINE } from '@/data/demoData'
import { formatRelativeTime, capitalize } from '@/lib/utils'
import { ObservationCategory } from '@/domain/models'

const CATEGORY_ORDER = [
  ObservationCategory.MealIntake,
  ObservationCategory.Hydration,
  ObservationCategory.Sleep,
  ObservationCategory.Mobility,
  ObservationCategory.MoodBehavior,
]

interface CategoryStyle {
  icon: string
  color: string
  shadow: string
  label: string
}

const CATEGORY_CONFIG: Record<string, CategoryStyle> = {
  meal_intake: {
    icon: '🍽️',
    color: 'from-amber-400 to-orange-500',
    shadow: 'shadow-amber-500/20',
    label: 'Meal Intake',
  },
  hydration: {
    icon: '💧',
    color: 'from-teal-400 to-cyan-500',
    shadow: 'shadow-teal-500/20',
    label: 'Hydration',
  },
  sleep: {
    icon: '😴',
    color: 'from-indigo-400 to-purple-500',
    shadow: 'shadow-indigo-500/20',
    label: 'Sleep & Rest',
  },
  mobility: {
    icon: '🚶',
    color: 'from-emerald-400 to-teal-500',
    shadow: 'shadow-emerald-500/20',
    label: 'Mobility & Gait',
  },
  mood_behavior: {
    icon: '😊',
    color: 'from-rose-400 to-pink-500',
    shadow: 'shadow-rose-500/20',
    label: 'Mood & Energy',
  },
}

function DeviationTile({ category, observations }: { category: ObservationCategory; observations: any[] }) {
  const config = CATEGORY_CONFIG[category] || {
    icon: '📋',
    color: 'from-slate-400 to-slate-500',
    shadow: 'shadow-slate-500/20',
    label: category.replace('_', ' '),
  }

  const obs = observations.flatMap((o) =>
    o.extractedFields.filter(
      (f: any) => f.category === category || f.category === category.replace('_', ''),
    ),
  )

  const differentCount = obs.filter(
    (f: any) =>
      f.differentFromBaseline === true ||
      f.comparison_to_baseline === 'different' ||
      f.comparison_to_baseline === 'lower' ||
      f.comparison_to_baseline === 'higher',
  ).length

  return (
    <div className="card-interactive bg-navy-900/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 hover:border-slate-700 backdrop-blur-xl shadow-lg transition-all duration-300 min-w-0">
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center text-xl shrink-0 shadow-md ${config.shadow} text-white`}>
          {config.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white tracking-wide truncate">{config.label}</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-snug line-clamp-2">
            {differentCount > 0
              ? `${differentCount} observation${differentCount > 1 ? 's' : ''} different from usual`
              : 'Within normal baseline range'}
          </p>
        </div>
      </div>
      {differentCount > 0 ? (
        <Badge variant="noteworthy" className="shrink-0 font-bold px-2.5 py-1 text-[11px]">
          ⚡ {differentCount} diff
        </Badge>
      ) : (
        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 shrink-0 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[11px]">
          <CheckCircle2 size={12} /> Normal
        </span>
      )}
    </div>
  )
}

function ObservationCard({ obs }: { obs: typeof RAVI_OBSERVATIONS[0] }) {
  const changedCount = obs.extractedFields.filter((f) => f.differentFromBaseline).length
  const severityVariant =
    obs.severity === 'incident' ? 'incident' :
    obs.severity === 'noteworthy' ? 'noteworthy' : 'routine'

  return (
    <div className="card-interactive bg-navy-900/80 border border-slate-800/90 rounded-2xl p-5 hover:border-teal-500/40 backdrop-blur-xl shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <Clock size={13} />
            {formatRelativeTime(obs.observedAt)}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
            Caregiver Note
          </span>
        </div>
        <Badge variant={severityVariant} className="shrink-0 capitalize font-bold">
          {obs.severity}
        </Badge>
      </div>

      <p className="text-sm text-slate-200 leading-relaxed font-normal mb-3">
        "{obs.rawText}"
      </p>

      {/* Extracted category pills */}
      <div className="flex flex-wrap gap-2">
        {obs.extractedFields.map((f) => {
          const isDiff = f.differentFromBaseline
          return (
            <span
              key={f.field}
              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl border font-medium ${
                isDiff
                  ? 'bg-amber-500/15 text-amber-200 border-amber-400/40 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                  : 'bg-navy-950/70 text-slate-300 border-slate-700/80'
              }`}
            >
              {isDiff && <span className="text-amber-400 font-bold">⚡</span>}
              <span className="font-semibold text-white">{capitalize(f.category)}:</span>
              <span>{f.value}</span>
            </span>
          )
        })}
      </div>

      {changedCount > 0 && (
        <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-amber-300 font-semibold flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-amber-400" />
            {changedCount} field{changedCount > 1 ? 's' : ''} deviate from usual baseline
          </span>
          <span className="text-slate-400 font-medium">Caregiver confirmed</span>
        </div>
      )}
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { selectedRecipient, observations, baselineEntries } = useAppStore()

  const recentObs = [...observations].sort(
    (a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime(),
  ).slice(0, 5)

  // Count total deviations across all notes
  const totalDeviations = observations.flatMap((o) =>
    o.extractedFields.filter((f) => f.differentFromBaseline),
  ).length

  return (
    <div className="flex flex-col gap-8 animate-fade-in w-full min-w-0">
      {/* ── Top Hero Greeting Banner ─────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-black/40 border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/15 blur-[80px] pointer-events-none rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Care Profile • {selectedRecipient?.name ?? 'Ravi Kumar'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Daily Caregiver Overview
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Tracking observations against Ravi's saved baseline habits. Noticeable changes are organized for your next medical conversation.
            </p>
          </div>

          <Button
            variant="amber"
            size="lg"
            onClick={() => navigate('/observe')}
            className="self-start md:self-auto shrink-0 shadow-lg shadow-amber-500/25 font-bold"
          >
            <Plus size={18} />
            <span>Add Care Note</span>
          </Button>
        </div>

        {/* Quick Stat Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-navy-950/60 border border-slate-800 rounded-xl p-3 min-w-0">
            <span className="text-xs text-slate-400 block font-medium truncate">Notes Logged</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{observations.length}</span>
          </div>
          <div className="bg-navy-950/60 border border-slate-800 rounded-xl p-3 min-w-0">
            <span className="text-xs text-amber-300 block font-medium truncate">Deviations</span>
            <span className="text-xl font-bold text-amber-400 mt-0.5 block">{totalDeviations}</span>
          </div>
          <div className="bg-navy-950/60 border border-slate-800 rounded-xl p-3 min-w-0">
            <span className="text-xs text-teal-300 block font-medium truncate">Days Tracked</span>
            <span className="text-xl font-bold text-teal-300 mt-0.5 block">14 Days</span>
          </div>
          <div className="bg-navy-950/60 border border-slate-800 rounded-xl p-3 min-w-0">
            <span className="text-xs text-emerald-300 block font-medium truncate">Clinical Guardrail</span>
            <span className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
              <Shield size={13} className="shrink-0" />
              <span className="truncate">Non-Diagnostic</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Category Deviation Summary Tiles ─────────────────────────────── */}
      <section aria-labelledby="deviations-heading" className="min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="deviations-heading" className="text-lg font-bold text-white tracking-wide">
              Caregiver-Reported Changes
            </h2>
            <p className="text-xs text-slate-400">
              Categories contrasting recent observations with usual baseline
            </p>
          </div>
          <button
            onClick={() => navigate('/timeline')}
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 group shrink-0"
          >
            <span>View Timeline</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {CATEGORY_ORDER.map((cat) => (
            <DeviationTile key={cat} category={cat} observations={observations} />
          ))}
        </div>
      </section>

      {/* ── Recent Observations Feed ─────────────────────────────────────── */}
      <section aria-labelledby="recent-heading" className="min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="recent-heading" className="text-lg font-bold text-white tracking-wide">
              Recent Observations
            </h2>
            <p className="text-xs text-slate-400">
              Caregiver notes captured and structured by category
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/timeline')}
            className="text-xs font-bold text-teal-400 hover:text-teal-300 hover:bg-slate-900 shrink-0"
          >
            All Observations ({observations.length}) →
          </Button>
        </div>

        {recentObs.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No observations yet"
            description="Add your first caregiver note to start tracking patterns."
            action={{ label: 'Add a note', onClick: () => navigate('/observe') }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {recentObs.map((obs) => (
              <ObservationCard key={obs.id} obs={obs} />
            ))}
          </div>
        )}
      </section>

      {/* ── Saved Baseline (Usual Patterns) ──────────────────────────────── */}
      <section aria-labelledby="baseline-heading" className="min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="baseline-heading" className="text-lg font-bold text-white tracking-wide">
              Saved Baseline (Ravi's Usual Patterns)
            </h2>
            <p className="text-xs text-slate-400">
              Reference benchmarks used to detect differences in daily notes
            </p>
          </div>
          <button
            onClick={() => navigate('/baseline')}
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 shrink-0"
          >
            Edit baseline →
          </button>
        </div>

        <div className="bg-navy-900/80 border border-slate-800/90 rounded-3xl p-6 backdrop-blur-xl shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {baselineEntries.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl bg-navy-950/80 border border-slate-800/80 flex items-center justify-between gap-3 min-w-0"
              >
                <span className="text-xs font-semibold text-slate-300 capitalize truncate">
                  {b.field.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-bold text-teal-300 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/30 shrink-0">
                  {b.value}{b.unit ? ` ${b.unit}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Disclaimer />
    </div>
  )
}
