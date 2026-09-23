// src/pages/AddObservationPage.tsx
import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mic, MicOff, StopCircle, Trash2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Disclaimer } from '@/components/common/Disclaimer'
import { useAppStore } from '@/state/appStore'
import { resilientExtractor } from '@/data/extractors/ResilientObservationExtractor'
import { ObservationCategory, Comparison } from '@/domain/models'
import { cn } from '@/lib/utils'

const TOPIC_CHIPS = [
  'Ate less than usual',
  'Drank less water',
  'Slept more',
  'Movement was harder',
  'No fall observed',
  'Something felt different',
  'Mood was different',
  'Medication taken',
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

  // Append topic chip text to the textarea
  const addChip = (chip: string) => {
    const current = rawText
    const separator = current && !current.endsWith(' ') ? '. ' : ''
    setValue('rawText', current + separator + chip, { shouldValidate: true })
  }

  // ─── Voice Recording ────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setRecordingState('recording')
      setValue('source', 'voice')

      // Web Speech API for live transcript (Chrome/Edge only)
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
    <div className="flex flex-col gap-6 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Add an Observation</h1>
        <p className="text-sm text-gray-500 mt-1">
          Share what you noticed. BaselineBeacon organizes observations — it does not diagnose.
        </p>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-cream-100 rounded-xl p-1 gap-1" role="tablist" aria-label="Input mode">
        {(['text', 'voice'] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all min-h-[44px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
              activeTab === tab
                ? 'bg-white text-navy-900 shadow-soft'
                : 'text-gray-500 hover:text-navy-700',
            )}
          >
            {tab === 'voice' ? '🎙️ Voice' : '✏️ Text'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">

        {/* Voice panel */}
        {activeTab === 'voice' && (
          <div className="bg-white rounded-2xl shadow-soft p-6 flex flex-col items-center gap-4" role="tabpanel">
            {recordingState === 'denied' && (
              <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                ⚠️ Microphone access was denied by your browser. Use the text input below to add your observation.
              </div>
            )}

            {recordingState === 'idle' && (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={startRecording}
                aria-label="Start voice recording"
                className="w-full"
              >
                <Mic size={20} />
                Start Recording
              </Button>
            )}

            {recordingState === 'recording' && (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="relative flex items-center justify-center w-20 h-20">
                  <div className="absolute inset-0 rounded-full bg-red-100 animate-pulse-ring" />
                  <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center">
                    <Mic size={24} className="text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-500">Recording… speak clearly</p>
                {/* Waveform bars */}
                <div className="flex gap-1 items-center h-8" aria-hidden="true">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-teal-400 rounded-full"
                      style={{
                        height: '100%',
                        animation: `waveform ${0.5 + i * 0.07}s ease-in-out infinite alternate`,
                      }}
                    />
                  ))}
                </div>
                {transcript && (
                  <div className="w-full bg-cream-50 rounded-xl p-3 text-sm text-navy-800 max-h-24 overflow-y-auto">
                    {transcript}
                  </div>
                )}
                <Button type="button" variant="secondary" onClick={stopRecording} className="w-full">
                  <StopCircle size={18} />
                  Stop Recording
                </Button>
              </div>
            )}

            {recordingState === 'stopped' && (
              <div className="flex flex-col gap-3 w-full">
                <div className="bg-cream-50 rounded-xl p-3 text-sm text-navy-800 max-h-32 overflow-y-auto">
                  {transcript || rawText}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={discardRecording}>
                    <Trash2 size={14} /> Discard
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { discardRecording(); startRecording() }}>
                    <RotateCcw size={14} /> Re-record
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text input — always visible */}
        <div role="tabpanel" aria-label="Text input">
          <Controller
            name="rawText"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                label="What did you observe?"
                placeholder="For example: Dad ate about half his lunch today. He seemed more tired than usual and took a longer nap this afternoon. He took his morning tablets without prompting."
                rows={6}
                maxLength={5000}
                showCount
                error={errors.rawText?.message}
              />
            )}
          />
        </div>

        {/* Topic chips */}
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">Quick add:</p>
          <div className="flex flex-wrap gap-2">
            {TOPIC_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => addChip(chip)}
                className="text-xs bg-cream-100 border border-cream-300 text-navy-700 px-3 py-1.5 rounded-full hover:bg-cream-200 hover:border-cream-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 min-h-[36px]"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <input type="hidden" {...register('source')} />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isExtracting}
          className="w-full"
          aria-label="Organize this observation with AI"
        >
          {isExtracting ? 'Organizing your note…' : 'Organize & Review →'}
        </Button>
      </form>

      <Disclaimer />
    </div>
  )
}
