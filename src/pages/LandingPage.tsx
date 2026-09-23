// src/pages/LandingPage.tsx
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Disclaimer } from '@/components/common/Disclaimer'
import { useAppStore } from '@/state/appStore'
import { AppMode } from '@/domain/models'

const FEATURES = [
  { icon: '🎙️', title: 'Voice or text notes', desc: 'Capture what you observed quickly — by speaking or typing.' },
  { icon: '📋', title: 'Structured from the start', desc: 'AI organizes your note into caregiver-reported fields. You review and confirm everything.' },
  { icon: '📊', title: 'Compare to usual', desc: 'See what\'s different from the person\'s personal baseline over time.' },
  { icon: '📄', title: 'Ready for the appointment', desc: 'Generate a non-diagnostic summary to share with a doctor or nurse.' },
]

export function LandingPage() {
  const navigate = useNavigate()
  const { enableDemoMode } = useAppStore()

  const handleTryDemo = () => {
    enableDemoMode()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 text-white flex flex-col">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="animate-fade-in max-w-2xl">
          <div className="text-5xl mb-4">🔦</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            BaselineBeacon
          </h1>
          <p className="text-xl text-navy-200 mb-3 leading-relaxed">
            Organize your care observations.<br className="hidden md:block" /> See what's different from usual.
          </p>
          <p className="text-sm text-teal-300 mb-10">
            For family caregivers — not a medical device.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="amber"
              size="lg"
              onClick={handleTryDemo}
              aria-label="Try the demo — no account needed"
            >
              Try Demo — No Sign-In Needed
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-white/10 text-white border border-white/20 hover:bg-white/20"
            >
              Sign In / Create Account
            </Button>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="bg-navy-800 py-14 px-6" aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-center text-2xl font-semibold text-white mb-10">
          How it helps
        </h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-navy-700/60 border border-navy-600 rounded-2xl p-5 flex gap-4 hover:bg-navy-700 transition-colors"
            >
              <span className="text-3xl mt-0.5 shrink-0" aria-hidden="true">{f.icon}</span>
              <div>
                <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-sm text-navy-300 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer disclaimer */}
      <footer className="bg-navy-900 px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <Disclaimer />
        </div>
      </footer>
    </div>
  )
}