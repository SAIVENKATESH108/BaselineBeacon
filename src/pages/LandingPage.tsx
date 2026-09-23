import { Link, Outlet } from 'react-router-dom'
import { useDemoStore } from '@/store/demoStore'
import { DisclaimerBanner } from '@/components/shared/DisclaimerBanner'

export default function LandingPage() {
  const { isDemo, enableDemo, disableDemo } = useDemoStore()

  // If demo is not enabled and user clicks CTA, enable it
  const handleStartDemo = () => {
    enableDemo()
  }

  return (
    <section className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full text-center px-4">
        <h1 className="text-4xl font-semibold text-navy-900 mb-6">
          BaselineBeacon
        </h1>

        <p className="text-xl text-text-secondary mb-8">
          Organize caregiver observations. Compare to a personal baseline. Share
          non-diagnostic summaries.
        </p>

        {/* Demo CTA */}
        <button
          onClick={handleStartDemo}
          className="inline-block bg-amber-500 text-navy-900 font-medium rounded-lg px-8 py-3 shadow-md hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-opacity-75 transition-colors"
        >
          {isDemo ? 'You are in Demo Mode' : 'Start in Demo Mode'}
        </button>

        {/* Learn more link */}
        <p className="mt-8 text-sm text-text-muted">
          {'Organizes caregiver observations. Does not diagnose or replace professional medical advice.'}
        </p>
      </div>
    </section>
  )
}