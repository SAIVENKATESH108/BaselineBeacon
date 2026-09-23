// src/state/appStore.ts
// Zustand store — client-only UI state only.
// Server-derived data (fetched from API) MUST go through TanStack Query, not here.

import { create } from 'zustand'
import { AppMode, ObservationCategory, Comparison } from '@/domain/models'
import type { CareRecipient, Baseline } from '@/domain/models'
import type { BaselineEntry, Observation } from '@/types'
import { RAVI_OBSERVATIONS, RAVI_BASELINE } from '@/data/demoData'
import { supabase } from '@/lib/supabase'

// ─── Draft observation (being reviewed before save) ───────────────────────────
export interface DraftObservationField {
  id: string
  category: ObservationCategory
  metricKey: string
  valueText: string | null
  valueNumber: number | null
  comparisonToBaseline: Comparison
  sourceQuote: string
  caregiverConfirmed: boolean
}

export interface DraftObservation {
  entryId: string
  transcript: string
  source: 'voice' | 'text'
  extractedFields: DraftObservationField[]
}

// ─── Storage helpers ──────────────────────────────────────────────────────────
const STORAGE_KEY_OBS = 'baselinebeacon_obs_v1'
const STORAGE_KEY_BASE = 'baselinebeacon_base_v1'

function loadSavedObservations(): Observation[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_OBS)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // fallback
  }
  return [...RAVI_OBSERVATIONS]
}

function loadSavedBaseline(): BaselineEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BASE)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // fallback
  }
  return [...RAVI_BASELINE]
}

// ─── Store shape ──────────────────────────────────────────────────────────────
interface AppState {
  mode: AppMode
  selectedRecipient: CareRecipient | null
  selectedBaseline: Baseline | null
  draftObservation: DraftObservation | null
  providerStatus: Record<string, 'reachable' | 'degraded' | 'down'>

  // Dynamic Fullstack Data
  observations: Observation[]
  baselineEntries: BaselineEntry[]

  // Actions
  setMode: (mode: AppMode) => void
  enableDemoMode: () => void
  disableDemoMode: () => void
  setSelectedRecipient: (r: CareRecipient | null) => void
  setSelectedBaseline: (b: Baseline | null) => void
  setDraftObservation: (d: DraftObservation | null) => void
  updateDraftField: (fieldId: string, updates: Partial<DraftObservationField>) => void
  removeDraftField: (fieldId: string) => void
  setProviderStatus: (status: Record<string, 'reachable' | 'degraded' | 'down'>) => void

  // Dynamic data mutations
  addObservation: (obs: Observation) => Promise<void>
  deleteObservation: (id: string) => void
  updateBaselineEntries: (entries: BaselineEntry[]) => void
  resetToDemo: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  mode: AppMode.Demo,
  selectedRecipient: {
    id: 'rav-kumar-001',
    createdAt: new Date('2025-01-01'),
    name: 'Ravi Kumar',
    ageRange: '70-79',
    relationship: 'Grandfather',
  } as unknown as CareRecipient,
  selectedBaseline: null,
  draftObservation: null,
  providerStatus: { gemini: 'reachable', mock: 'reachable' },

  observations: loadSavedObservations(),
  baselineEntries: loadSavedBaseline(),

  setMode: (mode) => set({ mode }),

  enableDemoMode: () => {
    const recipient: CareRecipient = {
      id: 'rav-kumar-001',
      createdAt: new Date('2025-01-01'),
      name: 'Ravi Kumar',
      ageRange: '70-79',
      relationship: 'Grandfather',
    } as unknown as CareRecipient

    set({
      mode: AppMode.Demo,
      selectedRecipient: recipient,
    })
  },

  disableDemoMode: () => set({
    mode: AppMode.Ai,
    selectedRecipient: null,
    selectedBaseline: null,
  }),

  setSelectedRecipient: (r) => set({ selectedRecipient: r }),
  setSelectedBaseline: (b) => set({ selectedBaseline: b }),
  setDraftObservation: (d) => set({ draftObservation: d }),

  updateDraftField: (fieldId, updates) => {
    const { draftObservation } = get()
    if (!draftObservation) return
    set({
      draftObservation: {
        ...draftObservation,
        extractedFields: draftObservation.extractedFields.map((f) =>
          f.id === fieldId ? { ...f, ...updates } : f,
        ),
      },
    })
  },

  removeDraftField: (fieldId) => {
    const { draftObservation } = get()
    if (!draftObservation) return
    set({
      draftObservation: {
        ...draftObservation,
        extractedFields: draftObservation.extractedFields.filter((f) => f.id !== fieldId),
      },
    })
  },

  setProviderStatus: (status) => set({ providerStatus: status }),

  addObservation: async (newObs: Observation) => {
    const { observations } = get()
    const updated = [newObs, ...observations]
    set({ observations: updated })

    try {
      localStorage.setItem(STORAGE_KEY_OBS, JSON.stringify(updated))
    } catch {
      // localStorage failed
    }

    try {
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        await supabase.from('observation_entries').insert({
          id: newObs.id,
          care_recipient_id: newObs.careRecipientId,
          caregiver_id: newObs.caregiverId,
          raw_text: newObs.rawText,
          voice_transcript: newObs.voiceTranscript,
          severity: newObs.severity,
          observed_at: newObs.observedAt,
        })
      }
    } catch (err) {
      console.warn('[BaselineBeacon] Supabase offline/demo mode:', err)
    }
  },

  deleteObservation: (id: string) => {
    const { observations } = get()
    const updated = observations.filter((o) => o.id !== id)
    set({ observations: updated })
    try {
      localStorage.setItem(STORAGE_KEY_OBS, JSON.stringify(updated))
    } catch {
      // ignore
    }
  },

  updateBaselineEntries: (entries: BaselineEntry[]) => {
    set({ baselineEntries: entries })
    try {
      localStorage.setItem(STORAGE_KEY_BASE, JSON.stringify(entries))
    } catch {
      // ignore
    }
  },

  resetToDemo: () => {
    try {
      localStorage.removeItem(STORAGE_KEY_OBS)
      localStorage.removeItem(STORAGE_KEY_BASE)
    } catch {
      // ignore
    }
    set({
      observations: [...RAVI_OBSERVATIONS],
      baselineEntries: [...RAVI_BASELINE],
    })
  },
}))
