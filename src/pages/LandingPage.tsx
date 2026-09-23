// src/pages/LandingPage.tsx — Professional, Colorful & Animated Landing Page
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mic, Activity, TrendingUp, FileText, ArrowRight, ShieldCheck,
  CheckCircle2, Sparkles, AlertCircle, Compass, Users, Check
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Disclaimer } from '@/components/common/Disclaimer'
import { useAppStore } from '@/state/appStore'

interface SampleObservation {
  id: string
  title: string
  icon: string
  category: string
  color: string
  rawNote: string
  extractedField: string
  baselineValue: string
  observedValue: string
  delta: string
  severity: 'noteworthy' | 'routine' | 'incident'
}

const SAMPLE_SCENARIOS: SampleObservation[] = [
  {
    id: 'meals',
    title: 'Meal Intake',
    icon: '🍽️',
    category: 'Nutrition',
    color: 'from-amber-500 to-orange-500',
    rawNote: '"Dad only ate about 25% of his lunch today. Pushed the plate away and said he had no appetite."',
    extractedField: 'Lunch Intake',
    baselineValue: 'Usually finishes 80–90% of meals',
    observedValue: '25% of portion consumed',
    delta: '⚡ Significantly lower than usual (Day 3 of decline)',
    severity: 'noteworthy',
  },
  {
    id: 'hydration',
    title: 'Hydration',
    icon: '💧',
    category: 'Fluids',
    color: 'from-teal-400 to-cyan-500',
    rawNote: '"He only took a few sips of water after our afternoon walk. Only drank about 400ml total today."',
    extractedField: 'Fluid Intake',
    baselineValue: 'Usually drinks 1,500ml daily',
    observedValue: 'Caregiver estimated ~400ml',
    delta: '⚡ 70% lower than usual fluid intake',
    severity: 'noteworthy',
  },
  {
    id: 'mobility',
    title: 'Mobility & Gait',
    icon: '🚶',
    category: 'Physical',
    color: 'from-indigo-500 to-purple-500',
    rawNote: '"Hesitated for a full 20 seconds at the kitchen threshold. Shuffling footsteps with the walker."',
    extractedField: 'Walking Difficulty',
    baselineValue: 'Walks steadily with walker, minimal hesitation',
    observedValue: 'Noticeable shuffling & doorway freezing',
    delta: '⚡ Changed from usual baseline mobility',
    severity: 'noteworthy',
  },
]

const KEY_BENEFITS = [
  {
    icon: Mic,
    title: 'Voice or Natural Text',
    desc: 'Speak naturally into your phone while hands are full. Our specialized parser structures raw observations in seconds.',
    color: 'from-teal-500 to-cyan-500',
    badge: 'Hands-Free',
  },
  {
    icon: Compass,
    title: 'Personal Baseline Contrast',
    desc: 'Never rely on memory. Every new note is automatically weighed against your loved one’s unique baseline habits.',
    color: 'from-amber-400 to-orange-500',
    badge: 'Context-Aware',
  },
  {
    icon: TrendingUp,
    title: 'Multi-Day Trend Analytics',
    desc: 'Spot subtle patterns over 7, 14, or 30 days before they escalate, with clean non-diagnostic timeline graphs.',
    color: 'from-indigo-500 to-purple-600',
    badge: 'Visual Trends',
  },
  {
    icon: FileText,
    title: 'Physician-Ready Handoff PDF',
    desc: 'Generate a clean, professional summary designed for doctors and visiting nurses to review in under 60 seconds.',
    color: 'from-emerald-400 to-teal-600',
    badge: '1-Click Export',
  },
]

export function LandingPage() {
  const navigate = useNavigate()
  const { enableDemoMode } = useAppStore()
  const [activeScenario, setActiveScenario] = useState<SampleObservation>(SAMPLE_SCENARIOS[0])

  const handleTryDemo = () => {
    enableDemoMode()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-navy-950 text-white flex flex-col selection:bg-teal-500 selection:text-white">
      {/* ── Top Header Navigation ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-navy-900/80 backdrop-blur-md border-b border-navy-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 shadow-md shadow-teal-500/30">
              <span className="text-xl" aria-hidden="true">🔦</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-teal-100 to-teal-300 bg-clip-text text-transparent">
                BaselineBeacon
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Caregiver Companion
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-navy-200 hover:text-white hover:bg-navy-800"
            >
              Sign In
            </Button>
            <Button
              variant="amber"
              size="sm"
              onClick={handleTryDemo}
              className="shadow-amber-500/20"
            >
              Launch Demo →
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero Section with Ambient Glow ──────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Colorful Mesh Glow Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-teal-500/20 via-indigo-600/20 to-amber-500/15 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-500/10 blur-[90px] pointer-events-none rounded-full" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Top Pill Alert */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-800/90 border border-teal-500/30 text-teal-300 text-xs sm:text-sm font-medium mb-6 shadow-sm hover:border-teal-400/50 transition-colors">
            <Sparkles size={15} className="text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>AI-Assisted Observation Organizer • Non-Diagnostic Safety First</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.12] mb-6 text-white max-w-4xl mx-auto">
            Organize Care Observations.{' '}
            <span className="block gradient-text mt-1">
              Spot What's Different From Usual.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-navy-200 mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
            Capture daily voice or text observations in seconds. BaselineBeacon highlights changes
            against your loved one's saved baseline — giving doctors clear, structured handoffs without medical guesswork.
          </p>

          {/* Dual Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              variant="amber"
              size="lg"
              onClick={handleTryDemo}
              className="w-full sm:w-auto text-base font-bold shadow-lg shadow-amber-500/25 group"
            >
              <span>⚡ Try Live Demo — No Account Needed</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto bg-navy-800/80 text-white border-navy-700 hover:bg-navy-700 hover:border-navy-600 text-base font-semibold"
            >
              Create Free Account
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-navy-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-teal-400" />
              <span>Caregiver-Reported Only</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Explicit Review Before Save</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity size={16} className="text-amber-400" />
              <span>Clear Healthcare Handoffs</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Live Preview Sandbox ─────────────────────────────── */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 -mt-6 mb-20 z-10 w-full">
        <div className="glass-navy border border-teal-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-navy-950/80 backdrop-blur-xl">
          {/* Header of Sandbox */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Interactive Caregiver Preview
                </h3>
              </div>
              <p className="text-xs text-navy-300 mt-1">
                Select a real-world scenario to see how BaselineBeacon structures and compares notes in real time.
              </p>
            </div>

            {/* Scenario Tabs */}
            <div className="flex items-center gap-1.5 bg-navy-900/90 p-1.5 rounded-xl border border-navy-800 self-start sm:self-auto overflow-x-auto max-w-full">
              {SAMPLE_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => setActiveScenario(sc)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    activeScenario.id === sc.id
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm'
                      : 'text-navy-300 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  <span>{sc.icon}</span>
                  <span>{sc.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sandbox Body: Note & Extraction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {/* Left: Raw Voice / Text Capture */}
            <div className="bg-navy-900/70 border border-navy-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                    <Mic size={14} className="text-teal-400" />
                    Caregiver Voice / Text Note
                  </span>
                  <Badge variant="navy" className="text-[10px] bg-navy-800 border-navy-700">
                    Raw Input
                  </Badge>
                </div>
                <div className="p-3.5 rounded-xl bg-navy-950/60 border border-navy-800/80 text-sm text-slate-200 italic leading-relaxed">
                  {activeScenario.rawNote}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-navy-800 flex items-center justify-between text-xs text-navy-300">
                <span>Recorded: 1:45 PM Today</span>
                <span className="text-teal-400 font-medium">✨ Structured by AI</span>
              </div>
            </div>

            {/* Right: Structured Extraction & Baseline Delta */}
            <div className="bg-gradient-to-br from-navy-900/90 to-navy-850 border border-teal-500/25 rounded-2xl p-5 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Activity size={14} className="text-amber-400" />
                  Baseline Delta Analysis
                </span>
                <Badge variant="noteworthy" className="text-[10px]">
                  Changed From Usual
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="bg-navy-950/70 border border-navy-800 rounded-xl p-3">
                  <div className="text-[11px] font-medium text-navy-400 uppercase">Extracted Observation</div>
                  <div className="text-sm font-bold text-white mt-0.5">{activeScenario.extractedField}: {activeScenario.observedValue}</div>
                </div>

                <div className="bg-navy-950/70 border border-navy-800 rounded-xl p-3">
                  <div className="text-[11px] font-medium text-navy-400 uppercase">Saved Baseline Usual</div>
                  <div className="text-sm text-navy-200 mt-0.5">{activeScenario.baselineValue}</div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span>{activeScenario.delta}</span>
                    <p className="text-[11px] text-amber-300/80 font-normal mt-0.5">
                      Flagged for your next doctor or nursing conversation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sandbox Footer CTA */}
          <div className="mt-6 pt-5 border-t border-navy-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-navy-300 text-center sm:text-left">
              Want to see this live with sample patient Ravi Kumar?
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={handleTryDemo}
              className="w-full sm:w-auto"
            >
              Explore Full Dashboard →
            </Button>
          </div>
        </div>
      </section>

      {/* ── 4 Colorful Value Cards ───────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 bg-navy-900 border-t border-navy-800" aria-labelledby="benefits-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 id="benefits-heading" className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Engineered for Busy Caregivers
            </h2>
            <p className="text-navy-300 text-base mt-3 leading-relaxed">
              Family caregiving is exhausting and unpredictable. BaselineBeacon transforms messy mental notes into clear, objective health records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {KEY_BENEFITS.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="card-interactive bg-navy-800/60 border border-navy-700/80 rounded-2xl p-6 flex flex-col justify-between hover:border-teal-400/40 hover:bg-navy-800 transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md`}>
                        <Icon size={24} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-navy-700 text-teal-300 border border-navy-600">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-navy-300 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-navy-700/60 flex items-center text-xs text-teal-300 font-semibold gap-1">
                    <span>Feature 0{idx + 1}</span>
                    <span className="text-navy-500">•</span>
                    <span className="text-navy-400">Included</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Before & After Comparison Section ────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 bg-navy-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="indigo" className="mb-3">
              Real Caregiver Impact
            </Badge>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Before vs After BaselineBeacon
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* The Old Way */}
            <div className="bg-navy-900/60 border border-rose-500/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500/60" />
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-4">
                <span>❌ The Old Way: Mental Stress</span>
              </div>
              <ul className="space-y-3 text-sm text-navy-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                  <span>Scattered sticky notes and forgotten daily details.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                  <span>Saying "I think he seemed more tired last week" with zero objective timeline.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                  <span>Rushed 15-minute doctor appointments where critical observations get omitted.</span>
                </li>
              </ul>
            </div>

            {/* The BaselineBeacon Way */}
            <div className="bg-navy-900/60 border border-teal-500/30 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-teal-950/40">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-cyan-400" />
              <div className="flex items-center gap-2 text-teal-300 font-bold text-sm mb-4">
                <span>✅ With BaselineBeacon</span>
              </div>
              <ul className="space-y-3 text-sm text-navy-200">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-teal-400 shrink-0 mt-0.5" />
                  <span>30-second voice memos instantly structured by category.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-teal-400 shrink-0 mt-0.5" />
                  <span>Objective metric deltas: "Meal intake dropped to 25% for 3 consecutive days."</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-teal-400 shrink-0 mt-0.5" />
                  <span>1-click clinical PDF handoff ready to print or hand to your doctor.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ready to Start Banner ────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-navy-900 to-navy-950 border-t border-navy-800 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="text-4xl mb-4">🔦</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Start Organizing Care Today
          </h2>
          <p className="text-navy-300 text-base mb-8 max-w-xl mx-auto">
            Experience the interactive demo with preloaded data for Ravi Kumar, or create your private account.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="amber"
              size="lg"
              onClick={handleTryDemo}
              className="text-base font-bold shadow-lg shadow-amber-500/25"
            >
              Try Interactive Demo
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-navy-800 text-white border-navy-700 hover:bg-navy-700"
            >
              Sign In / Register
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer with Clinical Disclaimer ──────────────────────────────── */}
      <footer className="bg-navy-950 border-t border-navy-900 py-10 px-4 sm:px-6 mt-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <Disclaimer />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-navy-400 pt-4 border-t border-navy-900">
            <span>© {new Date().getFullYear()} BaselineBeacon. All rights reserved.</span>
            <span>Caregiver-Reported Observations • Non-Diagnostic Companion</span>
          </div>
        </div>
      </footer>
    </div>
  )
}