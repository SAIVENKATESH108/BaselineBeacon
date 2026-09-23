/* routes.tsx — BaselineBeacon client-side routes only.
   Used by src/main.ts <Router routes={routes} />.
   No server routing, no auth middleware.
*/

import type { RouteObject } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import DemoPage from '@/pages/DemoPage'
import BaselineSetup from '@/pages/BaselineSetup'
import Dashboard from '@/pages/Dashboard'
import ObservePage from '@/pages/ObservePage'
import ReviewPage from '@/pages/ReviewPage'
import TimelinePage from '@/pages/TimelinePage'
import ReportPage from '@/pages/ReportPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/demo',
    element: <DemoPage />,
  },
  {
    path: '/baseline',
    element: <BaselineSetup />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/observe',
    element: <ObservePage />,
  },
  {
    path: '/review',
    element: <ReviewPage />,
  },
  {
    path: '/timeline',
    element: <TimelinePage />,
  },
  {
    path: '/report',
    element: <ReportPage />,
  },
]