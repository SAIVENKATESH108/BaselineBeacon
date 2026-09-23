// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[BaselineBeacon] Supabase env vars not set. Running in demo-only mode.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

// ─── Typed DB helpers ─────────────────────────────────────────────────────────

export type DB = {
  care_recipients: {
    Row: {
      id: string
      user_id: string
      name: string
      date_of_birth: string | null
      relationship: string
      primary_conditions: string[] | null
      created_at: string
      updated_at: string
    }
    Insert: Omit<DB['care_recipients']['Row'], 'id' | 'created_at' | 'updated_at'>
    Update: Partial<DB['care_recipients']['Insert']>
  }
  baseline_entries: {
    Row: {
      id: string
      care_recipient_id: string
      category: string
      field: string
      value: string
      unit: string | null
      notes: string | null
      captured_at: string
      updated_at: string
    }
    Insert: Omit<DB['baseline_entries']['Row'], 'id' | 'captured_at' | 'updated_at'>
    Update: Partial<DB['baseline_entries']['Insert']>
  }
  observations: {
    Row: {
      id: string
      care_recipient_id: string
      caregiver_id: string
      raw_text: string
      voice_transcript: string | null
      extracted_fields: unknown
      severity: string | null
      observed_at: string
      created_at: string
      is_demo: boolean
    }
    Insert: Omit<DB['observations']['Row'], 'id' | 'created_at'>
    Update: Partial<DB['observations']['Insert']>
  }
  reports: {
    Row: {
      id: string
      care_recipient_id: string
      generated_by: string
      date_range_start: string
      date_range_end: string
      observation_ids: string[]
      baseline_snapshot: unknown
      summary_markdown: string | null
      share_token: string | null
      share_expires_at: string | null
      created_at: string
    }
    Insert: Omit<DB['reports']['Row'], 'id' | 'created_at'>
    Update: Partial<DB['reports']['Insert']>
  }
}
