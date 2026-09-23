// src/App.tsx — Root app component with route definitions
import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { LandingPage } from '@/pages/LandingPage'
import { AuthPage } from '@/pages/AuthPage'
import { BaselineSetupPage } from '@/pages/BaselineSetupPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { AddObservationPage } from '@/pages/AddObservationPage'
import { AIReviewPage } from '@/pages/AIReviewPage'
import { TimelineInsightsPage } from '@/pages/TimelineInsightsPage'
import { ShareExportPage } from '@/pages/ShareExportPage'
import { useAppStore } from '@/state/appStore'

export function App() {
  const { enableDemoMode } = useAppStore()

  // Start in demo mode by default so app is immediately useful
  useEffect(() => {
    enableDemoMode()
  }, [enableDemoMode])

  return (
    <Routes>
      {/* Public routes — no shell */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* App routes — with shell */}
      <Route element={<AppShell />}>
        <Route path="/baseline" element={<BaselineSetupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/observe" element={<AddObservationPage />} />
        <Route path="/review" element={<AIReviewPage />} />
        <Route path="/timeline" element={<TimelineInsightsPage />} />
        <Route path="/report" element={<ShareExportPage />} />
      </Route>
    </Routes>
  )
}
