// src/pages/AuthPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Disclaimer } from '@/components/common/Disclaimer'
import { useAppStore } from '@/state/appStore'
import { supabase } from '@/lib/supabase'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'At least 8 characters required'),
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
    <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🔦</div>
          <h1 className="text-2xl font-bold text-navy-900">BaselineBeacon</h1>
          <p className="text-sm text-gray-500 mt-1">Caregiver observation organizer</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-medium p-8">
          <h2 className="text-xl font-semibold text-navy-900 mb-6">
            {isSignUp ? 'Create your account' : 'Sign in'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              {...register('password')}
              error={errors.password?.message}
            />
            <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full mt-2">
              {isSignUp ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-teal-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
            </button>
          </div>

          <div className="my-6 border-t border-cream-200 relative">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-3 text-xs text-gray-400">
              or
            </span>
          </div>

          <Button variant="amber" size="lg" onClick={handleTryDemo} className="w-full">
            Try Demo Mode — No Account Needed
          </Button>
        </div>

        <div className="mt-6">
          <Disclaimer compact />
        </div>
      </div>
    </div>
  )
}
