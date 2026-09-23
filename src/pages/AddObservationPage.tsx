// src/pages/AddObservationPage.tsx — Cohesive, Colorful & Animated Observation Input
import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Mic, MicOff, StopCircle, Trash2, RotateCcw, Sparkles,
  ArrowRight, ShieldCheck, Check, Lightbulb
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Disclaimer } from '@/components/common/Disclaimer'
import { useAppStore } from '@/state/appStore'
import { resilientExtractor } from '@/data/extractors/ResilientObservationExtractor'
import { ObservationCategory, Comparison } from '@/domain/models'
import { cn } from '@/lib/utils'

const TOPIC_CHIPS = [
  { text: 'Ate less than usual', icon: '🍽️', color: 'hover:border-amber-400 hover:text-amber-300' },
  { text: 'Drank less water', icon: '💧', color: 'hover:border-teal-400 hover:text-teal-300' },
  { text: 'Slept longer nap', icon: '😴', color: 'hover:border-indigo-400 hover:text-indigo-300' },
  { text: 'Movement seemed slower', icon: '🚶', color: 'hover:border-emerald-400 hover:text-emerald-300' },
  { text: 'No fall observed', icon: '✅', color: 'hover:border-emerald-400 hover:text-emerald-300' },
  { text: 'Mood felt withdrawn', icon: '😔', color: 'hover:border-rose-400 hover:text-rose-300' },
  { text: 'Medication taken on time', icon: '💊', color: 'hover:border-purple-400 hover:text-purple-300' },
  { text: 'Something felt off', icon: '⚡', color: 'hover:border-amber-400 hover:text-amber-300' },
]

const schema = z.object({
  rawText: z.string().min(10, 'Please describe what you observed (at least 10 characters)').max(5000),
  source: z.enum(['voice', 'text']),
})
type FormValues = z.infer<typeof schema>

type RecordingState = 'idle' | 'recording' | 'stopped' | 'denied'

export function AddObservationPage() {
  const navigate = useNavigate()
  const { setDraftObservation } = useAppStore()
  const [activeTab, setActiveTab] = useState<'voice' | 'text'>('text')
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [transcript, setTranscript] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any | null>(null)

  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rawText: '', source: 'text' },
  })

  const rawText = watch('rawText')

  const addChip = (chipText: string) => {
    const current = rawText
    const separator = current && !current.endsWith(' ') ? '. ' : ''
    setValue('rawText', current + separator + chipText, { shouldValidate: true })
  }

  // ─── Voice Recording Logic ──────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setRecordingState('recording')
      setValue('source', 'voice')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionImpl: (new () => any) | undefined =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition

      if (SpeechRecognitionImpl) {
        const recognition = new SpeechRecognitionImpl()
        recognition.continuous = true
        recognition.interimResults = true
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const text = Array.from(event.results as any[])
            .map((r: any) => r[0].transcript as string)
            .join(' ')
          setTranscript(text)
          setValue('rawText', text, { shouldValidate: false })
        }
        recognition.start()
        recognitionRef.current = recognition
      }
    } catch {
      setRecordingState('denied')
      toast.error('Microphone access denied. You can still type your observation below.')
    }
  }, [setValue])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    mediaRecorderRef.current?.stop()
    setRecordingState('stopped')
  }, [])

  const discardRecording = useCallback(() => {
    recognitionRef.current?.stop()
    setRecordingState('idle')
    setTranscript('')
    setValue('rawText', '', { shouldValidate: false })
    setValue('source', 'text')
  }, [setValue])

  // ─── Submit → Extract → Review ──────────────────────────────────────────
  const onSubmit = async (data: FormValues) => {
    setIsExtracting(true)
    try {
      const result = await resilientExtractor.extract(data.rawText)
      const entryId = crypto.randomUUID()

      setDraftObservation({
        entryId,
        transcript: data.rawText,
        source: data.source,
        extractedFields: result.extractedFields.map((f, i) => ({
          id: `field-${i}`,
          category: f.category as ObservationCategory,
          metricKey: f.metricKey,
          valueText: f.valueText,
          valueNumber: f.valueNumber,
          comparisonToBaseline: f.comparisonToBaseline as Comparison,
          sourceQuote: f.sourceQuote,
          caregiverConfirmed: false,
        })),
      })

      navigate('/review')
    } catch (err) {
      toast.error('Could not process your note. Please try again.')
      console.error(err)
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-2">
          <Sparkles size={13} className="text-teal-400" />
          <span>Caregiver Voice & Text Logger</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Capture Observation
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Share what you observed today. BaselineBeacon organizes observations into categories — it does not diagnose.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-navy-950 p-1.5 rounded-2xl gap-1 border border-slate-800 shadow-inner" role="tablist">
        {(['text', 'voice'] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 min-h-[46px] flex items-center justify-center gap-2',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
              activeTab === tab
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/25'
                : 'text-slate-400 hover:text-white',
            )}
          >
            {tab === 'voice' ? (
              <>
                <Mic size={17} />
                <span>Voice Note</span>
              </>
            ) : (
              <>
                <span>✏️</span>
                <span>Type Observation</span>
              </>
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        {/* Voice Recording Box */}
        {activeTab === 'voice' && (
          <div className="bg-navy-900/80 border border-slate-800/90 rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col items-center gap-6 backdrop-blur-xl" role="tabpanel">
            {recordingState === 'denied' && (
              <div className="w-full bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 text-xs sm:text-sm text-amber-200 leading-relaxed">
                ⚠️ Microphone access was denied by your browser. Please type your observation in the box below instead.
              </div>
            )}

            {recordingState === 'idle' && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-24 h-24 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center shadow-xl shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all group"
                  aria-label="Start voice recording"
                >
                  <Mic size={36} className="group-hover:animate-pulse" />
                </button>
                <div>
                  <h3 className="text-base font-bold text-white">Tap to Start Speaking</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Speak casually e.g. "Dad only drank half a glass of juice and seemed wobbly when getting out of bed."
                  </p>
                </div>
              </div>
            )}

            {recordingState === 'recording' && (
              <div className="flex flex-col items-center gap-5 w-full py-4">
                <div className="relative flex items-center justify-center w-24 h-24">
                  <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-pulse-ring" />
                  <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/40">
                    <Mic size={28} className="text-white animate-pulse" />
                  </div>
                </div>

                <div className="text-center">
                  <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                    🔴 Recording live… Speak clearly
                  </span>
                </div>

                {/* Animated Waveform Visualizer */}
                <div className="flex items-center gap-1.5 h-10 py-1" aria-hidden="true">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-gradient-to-t from-teal-400 to-cyan-300 rounded-full"
                      style={{
                        animation: `wave ${0.4 + (i % 6) * 0.12}s ease-in-out infinite alternate`,
                        height: '24px',
                      }}
                    />
                  ))}
                </div>

                {transcript && (
                  <div className="w-full bg-navy-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 italic leading-relaxed max-h-32 overflow-y-auto">
                    "{transcript}"
                  </div>
                )}

                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  onClick={stopRecording}
                  className="w-full font-bold shadow-rose-500/25 py-3"
                >
                  <StopCircle size={18} />
                  <span>Finish & Stop Recording</span>
                </Button>
              </div>
            )}

            {recordingState === 'stopped' && (
              <div className="flex flex-col gap-4 w-full">
                <div className="p-4 bg-navy-950 border border-slate-800 rounded-2xl text-sm text-slate-200 italic leading-relaxed">
                  "{transcript || rawText}"
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={discardRecording}
                    className="flex-1 bg-navy-950 border-slate-700 text-slate-300 hover:bg-slate-900"
                  >
                    <Trash2 size={14} /> Discard
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => { discardRecording(); startRecording() }}
                    className="flex-1 bg-navy-950 border-teal-500/40 text-teal-300 hover:bg-slate-900"
                  >
                    <RotateCcw size={14} /> Re-record
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text Note Input Area */}
        <div className="bg-navy-900/80 border border-slate-800/90 rounded-3xl shadow-xl p-6 sm:p-7 backdrop-blur-xl space-y-4" role="tabpanel">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Observation Details
            </span>
            <span className="text-xs text-teal-300 font-medium">Natural language supported</span>
          </div>

          <Controller
            name="rawText"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Example: Dad only ate half his oatmeal for breakfast. Complained his knees felt stiff while walking to the garden. Did not nap this afternoon."
                rows={6}
                maxLength={5000}
                showCount
                error={errors.rawText?.message}
              />
            )}
          />

          {/* Quick Topic Helper Chips */}
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2.5">
              <Lightbulb size={14} className="text-amber-400" />
              <span>Quick add topics:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TOPIC_CHIPS.map((chip) => (
                <button
                  key={chip.text}
                  type="button"
                  onClick={() => addChip(chip.text)}
                  className={`text-xs bg-navy-950/80 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:-translate-y-0.5 ${chip.color}`}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hidden Source Field */}
        <input type="hidden" {...register('source')} />

        {/* Submit & Organize CTA */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isExtracting}
          className="w-full text-base font-bold shadow-lg shadow-teal-500/25 py-4"
        >
          {isExtracting ? 'Analyzing with AI…' : 'Organize with AI & Review Fields →'}
        </Button>
      </form>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 leading-relaxed flex items-start gap-3">
        <ShieldCheck size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300">Explicit Caregiver Review Guarantee:</span>
          <span className="ml-1">
            Nothing is saved automatically. On the next screen, you will review, edit, and confirm every single observation before it enters Ravi's record.
          </span>
        </div>
      </div>

      <Disclaimer />
    </div>
  )
}
