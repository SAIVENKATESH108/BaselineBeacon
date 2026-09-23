// src/pages/AIReviewPage.tsx
// Phase 7 — Review-Before-Save screen.
// AI-extracted observations are NEVER saved without explicit caregiver confirmation.
// caregiverConfirmed may only become true through an explicit caregiver action.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input, Textarea } from '@/components/ui/Input'
import { Disclaimer } from '@/components/common/Disclaimer'
import { EmptyState } from '@/components/common/EmptyState'
import { useAppStore } from '@/state/appStore'
import { ObservationCategory, Comparison } from '@/domain/models'
import { RAVI_OBSERVATIONS } from '@/data/demoData'
import { capitalize } from '@/lib/utils'
import { cn } from '@/lib/utils'

const CATEGORY_LABELS: Record<ObservationCategory, string> = {
  [ObservationCategory.MealIntake]:     'Meal Intake',
  [ObservationCategory.Hydration]:      'Hydration',
  [ObservationCategory.Sleep]:          'Sleep',
  [ObservationCategory.Energy]:         'Energy',
  [ObservationCategory.Mobility]:       'Mobility',
  [ObservationCategory.MoodBehavior]:   'Mood & Behavior',
  [ObservationCategory.Medication]:     'Medication',
  [ObservationCategory.PainDiscomfort]: 'Pain / Discomfort',
  [ObservationCategory.FallIncident]:   'Fall / Incident',
  [ObservationCategory.Other]:          'Other',
}

const COMPARISON_LABELS: Record<Comparison, string> = {
  [Comparison.Lower]:    'Less than usual',
  [Comparison.Higher]:   'More than usual',
  [Comparison.Same]:     'Within usual range',
  [Comparison.Different]:'Different from usual',
  [Comparison.Unknown]:  'Comparison unknown',
}

const COMPARISON_BADGE: Record<Comparison, 'noteworthy' | 'routine' | 'neutral'> = {
  [Comparison.Lower]:    'noteworthy',
  [Comparison.Higher]:   'noteworthy',
  [Comparison.Same]:     'routine',
  [Comparison.Different]:'noteworthy',
  [Comparison.Unknown]:  'neutral',
}

type SeverityOption = 'routine' | 'noteworthy' | 'incident'

export function AIReviewPage() {
  const navigate = useNavigate()
  const { draftObservation, updateDraftField, removeDraftField, setDraftObservation } = useAppStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [severity, setSeverity] = useState<SeverityOption>('routine')
  const [confirmed, setConfirmed] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  if (!draftObservation) {
    return (
      <div className="animate-fade-in">
        <EmptyState
          icon="📋"
          title="No observation to review"
          description="Add a note first, then it will appear here for your review."
          action={{ label: 'Add an observation', onClick: () => navigate('/observe') }}
        />
      </div>
    )
  }

  const allConfirmed = draftObservation.extractedFields.every((f) => f.caregiverConfirmed)
  const confirmedCount = draftObservation.extractedFields.filter((f) => f.caregiverConfirmed).length

  const startEdit = (fieldId: string, currentValue: string | null) => {
    setEditingId(fieldId)
    setEditValue(currentValue ?? '')
  }

  const saveEdit = (fieldId: string) => {
    updateDraftField(fieldId, { valueText: editValue })
    setEditingId(null)
  }

  const confirmField = (fieldId: string) => {
    // This is the ONLY place caregiverConfirmed becomes true — explicit action
    updateDraftField(fieldId, { caregiverConfirmed: true })
  }

  const handleSave = async () => {
    if (!confirmed) {
      toast.error('Please check the confirmation box to save.')
      return
    }
    if (!allConfirmed) {
      toast.error('Please confirm all extracted fields before saving.')
      return
    }

    setIsSaving(true)
    try {
      // In demo mode, we add to the demo observations list
      const newObs = {
        id: draftObservation.entryId,
        careRecipientId: 'rav-kumar-001',
        caregiverId: 'caregiver-demos-001',
        rawText: draftObservation.transcript,
        voiceTranscript: draftObservation.source === 'voice' ? draftObservation.transcript : undefined,
        extractedFields: draftObservation.extractedFields.map((f) => ({
          category: f.category,
          field: f.metricKey,
          value: f.valueText ?? '',
          unit: null,
          caregiverConfirmed: f.caregiverConfirmed,
          differentFromBaseline: f.comparisonToBaseline !== Comparison.Same && f.comparisonToBaseline !== Comparison.Unknown,
          sourceQuote: f.sourceQuote,
        })),
        severity,
        observedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isDemo: true,
      }

      // Add to demo list (in real mode this would go to Supabase via repository)
      RAVI_OBSERVATIONS.unshift(newObs as unknown as typeof RAVI_OBSERVATIONS[0])

      setDraftObservation(null)
      toast.success('Observation saved successfully.')
      navigate('/dashboard')
    } catch {
      toast.error('Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Review Before Saving</h1>
        <p className="text-sm text-gray-500 mt-1">
          Caregiver-reported observations are organized below. Confirm, edit, or remove each field before saving.
        </p>
      </div>

      {/* Original note */}
      <div className="bg-navy-50 border border-navy-100 rounded-xl p-4">
        <p className="text-xs font-medium text-navy-500 mb-1">Your original note:</p>
        <p className="text-sm text-navy-800 leading-relaxed italic">"{draftObservation.transcript}"</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-cream-200 rounded-full h-2">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(confirmedCount / Math.max(draftObservation.extractedFields.length, 1)) * 100}%` }}
            aria-label={`${confirmedCount} of ${draftObservation.extractedFields.length} fields confirmed`}
          />
        </div>
        <span className="text-xs text-gray-500 shrink-0">
          {confirmedCount}/{draftObservation.extractedFields.length} confirmed
        </span>
      </div>

      {/* Extracted fields */}
      <div className="flex flex-col gap-3" aria-label="Extracted observation fields">
        {draftObservation.extractedFields.map((field) => (
          <div
            key={field.id}
            className={cn(
              'bg-white rounded-xl shadow-soft p-4 border-l-4 transition-all',
              field.caregiverConfirmed ? 'border-teal-400' : 'border-cream-300',
            )}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-navy-700 bg-navy-50 px-2 py-0.5 rounded-full">
                  {CATEGORY_LABELS[field.category] ?? field.category}
                </span>
                <Badge variant={COMPARISON_BADGE[field.comparisonToBaseline]}>
                  {COMPARISON_LABELS[field.comparisonToBaseline]}
                </Badge>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => startEdit(field.id, field.valueText)}
                  aria-label={`Edit ${field.metricKey}`}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-navy-700 hover:bg-cream-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => removeDraftField(field.id)}
                  aria-label={`Remove ${field.metricKey}`}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Value — editable */}
            {editingId === field.id ? (
              <div className="flex gap-2 mt-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  aria-label="Edit value"
                  className="flex-1 text-sm py-2"
                />
                <Button size="sm" variant="primary" onClick={() => saveEdit(field.id)}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            ) : (
              <p className="text-sm text-navy-900 font-medium mt-1">
                {field.valueText ?? '—'}
              </p>
            )}

            {/* Source quote */}
            <p className="text-xs text-gray-400 mt-1 italic">
              Source: "{field.sourceQuote}"
            </p>

            {/* Confirm button */}
            {!field.caregiverConfirmed ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => confirmField(field.id)}
                className="mt-3"
                aria-label={`Confirm this field: ${field.metricKey}`}
              >
                <Check size={14} /> Confirm this field
              </Button>
            ) : (
              <p className="text-xs text-teal-600 font-medium mt-3 flex items-center gap-1">
                <Check size={12} /> Caregiver-confirmed
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Severity picker */}
      <div>
        <p className="text-sm font-medium text-navy-800 mb-2">How would you describe this entry?</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Observation severity">
          {(['routine', 'noteworthy', 'incident'] as const).map((s) => (
            <button
              key={s}
              role="radio"
              aria-checked={severity === s}
              onClick={() => setSeverity(s)}
              className={cn(
                'px-4 py-2 rounded-full text-sm border transition-all min-h-[44px]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                severity === s
                  ? s === 'incident'
                    ? 'bg-red-100 border-red-400 text-red-800 font-semibold'
                    : s === 'noteworthy'
                    ? 'bg-amber-100 border-amber-400 text-amber-800 font-semibold'
                    : 'bg-teal-100 border-teal-400 text-teal-800 font-semibold'
                  : 'bg-white border-cream-300 text-navy-700 hover:bg-cream-50',
              )}
            >
              {s === 'routine' ? '✓ Routine day' : s === 'noteworthy' ? '⚡ Noteworthy' : '🚨 Incident to flag'}
            </button>
          ))}
        </div>
        {severity === 'incident' && (
          <p className="text-xs text-gray-500 mt-2">
            Caregiver-labeled as an incident. This will be highlighted in the report for your healthcare professional to review.
          </p>
        )}
      </div>

      {/* Final confirmation gate */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 w-5 h-5 rounded border-cream-300 text-teal-600 focus-visible:ring-2 focus-visible:ring-teal-400"
        />
        <span className="text-sm text-navy-800 leading-relaxed">
          I have reviewed the fields above. These are my caregiver-reported observations and I confirm they accurately reflect what I observed.
        </span>
      </label>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => navigate('/observe')} className="flex-1">
          ← Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          isLoading={isSaving}
          disabled={!confirmed || !allConfirmed}
          className="flex-1"
          aria-label="Save confirmed observation"
        >
          Save Observation
        </Button>
      </div>

      <Disclaimer />
    </div>
  )
}
