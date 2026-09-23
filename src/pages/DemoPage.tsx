// src/pages/DemoPage.tsx — stub, redirect to dashboard in demo mode
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/state/appStore'

export default function DemoPage() {
  const navigate = useNavigate()
  const { enableDemoMode } = useAppStore()

  useEffect(() => {
    enableDemoMode()
    navigate('/dashboard', { replace: true })
  }, [enableDemoMode, navigate])

  return null
}