// src/pages/DashboardPage.tsx
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { Disclaimer } from '@/components/common/Disclaimer'
import { useAppStore } from '@/state/appStore'
import { RAVI_OBSERVATIONS, RAVI_BASELINE } from '@/data/demoData'
import { formatRelativeTime, capitalize } from '@/lib/utils'
import { ObservationCategory, Comparison } from '@/domain/models'

// Category deviation summary for tiles
const CATEGORY_ORDER = [
  ObservationCategory.MealIntake,
  ObservationCategory.Hydration,
  ObservationCategory.Sleep,
  ObservationCategory.Mobility,
  ObservationCategory.MoodBehavior,
]

const CATEGORY_ICONS: Record<string, string> = {
  meal_intake: '🍽️', hydration: '💧', sleep: '😴',
  mobility: '🚶', mood_behavior: '😊', medication: '💊',
  pain_discomfort: '😣', fall_incident: '⚠️', energy: '⚡', other: '📝',
}

function DeviationTile({ category }: { category: ObservationCategory }) {
  // Count how many confirmed observations in this category differ from baseline
  const obs = RAVI_OBSERVATIONS.flatMap((o) =>
    o.extractedFields.filter(
      (f) => f.category === category || f.category === category.replace('_', ''),
    ),
  )
  const differentCount = obs.filter(
    (f) =>
      f.differentFromBaseline === true ||
      (f as { comparison_to_baseline?: string }).comparison_to_baseline === 'different' ||
      (f as { comparison_to_baseline?: string }).comparison_to_baseline === 'lower' ||
      (f as { comparison_to_baseline?: string }).comparison_to_baseline === 'higher',
  ).length

  const label = category.replace('_', ' ')

  return (
    <div className="bg-white rounded-2xl shadow-soft p-4 flex items-center gap-3 hover:shadow-medium transition-shadow">
      <span className="text-2xl" aria-hidden="true">{CATEGORY_ICONS[category] || '📋'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-navy-800 capitalize">{label}</p>
        <p className="text-xs text-gray-500">
          {differentCount > 0
            ? `${differentCount} observation${differentCount > 1 ? 's' : ''} different from usual`
            : 'Within usual range in recent notes'}
        </p>
      </div>
      {differentCount > 0 && (
        <Badge variant="noteworthy">{differentCount}</Badge>
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
    <div className="bg-white rounded-xl shadow-soft p-4 hover:shadow-medium transition-all animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-xs text-gray-400">{formatRelativeTime(obs.observedAt)}</p>
          <p className="text-sm text-navy-900 leading-relaxed mt-1 line-clamp-2">{obs.rawText}</p>
        </div>
        <Badge variant={severityVariant} className="shrink-0 capitalize">{obs.severity}</Badge>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {obs.extractedFields.slice(0, 3).map((f) => (
          <span
            key={f.field}
            className="text-xs bg-cream-100 text-navy-700 px-2 py-0.5 rounded-full border border-cream-300"
          >
            {capitalize(f.category)}: {f.value}
          </span>
        ))}
        {obs.extractedFields.length > 3 && (
          <span className="text-xs text-gray-400">+{obs.extractedFields.length - 3} more</span>
        )}
      </div>
      {changedCount > 0 && (
        <p className="text-xs text-amber-700 mt-2">
          ⚡ {changedCount} field{changedCount > 1 ? 's' : ''} different from usual
        </p>
      )}
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { selectedRecipient } = useAppStore()
  const observations = RAVI_OBSERVATIONS
  const recentObs = [...observations].sort(
    (a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime(),
  ).slice(0, 5)

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            {selectedRecipient?.name ?? 'Dashboard'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Caregiver-reported observations — {observations.length} total
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/observe')}
          aria-label="Add a new observation"
        >
          <Plus size={18} aria-hidden="true" />
          Add Note
        </Button>
      </div>

      {/* Deviation tiles */}
      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Caregiver-Reported Changes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORY_ORDER.map((cat) => (
            <DeviationTile key={cat} category={cat} />
          ))}
        </div>
      </section>

      {/* Recent observations */}
      <section aria-labelledby="recent-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="recent-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Recent Observations
          </h2>
          <button
            onClick={() => navigate('/timeline')}
            className="text-xs text-teal-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded"
          >
            View all →
          </button>
        </div>

        {recentObs.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No observations yet"
            description="Add your first caregiver note to get started."
            action={{ label: 'Add a note', onClick: () => navigate('/observe') }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {recentObs.map((obs) => (
              <ObservationCard key={obs.id} obs={obs} />
            ))}
          </div>
        )}
      </section>

      {/* Baseline summary */}
      <section aria-labelledby="baseline-heading">
        <h2 id="baseline-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Saved Baseline (Usual Patterns)
        </h2>
        <Card>
          <CardContent className="pt-4">
            <div className="divide-y divide-cream-100">
              {RAVI_BASELINE.map((b) => (
                <div key={b.id} className="flex justify-between items-center py-2.5 gap-4">
                  <span className="text-sm text-navy-700 capitalize">{b.field.replace(/_/g, ' ')}</span>
                  <span className="text-sm text-navy-900 font-medium text-right">
                    {b.value}{b.unit ? ` ${b.unit}` : ''}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/baseline')}
              className="mt-3 text-xs text-teal-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded"
            >
              Edit baseline →
            </button>
          </CardContent>
        </Card>
      </section>

      <Disclaimer />
    </div>
  )
}
