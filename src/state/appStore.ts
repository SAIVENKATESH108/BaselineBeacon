// src/state/appStore.ts
// Zustand store — client-only UI state only.
// Server-derived data (fetched from API) MUST go through TanStack Query, not here.

import { create } from 'zustand'
import { AppMode, ObservationCategory, Comparison } from '@/domain/models'
import type { CareRecipient, Baseline } from '@/domain/models'

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

// ─── Store shape ──────────────────────────────────────────────────────────────
interface AppState {
  mode: AppMode
  selectedRecipient: CareRecipient | null
  selectedBaseline: Baseline | null
  draftObservation: DraftObservation | null
  providerStatus: Record<string, 'reachable' | 'degraded' | 'down'>

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
}

export const useAppStore = create<AppState>((set, get) => ({
  mode: AppMode.Demo,
  selectedRecipient: null,
  selectedBaseline: null,
  draftObservation: null,
  providerStatus: { gemini: 'reachable', mock: 'reachable' },

  setMode: (mode) => set({ mode }),

  enableDemoMode: () => {
    // Build a plain-object CareRecipient-like for the store
    // (domain classes aren't needed in store — just the shape)
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
}))
