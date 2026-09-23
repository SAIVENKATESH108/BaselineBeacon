// src/pages/AIReviewPage.tsx — Cohesive, Colorful & Animated Deep Review
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check, Pencil, Trash2, Plus, Sparkles, ShieldCheck,
  CheckCircle2, AlertTriangle, AlertCircle, ArrowLeft, Save
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Disclaimer } from '@/components/common/Disclaimer'
import { EmptyState } from '@/components/common/EmptyState'
import { useAppStore } from '@/state/appStore'
import { ObservationCategory, Comparison } from '@/domain/models'
import { RAVI_OBSERVATIONS } from '@/data/demoData'
import { cn } from '@/lib/utils'

const CATEGORY_LABELS: Record<ObservationCategory, string> = {
  [ObservationCategory.MealIntake]:     'Meal Intake',
  [ObservationCategory.Hydration]:      'Hydration',
  [ObservationCategory.Sleep]:          'Sleep & Rest',
  [ObservationCategory.Energy]:         'Energy & Alertness',
  [ObservationCategory.Mobility]:       'Mobility & Gait',
  [ObservationCategory.MoodBehavior]:   'Mood & Behavior',
  [ObservationCategory.Medication]:     'Medication',
  [ObservationCategory.PainDiscomfort]: 'Pain / Discomfort',
  [ObservationCategory.FallIncident]:   'Fall / Incident',
  [ObservationCategory.Other]:          'Other',
}

const COMPARISON_LABELS: Record<Comparison, string> = {
  [Comparison.Lower]:    '⚡ Less than usual',
  [Comparison.Higher]:   '⚡ More than usual',
  [Comparison.Same]:     '✓ Within usual range',
  [Comparison.Different]:'⚡ Different from usual',
  [Comparison.Unknown]:  '• Comparison unknown',
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
    const { draftObservation, updateDraftField, removeDraftField, setDraftObservation, addObservation } = useAppStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [severity, setSeverity] = useState<SeverityOption>('routine')
  const [confirmed, setConfirmed] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  if (!draftObservation) {
    return (
      <div className="animate-fade-in max-w-xl mx-auto py-12">
        <EmptyState
          icon="📋"
          title="No observation to review"
          description="Add a caregiver note first, then review each extracted field here."
          action={{ label: 'Add an observation', onClick: () => navigate('/observe') }}
        />
      </div>
    )
  }

  const allConfirmed = draftObservation.extractedFields.every((f) => f.caregiverConfirmed)
  const confirmedCount = draftObservation.extractedFields.filter((f) => f.caregiverConfirmed).length
  const progressPercent = Math.round((confirmedCount / Math.max(draftObservation.extractedFields.length, 1)) * 100)

  const startEdit = (fieldId: string, currentValue: string | null) => {
    setEditingId(fieldId)
    setEditValue(currentValue ?? '')
  }

  const saveEdit = (fieldId: string) => {
    updateDraftField(fieldId, { valueText: editValue })
    setEditingId(null)
  }

  const confirmField = (fieldId: string) => {
    updateDraftField(fieldId, { caregiverConfirmed: true })
  }

  const confirmAllFields = () => {
    draftObservation.extractedFields.forEach((f) => {
      updateDraftField(f.id, { caregiverConfirmed: true })
    })
    toast.success('All fields confirmed!')
  }

  const handleSave = async () => {
    if (!confirmed) {
      toast.error('Please check the caregiver confirmation box below to save.')
      return
    }
    if (!allConfirmed) {
      toast.error('Please confirm all extracted fields before saving.')
      return
    }

    setIsSaving(true)
    try {
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

      await addObservation(newObs as unknown as typeof RAVI_OBSERVATIONS[0])
      RAVI_OBSERVATIONS.unshift(newObs as unknown as typeof RAVI_OBSERVATIONS[0])

      setDraftObservation(null)
      toast.success('Observation saved and added to timeline!')
      navigate('/dashboard')
    } catch {
      toast.error('Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-2">
          <Sparkles size={13} className="text-teal-400" />
          <span>Caregiver Confirmation Gate</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Review Structured Note
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Review the AI-extracted fields below. Confirm, edit, or remove each item before saving to Ravi Kumar's record.
        </p>
      </div>

      {/* Raw Note Preview Box */}
      <div className="bg-navy-900/90 text-white rounded-3xl p-5 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold uppercase tracking-wider text-teal-300">Original Caregiver Input</span>
          <span>Source: {draftObservation.source === 'voice' ? '🎙️ Voice note' : '✏️ Text input'}</span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed italic">
          "{draftObservation.transcript}"
        </p>
      </div>

      {/* Confirmation Progress Bar */}
      <div className="bg-navy-900/80 p-5 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-200 flex items-center gap-1.5">
            <CheckCircle2 size={16} className={allConfirmed ? 'text-emerald-400' : 'text-teal-400'} />
            Confirmation Progress: {confirmedCount} of {draftObservation.extractedFields.length} confirmed
          </span>
          {!allConfirmed && (
            <button
              onClick={confirmAllFields}
              className="text-xs text-teal-300 hover:text-teal-200 font-bold hover:underline"
            >
              Confirm All (1-click)
            </button>
          )}
        </div>
        <div className="w-full bg-navy-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-teal-500 to-cyan-400 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Extracted Fields List */}
      <div className="space-y-3.5" aria-label="Extracted observation fields">
        {draftObservation.extractedFields.map((field) => {
          const isDiff = field.comparisonToBaseline !== Comparison.Same && field.comparisonToBaseline !== Comparison.Unknown

          return (
            <div
              key={field.id}
              className={cn(
                'card-interactive bg-navy-900/80 rounded-2xl p-5 border backdrop-blur-xl transition-all duration-200 shadow-lg',
                field.caregiverConfirmed
                  ? 'border-emerald-500/40 bg-emerald-950/20'
                  : 'border-slate-800 hover:border-slate-700',
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-teal-200 bg-navy-950 border border-slate-800 px-2.5 py-1 rounded-lg">
                    {CATEGORY_LABELS[field.category] ?? field.category}
                  </span>
                  <Badge variant={COMPARISON_BADGE[field.comparisonToBaseline]}>
                    {COMPARISON_LABELS[field.comparisonToBaseline]}
                  </Badge>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(field.id, field.valueText)}
                    aria-label={`Edit ${field.metricKey}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => removeDraftField(field.id)}
                    aria-label={`Remove ${field.metricKey}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Value or Edit Mode */}
              {editingId === field.id ? (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    aria-label="Edit value"
                    className="flex-1 text-sm py-2"
                  />
                  <Button size="sm" variant="primary" onClick={() => saveEdit(field.id)}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <p className="text-base font-bold text-white mt-1">
                  {field.valueText ?? '—'}
                </p>
              )}

              {/* Source Quote */}
              <p className="text-xs text-slate-400 mt-1.5 italic">
                From your note: "{field.sourceQuote}"
              </p>

              {/* Confirmation Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                {!field.caregiverConfirmed ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => confirmField(field.id)}
                    className="text-xs font-bold bg-navy-950 border-slate-700 text-teal-300 hover:bg-slate-900"
                  >
                    <Check size={14} /> Confirm This Item
                  </Button>
                ) : (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={15} /> Confirmed by caregiver
                  </span>
                )}

                {isDiff && (
                  <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                    Flagged for appointment
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Severity Selector */}
      <div className="bg-navy-900/80 p-5 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-xl space-y-3">
        <label className="text-sm font-bold text-white block">
          How would you summarize this observation day?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {(['routine', 'noteworthy', 'incident'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverity(s)}
              className={cn(
                'p-3.5 rounded-2xl border text-xs font-bold transition-all text-left flex items-center gap-2.5',
                severity === s
                  ? s === 'incident'
                    ? 'bg-rose-500/20 border-rose-400 text-rose-200 shadow-md shadow-rose-500/20'
                    : s === 'noteworthy'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20'
                    : 'bg-teal-500/20 border-teal-400 text-teal-200 shadow-md shadow-teal-500/20'
                  : 'bg-navy-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900',
              )}
            >
              <span className="text-lg">
                {s === 'routine' ? '✓' : s === 'noteworthy' ? '⚡' : '⚠️'}
              </span>
              <div>
                <span className="block font-bold capitalize text-white">{s}</span>
                <span className="text-[10px] opacity-75 font-normal text-slate-300">
                  {s === 'routine' ? 'Typical usual day' : s === 'noteworthy' ? 'Change observed' : 'Issue to flag'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Caregiver Confirmation Checkbox */}
      <div className="p-5 rounded-3xl bg-navy-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
        <label className="flex items-start gap-3.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 w-5 h-5 rounded-md border-slate-700 bg-navy-950 text-teal-500 focus:ring-teal-400 cursor-pointer"
          />
          <span className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
            I confirm these are my caregiver-reported observations. They accurately describe what I observed and are ready to be included in Ravi Kumar's record.
          </span>
        </label>
      </div>

      {/* Bottom Save Action */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate('/observe')}
          className="sm:w-1/3 bg-navy-900 border-slate-700 text-white hover:bg-slate-800"
        >
          <ArrowLeft size={16} />
          <span>Edit Note</span>
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          isLoading={isSaving}
          disabled={!confirmed || !allConfirmed}
          className="sm:flex-1 font-bold shadow-lg shadow-teal-500/25 py-4"
        >
          <Save size={18} />
          <span>Save Confirmed Observation</span>
        </Button>
      </div>

      <Disclaimer />
    </div>
  )
}
