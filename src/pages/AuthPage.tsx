// src/pages/AuthPage.tsx — Cohesive, Colorful & Animated Auth Page
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sparkles, ArrowRight, ShieldCheck, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Disclaimer } from '@/components/common/Disclaimer'
import { useAppStore } from '@/state/appStore'
import { supabase } from '@/lib/supabase'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type FormValues = z.infer<typeof schema>

export function AuthPage() {
  const navigate = useNavigate()
  const { enableDemoMode } = useAppStore()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const handleTryDemo = () => {
    enableDemoMode()
    navigate('/dashboard')
  }

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp(data)
        if (error) throw error
        toast.success('Account created! Check your email to confirm.')
      } else {
        const { error } = await supabase.auth.signInWithPassword(data)
        if (error) throw error
        navigate('/dashboard')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* Background Aurora Mesh Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-br from-teal-500/20 via-indigo-600/20 to-amber-500/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md animate-slide-up relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-3 font-extrabold text-2xl tracking-tight text-white hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <span className="text-xl">🔦</span>
            </div>
            <span>BaselineBeacon</span>
          </button>
          <p className="text-sm text-slate-400 mt-2">
            Caregiver Observation Organizer • Non-Diagnostic Companion
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="bg-navy-900/80 border border-slate-800/90 rounded-3xl shadow-2xl p-7 sm:p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white tracking-wide">
              {isSignUp ? 'Create Caregiver Account' : 'Caregiver Sign In'}
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 font-semibold">
              Secure
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="caregiver@example.com"
              autoComplete="email"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              {...register('password')}
              error={errors.password?.message}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full font-bold shadow-lg shadow-teal-500/25 mt-2"
            >
              {isSignUp ? 'Create Free Account' : 'Sign In'}
            </Button>
          </form>

          {/* Toggle between Sign In / Sign Up */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold hover:underline"
            >
              {isSignUp ? 'Already registered? Sign in instead' : "Don't have an account? Sign up here"}
            </button>
          </div>

          <div className="my-6 border-t border-slate-800 relative">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-navy-900 px-3 text-xs text-slate-500 uppercase font-semibold">
              or
            </span>
          </div>

          {/* Demo Button */}
          <Button
            variant="amber"
            size="lg"
            onClick={handleTryDemo}
            className="w-full font-bold shadow-lg shadow-amber-500/25"
          >
            <span>⚡ Launch Demo Mode (Instant Access)</span>
          </Button>
        </div>

        <div className="mt-6">
          <Disclaimer compact />
        </div>
      </div>
    </div>
  )
}
