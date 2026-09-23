// src/pages/TimelineInsightsPage.tsx — Cohesive, Colorful & Animated Deep Timeline
import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { TrendingUp, AlertTriangle, Calendar, Filter, Sparkles, Clock } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { Disclaimer } from '@/components/common/Disclaimer'
import { RAVI_OBSERVATIONS, RAVI_BASELINE } from '@/data/demoData'
import { formatDate, capitalize } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/state/appStore'
import type { BaselineEntry, Observation, ExtractedField } from '@/types'

type DateRange = '7d' | '14d' | '30d' | 'all'

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7d',  label: 'Last 7 Days' },
  { value: '14d', label: 'Last 14 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'all', label: 'All History' },
]

const CATEGORY_TABS = [
  { id: 'meal_intake',  label: '🍽️ Meal Intake', color: '#f59e0b', fields: ['meal_completion', 'lunch_intake', 'breakfast_intake', 'meal_portions'] },
  { id: 'hydration',   label: '💧 Hydration',   color: '#0ea5a5', fields: ['fluid_intake'] },
  { id: 'sleep',       label: '😴 Sleep & Rest', color: '#6366f1', fields: ['afternoon_nap_duration', 'daytime_tiredness', 'sleep_duration'] },
  { id: 'mobility',    label: '🚶 Mobility',     color: '#10b981', fields: ['walking_difficulty', 'walking_status', 'fall_reported'] },
]

function detectTrends(observations: typeof RAVI_OBSERVATIONS): string[] {
  const insights: string[] = []

  const hydrationLow = observations.filter((o) =>
    o.extractedFields.some(
      (f) => (f.category === 'hydration') && f.differentFromBaseline === true && f.caregiverConfirmed,
    ),
  )
  if (hydrationLow.length >= 2) {
    insights.push(
      `Caregiver-reported lower fluid intake appears in ${hydrationLow.length} recent observations — consider discussing with a qualified healthcare professional.`,
    )
  }

  const lowAppetite = observations.filter((o) =>
    o.extractedFields.some(
      (f) => (f.category === 'appetite' || f.category === 'meal_intake') && f.differentFromBaseline === true && f.caregiverConfirmed,
    ),
  )
  if (lowAppetite.length >= 2) {
    insights.push(
      `Caregiver-reported different-from-usual meal intake appears in ${lowAppetite.length} recent observations.`,
    )
  }

  const incidents = observations.filter((o) => o.severity === 'incident')
  if (incidents.length > 0) {
    insights.push(
      `${incidents.length} caregiver-labeled incident${incidents.length > 1 ? 's' : ''} recorded. Consider discussing with a qualified healthcare professional.`,
    )
  }

  return insights
}

function buildChartData(
  observations: typeof RAVI_OBSERVATIONS,
  fields: string[],
  dateRange: DateRange,
) {
  const now = new Date()
  const cutoff = dateRange === 'all' ? new Date(0) :
    new Date(now.getTime() - (
      dateRange === '7d' ? 7 : dateRange === '14d' ? 14 : 30
    ) * 86400000)

  return observations
    .filter((o) => new Date(o.observedAt) >= cutoff)
    .sort((a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime())
    .map((obs) => {
      const row: Record<string, string | number | null> = {
        date: formatDate(obs.observedAt),
        severity: obs.severity === 'incident' ? 1 : 0,
      }
      for (const field of fields) {
        const f = obs.extractedFields.find((ef) => ef.field === field)
        if (f) {
          const numMatch = f.value?.match(/\d+(\.\d+)?/)
          row[field] = numMatch ? parseFloat(numMatch[0]) : f.differentFromBaseline ? 1 : 0
        } else {
          row[field] = null
        }
      }
      return row
    })
}

const LINE_COLORS = ['#0ea5a5', '#38bdf8', '#f59e0b', '#a855f7', '#fb7185']

export function TimelineInsightsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [activeCategory, setActiveCategory] = useState(CATEGORY_TABS[0])

  const { observations, baselineEntries } = useAppStore()
  const insights = detectTrends(observations as unknown as typeof RAVI_OBSERVATIONS)
  const chartData = buildChartData(observations as unknown as typeof RAVI_OBSERVATIONS, activeCategory.fields, dateRange)
  const hydrationBaseline = baselineEntries.find((b: BaselineEntry) => b.field === 'typical_fluid_intake')

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto animate-fade-in w-full min-w-0">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-2">
          <TrendingUp size={13} className="text-teal-400" />
          <span>Multi-Day Observation Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Observation Timeline
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Review trends in caregiver observations over time compared against Ravi Kumar's saved baseline habits.
        </p>
      </div>

      {/* Pattern Alerts */}
      {insights.length > 0 && (
        <section aria-labelledby="insights-heading" className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <h2 id="insights-heading" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Deterministic Observation Patterns
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex gap-3.5 items-start shadow-md"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-amber-200 leading-relaxed">
                    {insight}
                  </p>
                  <p className="text-[11px] text-amber-300/80 mt-1">
                    Rule-based summary • Non-diagnostic observation highlight
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Controls: Date range & Category tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex gap-1.5 bg-navy-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto max-w-full">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeCategory.id === tab.id}
              onClick={() => setActiveCategory(tab)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200',
                activeCategory.id === tab.id
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-1 bg-navy-950 border border-slate-800 p-1 rounded-xl shadow-inner">
          {DATE_RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                dateRange === opt.value
                  ? 'bg-slate-800 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Chart Visualization Card */}
      <div className="bg-navy-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">{activeCategory.label} Trend</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Caregiver-reported quantitative values plotted chronologically
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-navy-950 border border-slate-800 text-teal-300">
            {chartData.length} records plotted
          </span>
        </div>

        {chartData.length === 0 ? (
          <EmptyState
            icon="📊"
            title="No observations in this period"
            description="No notes found matching the selected timeframe."
          />
        ) : (
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a1324',
                    borderRadius: 14,
                    border: '1px solid #334155',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#f8fafc',
                  }}
                  formatter={(value, name) => [value, capitalize(String(name).replace(/_/g, ' '))]}
                  labelFormatter={(label) => `📅 Date: ${label}`}
                />
                <Legend formatter={(value) => capitalize(String(value).replace(/_/g, ' '))} />

                {activeCategory.id === 'hydration' && hydrationBaseline && (
                  <ReferenceLine
                    y={6}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: 'Usual Baseline (6 glasses)', fill: '#fbbf24', fontSize: 11, position: 'insideTopRight' }}
                  />
                )}

                {activeCategory.fields.map((field, i) => (
                  <Line
                    key={field}
                    type="monotone"
                    dataKey={field}
                    stroke={LINE_COLORS[i % LINE_COLORS.length]}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: LINE_COLORS[i % LINE_COLORS.length], strokeWidth: 1.5, stroke: '#0a1324' }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Observation History Feed */}
      <section aria-labelledby="obs-list-heading" className="space-y-4">
        <h2 id="obs-list-heading" className="text-base font-bold text-white tracking-wide">
          Chronological Observations Log
        </h2>

        <div className="space-y-3">
          {observations.map((obs: Observation) => {
            const severityVariant =
              obs.severity === 'incident' ? 'incident' :
              obs.severity === 'noteworthy' ? 'noteworthy' : 'routine'

            return (
              <div
                key={obs.id}
                className="card-interactive bg-navy-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-lg hover:border-teal-500/40 backdrop-blur-xl transition-all"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <Clock size={13} />
                    {formatDate(obs.observedAt)}
                  </span>
                  <Badge variant={severityVariant} className="capitalize font-bold">
                    {obs.severity}
                  </Badge>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  "{obs.rawText}"
                </p>

                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-800">
                  {obs.extractedFields
                    .filter((f: ExtractedField) => f.differentFromBaseline)
                    .map((f: ExtractedField) => (
                      <span
                        key={f.field}
                        className="text-xs bg-amber-500/15 text-amber-200 border border-amber-400/40 px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1"
                      >
                        <span>⚡</span>
                        <span>{capitalize(f.category)}: different from usual</span>
                      </span>
                    ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <Disclaimer />
    </div>
  )
}
