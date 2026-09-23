// src/pages/TimelineInsightsPage.tsx
// Deterministic trend insights — rule-based only, no LLM.
// No diagnostic language, no risk scores, no clinical interpretation.

import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { EmptyState } from '@/components/common/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { Disclaimer } from '@/components/common/Disclaimer'
import { RAVI_OBSERVATIONS, RAVI_BASELINE } from '@/data/demoData'
import { formatDate, capitalize } from '@/lib/utils'
import { cn } from '@/lib/utils'

type DateRange = '7d' | '14d' | '30d' | 'all'

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7d',  label: 'Last 7 days' },
  { value: '14d', label: 'Last 14 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'all', label: 'All' },
]

const CATEGORY_TABS = [
  { id: 'meal_intake',  label: '🍽️ Meals',    fields: ['meal_completion', 'lunch_intake', 'breakfast_intake', 'meal_portions'] },
  { id: 'hydration',   label: '💧 Hydration', fields: ['fluid_intake'] },
  { id: 'sleep',       label: '😴 Sleep',     fields: ['afternoon_nap_duration', 'daytime_tiredness', 'sleep_duration'] },
  { id: 'mobility',    label: '🚶 Mobility',  fields: ['walking_difficulty', 'walking_status', 'fall_reported'] },
]

// ─── Deterministic trend detection (rule-based, no LLM) ───────────────────────
function detectTrends(observations: typeof RAVI_OBSERVATIONS): string[] {
  const insights: string[] = []

  // Rule: same-direction change in ≥2 confirmed entries for hydration
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

  // Rule: same-direction change for appetite
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

  // Rule: explicit incident
  const incidents = observations.filter((o) => o.severity === 'incident')
  if (incidents.length > 0) {
    insights.push(
      `${incidents.length} caregiver-labeled incident${incidents.length > 1 ? 's' : ''} recorded. Consider discussing with a qualified healthcare professional.`,
    )
  }

  return insights
}

// Build chart data from observations for a category's fields
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

const LINE_COLORS = ['#1e9e9e', '#2d5aa0', '#f59e0b', '#7c3aed']

export function TimelineInsightsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [activeCategory, setActiveCategory] = useState(CATEGORY_TABS[0])

  const observations = RAVI_OBSERVATIONS
  const insights = detectTrends(observations)

  const chartData = buildChartData(observations, activeCategory.fields, dateRange)

  // Find baseline reference value for hydration (numeric)
  const hydrationBaseline = RAVI_BASELINE.find((b) => b.field === 'typical_fluid_intake')

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Timeline</h1>
        <p className="text-sm text-gray-500 mt-1">
          Caregiver-reported observations over time. Not a clinical chart.
        </p>
      </div>

      {/* Trend insights */}
      {insights.length > 0 && (
        <section aria-labelledby="insights-heading">
          <h2 id="insights-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Caregiver-Reported Patterns
          </h2>
          <div className="flex flex-col gap-2">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-3 items-start"
              >
                <span className="text-amber-500 mt-0.5 shrink-0">⚡</span>
                <p className="text-sm text-amber-900">{insight}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Date range filter */}
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Date range filter">
        {DATE_RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setDateRange(opt.value)}
            aria-pressed={dateRange === opt.value}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium border transition-all min-h-[36px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
              dateRange === opt.value
                ? 'bg-navy-800 text-white border-navy-800'
                : 'bg-white text-navy-700 border-cream-300 hover:bg-cream-50',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Observation categories">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeCategory.id === tab.id}
            onClick={() => setActiveCategory(tab)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all min-h-[44px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
              activeCategory.id === tab.id
                ? 'bg-teal-600 text-white shadow-teal'
                : 'bg-white text-navy-700 border border-cream-300 hover:bg-cream-50',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-soft p-5" role="tabpanel">
        <h3 className="text-sm font-semibold text-navy-700 mb-1">{activeCategory.label}</h3>
        <p className="text-xs text-gray-400 mb-4">Caregiver-reported values. Numbers reflect explicitly stated quantities.</p>

        {chartData.length === 0 ? (
          <EmptyState
            icon="📊"
            title="No observations in this period"
            description="No caregiver notes found for the selected date range."
            action={undefined}
          />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#deded0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#718096' }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: '#718096' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #deded0', fontSize: 12 }}
                formatter={(value, name) => [value, capitalize(String(name).replace(/_/g, ' '))]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend formatter={(value) => capitalize(String(value).replace(/_/g, ' '))} />

              {/* Baseline reference line for hydration */}
              {activeCategory.id === 'hydration' && hydrationBaseline && (
                <ReferenceLine
                  y={6}
                  stroke="#f59e0b"
                  strokeDasharray="6 3"
                  label={{ value: 'Usual baseline', fill: '#b45309', fontSize: 10, position: 'insideTopRight' }}
                />
              )}

              {activeCategory.fields.map((field, i) => (
                <Line
                  key={field}
                  type="monotone"
                  dataKey={field}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: LINE_COLORS[i % LINE_COLORS.length] }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* All observations list */}
      <section aria-labelledby="obs-list-heading">
        <h2 id="obs-list-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          All Caregiver-Reported Observations
        </h2>
        <div className="flex flex-col gap-3">
          {observations.map((obs) => {
            const severityVariant =
              obs.severity === 'incident' ? 'incident' :
              obs.severity === 'noteworthy' ? 'noteworthy' : 'routine'
            return (
              <div key={obs.id} className="bg-white rounded-xl shadow-soft p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-xs text-gray-400">{formatDate(obs.observedAt)}</span>
                  <Badge variant={severityVariant} className="capitalize">{obs.severity}</Badge>
                </div>
                <p className="text-sm text-navy-800 leading-relaxed">{obs.rawText}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {obs.extractedFields
                    .filter((f) => f.differentFromBaseline)
                    .map((f) => (
                      <span
                        key={f.field}
                        className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full"
                      >
                        {capitalize(f.category)}: different from usual
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
