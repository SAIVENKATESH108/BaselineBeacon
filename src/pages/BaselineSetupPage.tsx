// src/pages/BaselineSetupPage.tsx — Colorful & Animated Multi-Step Baseline Setup
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Compass, Check, ArrowRight, ArrowLeft, Save, Sparkles,
  User, Moon, Utensils, Footprints, Pill, CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Disclaimer } from '@/components/common/Disclaimer'
import { RAVI_BASELINE } from '@/data/demoData'
import { useAppStore } from '@/state/appStore'
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
      currentMedications: 'Morning blood pressure tablet',
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

  const { updateBaselineEntries } = useAppStore()

  const onSubmit = async () => {
    setIsSaving(true)
    try {
      const vals = getValues()
      const updatedEntries = [
        {
          id: 'bl-001',
          careRecipientId: 'rav-kumar-001',
          category: 'meal_intake' as const,
          field: 'typical_meals_per_day',
          value: vals.typicalMealsPerDay ?? '3',
          unit: 'meals',
          notes: vals.appetiteNotes ?? 'eats three meals daily',
          capturedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'bl-002',
          careRecipientId: 'rav-kumar-001',
          category: 'hydration' as const,
          field: 'typical_fluid_intake',
          value: vals.typicalFluidGlasses ?? '6',
          unit: 'glasses',
          notes: 'drinks water throughout the day',
          capturedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'bl-003',
          careRecipientId: 'rav-kumar-001',
          category: 'sleep' as const,
          field: 'usual_night_sleep',
          value: vals.typicalSleepHours ?? '7-8',
          unit: 'hours',
          notes: vals.sleepNotes ?? 'sleeps at night',
          capturedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'bl-004',
          careRecipientId: 'rav-kumar-001',
          category: 'mobility' as const,
          field: 'mobility_assistance',
          value: vals.mobilityAids ?? 'cane',
          unit: null,
          notes: vals.mobilityNotes ?? 'walks with cane',
          capturedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      updateBaselineEntries(updatedEntries)
      toast.success('Baseline saved! Daily observations will now contrast against these values.')
      navigate('/dashboard')
    } finally {
      setIsSaving(false)
    }
  }

  const values = getValues()

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-2">
          <Compass size={13} className="text-teal-400" />
          <span>Care Baseline Benchmark</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {step === 'review' ? 'Review Saved Baseline' : 'Establish Usual Baseline Habits'}
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Describe the care recipient's usual routines. BaselineBeacon uses these benchmarks to detect noticeable day-to-day changes.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-navy-900/80 border border-slate-800 p-4 rounded-3xl backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1" role="progressbar">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => i < stepIndex && setStep(s.id)}
                disabled={i > stepIndex}
                className={cn(
                  'w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                  i < stepIndex
                    ? 'bg-gradient-to-tr from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/30 cursor-pointer'
                    : i === stepIndex
                    ? 'bg-amber-400 text-navy-950 font-black shadow-lg shadow-amber-500/30 scale-105'
                    : 'bg-navy-950 border border-slate-800 text-slate-500 cursor-not-allowed',
                )}
                aria-label={s.label}
              >
                {i < stepIndex ? <Check size={16} /> : <span>{s.icon}</span>}
              </button>
              <span className={cn(
                'hidden sm:inline text-xs font-semibold',
                i === stepIndex ? 'text-amber-300' : i < stepIndex ? 'text-teal-300' : 'text-slate-500'
              )}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  'h-0.5 w-4 sm:w-6 rounded-full mx-1',
                  i < stepIndex ? 'bg-teal-400' : 'bg-slate-800'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="bg-navy-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6"
      >
        {/* Step: recipient */}
        {step === 'recipient' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-xl">👤</span>
              <h2 className="text-base font-bold text-white">Care Recipient Profile</h2>
            </div>
            <Input label="Care recipient's full name" {...register('name', { required: true })} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-200">Age range (approximate)</label>
              <select
                {...register('ageRange')}
                className="w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-navy-950/90 text-white text-base min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                {['Under 60', '60-69', '70-79', '80-89', '90+'].map((r) => (
                  <option key={r} value={r} className="bg-navy-950 text-white">{r}</option>
                ))}
              </select>
            </div>
            <Input label="Your relationship to them" {...register('relationship')} placeholder="e.g. Daughter, Son, Spouse, Grandchild" />
          </div>
        )}

        {/* Step: sleep */}
        {step === 'sleep' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-xl">😴</span>
              <h2 className="text-base font-bold text-white">Sleep & Resting Habits</h2>
            </div>
            <Input
              label="Typical hours of sleep per night"
              type="number"
              min={0} max={24}
              {...register('typicalSleepHours')}
              hint="Approximate number — serves as reference for daily observations"
            />
            <Textarea
              label="Notes on usual sleep patterns"
              {...register('sleepNotes')}
              rows={3}
              placeholder="e.g. Usually takes a 30-minute nap after lunch, wakes once around 3 AM to use bathroom"
            />
          </div>
        )}

        {/* Step: appetite */}
        {step === 'appetite' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-xl">🍽️</span>
              <h2 className="text-base font-bold text-white">Meals & Fluid Habits</h2>
            </div>
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
              placeholder="e.g. Usually finishes full plate; loves hot tea; sometimes declines dinner salad"
            />
          </div>
        )}

        {/* Step: mobility */}
        {step === 'mobility' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-xl">🚶</span>
              <h2 className="text-base font-bold text-white">Mobility & Movement Habits</h2>
            </div>
            <Input
              label="Mobility aids used"
              {...register('mobilityAids')}
              placeholder="e.g. Walking cane, rollator walker, none"
            />
            <Textarea
              label="Notes on usual movement"
              {...register('mobilityNotes')}
              rows={3}
              placeholder="e.g. Walks steadily with cane outdoors; holds onto kitchen counters indoors"
            />
          </div>
        )}

        {/* Step: medications */}
        {step === 'medications' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-xl">💊</span>
              <h2 className="text-base font-bold text-white">Medication Habits</h2>
            </div>
            <Textarea
              label="Current routine medications (optional)"
              {...register('currentMedications')}
              rows={3}
              placeholder="e.g. Morning blood pressure tablet, daily multivitamin"
              hint="Caregiver-entered reference only. Not medically verified or prescribed."
            />
            <Textarea
              label="Notes on medication routine"
              {...register('medicationNotes')}
              rows={2}
              placeholder="e.g. Takes pills with morning oatmeal, rarely forgets"
            />
          </div>
        )}

        {/* Step: review */}
        {step === 'review' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <h2 className="text-base font-bold text-white">Confirm Usual Baseline</h2>
              </div>
              <span className="text-xs text-teal-300 font-semibold">Ready to Save</span>
            </div>

            <p className="text-xs text-slate-400">
              Review the baseline patterns you entered. Daily caregiver notes will compare against these usual values.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { label: 'Recipient Name', value: values.name },
                { label: 'Age Range', value: values.ageRange },
                { label: 'Relationship', value: values.relationship },
                { label: 'Usual Sleep', value: `${values.typicalSleepHours} hours / night` },
                { label: 'Usual Meals', value: `${values.typicalMealsPerDay} meals / day` },
                { label: 'Usual Fluid Intake', value: `${values.typicalFluidGlasses} glasses / day` },
                { label: 'Mobility Aids', value: values.mobilityAids || 'None' },
                { label: 'Medications', value: values.currentMedications || 'Not entered' },
              ].map((row) => (
                <div key={row.label} className="p-3.5 rounded-xl bg-navy-950/80 border border-slate-800 flex flex-col justify-between">
                  <span className="text-xs font-medium text-slate-400">{row.label}</span>
                  <span className="text-sm font-bold text-white mt-1">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-800">
          {stepIndex > 0 && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={goBack}
              className="flex-1 bg-navy-950 border-slate-700 text-white hover:bg-slate-900"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </Button>
          )}

          {step !== 'review' ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={goNext}
              className="flex-1 font-bold shadow-lg shadow-teal-500/25"
            >
              <span>Continue →</span>
            </Button>
          ) : (
            <Button
              type="submit"
              variant="amber"
              size="lg"
              isLoading={isSaving}
              className="flex-1 font-bold shadow-lg shadow-amber-500/30"
            >
              <Save size={18} />
              <span>Save & Activate Baseline</span>
            </Button>
          )}
        </div>
      </form>

      <Disclaimer />
    </div>
  )
}
