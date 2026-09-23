import { useDemoStore } from '@/store/demoStore'
import { Outlet } from 'react-router-dom'
import { DisclaimerBanner } from '@/components/shared/DisclaimerBanner'

export default function DemoPage() {
  const { isDemo, careRecipient, baseline, observations, enableDemo, disableDemo } = useDemoStore()

  // If not in demo, redirect or show empty state
  if (!isDemo) {
    return (
      <section className="p-4">
        <h2 className="text-navy-700 mb-4">Demo Not Active</h2>
        <p className="text-text-secondary">
          Switch to demo mode from the landing page.
        </p>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-gray-50">
      <DisclaimerBanner />
      <div className="max-w-3xl mx-auto p-4">
        <h2 className="text-2xl font-semibold text-navy-700 mb-6">
          Demo: {careRecipient?.name}
        </h2>

        {/* Summary of loaded demo data */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-8">
          <h3 className="text-navy-700 font-medium mb-4">Care Recipient</h3>
          <p className="text-text-secondary">
            {careRecipient?.relationship} — {careRecipient?.dateOfBirth}
          </p>

          <h4 className="text-navy-700 font-medium mt-6 mb-4">Baseline ({baseline?.length} entries)</h4>
          <ul className="list-disc pl-5 text-text-secondary space-y-1">
            {baseline?.map((entry) => (
              <li key={entry.id}>
                {entry.category}: {entry.field} — {entry.value}{entry.unit || ''}
              </li>
            ))}
          </ul>

          <h4 className="text-navy-700 font-medium mt-6 mb-4">Observations ({observations?.length})</h4>
          <ul className="list-disc pl-5 text-text-secondary space-y-1">
            {observations?.map((obs) => (
              <li key={obs.id}>
                <p className="font-medium">{obs.rawText.slice(0, 60)}{'...'}</p>
                <p className="text-xs text-text-muted">
                  {obs.observedAt ? new Date(obs.observedAt).toLocaleDateString() : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => {
            disableDemo()
            // In a real app, this might navigate to /dashboard or /observe
            alert('Demo mode disabled. Return to landing page.')
          }}
          className="inline-block bg-navy-700 text-white font-medium rounded-lg px-6 py-3 shadow-hover hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-opacity-75 transition-colors"
        >
          Return to Landing
        </button>
      </div>
    </section>
  )
}