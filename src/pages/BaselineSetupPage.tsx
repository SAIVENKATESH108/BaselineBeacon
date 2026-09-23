// src/pages/BaselineSetupPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Disclaimer } from '@/components/common/Disclaimer'
import { RAVI_BASELINE } from '@/data/demoData'
import { cn } from '@/lib/utils'

type Step = 'recipient' | 'sleep' | 'appetite' | 'mobility' | 'medications' | 'review'

const STEPS: { id: Step; label: string; icon: string }[] = [
  { id: 'recipient', label: 'Person',      icon: '👤' },
  { id: 'sleep',     label: 'Sleep',       icon: '😴' },
  { id: 'appetite',  label: 'Appetite',    icon: '🍽️' },
  { id: 'mobility',  label: 'Mobility',    icon: '🚶' },
  { id: 'medications',label: 'Medication', icon: '💊' },
  { id: 'review',    label: 'Review',      icon: '✅' },
]

export function BaselineSetupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('recipient')
  const [isSaving, setIsSaving] = useState(false)

  const { register, handleSubmit, getValues, formState: { errors } } = useForm({
    defaultValues: {
      name: 'Ravi Kumar',
      ageRange: '70-79',
      relationship: 'Grandfather',
      typicalSleepHours: '7',
      sleepNotes: 'Short afternoon nap of about 30 minutes',
      typicalMealsPerDay: '3',
      appetiteNotes: 'Eats breakfast, lunch, and dinner without skipping',
      typicalFluidGlasses: '6',
      mobilityAids: 'Walking cane',
      mobilityNotes: 'Walks independently with a cane outdoors and indoors',
      currentMedications: '',
      medicationNotes: 'Takes morning medication without prompting',
    },
  })

  const stepIndex = STEPS.findIndex((s) => s.id === step)

  const goNext = () => {
    const nextStep = STEPS[stepIndex + 1]
    if (nextStep) setStep(nextStep.id)
  }

  const goBack = () => {
    const prevStep = STEPS[stepIndex - 1]
    if (prevStep) setStep(prevStep.id)
  }

  const onSubmit = async () => {
    setIsSaving(true)
    try {
      // In demo mode, baseline is from demoData; in production this would save to Supabase
      await new Promise((r) => setTimeout(r, 600))
      toast.success('Baseline saved! You can update it any time.')
      navigate('/dashboard')
    } finally {
      setIsSaving(false)
    }
  }

  const values = getValues()

  return (
    <div className="flex flex-col gap-6 max-w-xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">
          {step === 'review' ? 'Review Baseline' : 'Set Up Usual Patterns'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Describe the care recipient's usual patterns — what is normal for them, not a medical range.
        </p>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1" role="progressbar" aria-label={`Step ${stepIndex + 1} of ${STEPS.length}`}>
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => i < stepIndex && setStep(s.id)}
              disabled={i > stepIndex}
              className={cn(
                'w-8 h-8 rounded-full text-sm flex items-center justify-center transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                i < stepIndex
                  ? 'bg-teal-600 text-white cursor-pointer'
                  : i === stepIndex
                  ? 'bg-navy-800 text-white'
                  : 'bg-cream-200 text-gray-400 cursor-not-allowed',
              )}
              aria-label={s.label}
            >
              {i < stepIndex ? '✓' : s.icon}
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn('h-0.5 w-6', i < stepIndex ? 'bg-teal-400' : 'bg-cream-200')} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-white rounded-2xl shadow-soft p-6">

        {/* Step: recipient */}
        {step === 'recipient' && (
          <div className="flex flex-col gap-4">
            <Input label="Care recipient's first name" {...register('name', { required: true })} />
            <div>
              <label className="text-sm font-medium text-navy-800 block mb-1.5">Age range (approximate)</label>
              <select
                {...register('ageRange')}
                className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-white text-navy-900 text-base min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                {['Under 60', '60-69', '70-79', '80-89', '90+'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <Input label="Your relationship to them" {...register('relationship')} placeholder="e.g. Mother, Father, Spouse" />
          </div>
        )}

        {/* Step: sleep */}
        {step === 'sleep' && (
          <div className="flex flex-col gap-4">
            <Input
              label="Typical hours of sleep per night"
              type="number"
              min={0} max={24}
              {...register('typicalSleepHours')}
              hint="Approximate number — not a precise medical measure"
            />
            <Textarea
              label="Notes on usual sleep patterns"
              {...register('sleepNotes')}
              rows={3}
              placeholder="e.g. Short afternoon nap, usually wakes once at night"
            />
          </div>
        )}

        {/* Step: appetite */}
        {step === 'appetite' && (
          <div className="flex flex-col gap-4">
            <Input
              label="Typical meals per day"
              type="number"
              min={0} max={10}
              {...register('typicalMealsPerDay')}
            />
            <Input
              label="Typical glasses of fluid per day"
              type="number"
              min={0}
              {...register('typicalFluidGlasses')}
              hint="Water, tea, soup, juice — caregiver estimate"
            />
            <Textarea
              label="Notes on appetite"
              {...register('appetiteNotes')}
              rows={3}
              placeholder="e.g. Usually finishes full portions; sometimes skips dessert"
            />
          </div>
        )}

        {/* Step: mobility */}
        {step === 'mobility' && (
          <div className="flex flex-col gap-4">
            <Input
              label="Mobility aids used"
              {...register('mobilityAids')}
              placeholder="e.g. Walking cane, walker, none"
            />
            <Textarea
              label="Notes on usual movement"
              {...register('mobilityNotes')}
              rows={3}
              placeholder="e.g. Walks to the garden independently, uses cane outdoors"
            />
          </div>
        )}

        {/* Step: medications */}
        {step === 'medications' && (
          <div className="flex flex-col gap-4">
            <Textarea
              label="Current medications (optional)"
              {...register('currentMedications')}
              rows={3}
              placeholder="e.g. Morning blood pressure tablet, vitamin D"
              hint="Caregiver-entered only. This information is not verified medically."
            />
            <Textarea
              label="Notes on medication routine"
              {...register('medicationNotes')}
              rows={2}
              placeholder="e.g. Takes morning medication with breakfast, unprompted"
            />
          </div>
        )}

        {/* Step: review */}
        {step === 'review' && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500 mb-2">
              Review the usual patterns you've described. You can go back to edit any section.
            </p>
            {[
              { label: 'Name', value: values.name },
              { label: 'Age range', value: values.ageRange },
              { label: 'Relationship', value: values.relationship },
              { label: 'Sleep (hours)', value: values.typicalSleepHours },
              { label: 'Sleep notes', value: values.sleepNotes },
              { label: 'Meals/day', value: values.typicalMealsPerDay },
              { label: 'Fluid glasses/day', value: values.typicalFluidGlasses },
              { label: 'Mobility aids', value: values.mobilityAids },
              { label: 'Mobility notes', value: values.mobilityNotes },
              { label: 'Medications', value: values.currentMedications || 'Not entered' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-cream-100 gap-4 last:border-0">
                <span className="text-sm text-gray-500">{row.label}</span>
                <span className="text-sm text-navy-900 font-medium text-right">{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {stepIndex > 0 && (
            <Button type="button" variant="ghost" onClick={goBack} className="flex-1">
              ← Back
            </Button>
          )}
          {step !== 'review' ? (
            <Button type="button" variant="primary" onClick={goNext} className="flex-1">
              Next →
            </Button>
          ) : (
            <Button type="submit" variant="primary" size="lg" isLoading={isSaving} className="flex-1">
              Save Baseline
            </Button>
          )}
        </div>
      </form>

      <Disclaimer />
    </div>
  )
}
