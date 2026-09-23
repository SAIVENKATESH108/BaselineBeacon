// src/store/demoStore.ts
import { create } from 'zustand'
import type { CareRecipient, BaselineEntry, Observation, DemoState } from '@/types'

// ── Fictional demo data (no real person) ─────────────────────────────────────

const DEMO_RECIPIENT: CareRecipient = {
  id: 'demo-recipient-001',
  userId: 'demo-user-001',
  name: 'Margaret Chen',
  dateOfBirth: '1942-04-15',
  relationship: 'Mother',
  primaryConditions: ['Osteoarthritis', 'Hypertension'],
  createdAt: '2024-01-10T08:00:00Z',
  updatedAt: '2024-01-10T08:00:00Z',
}

const now = new Date()
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString()

const DEMO_BASELINE: BaselineEntry[] = [
  { id: 'bl-001', careRecipientId: 'demo-recipient-001', category: 'sleep', field: 'typical_sleep_hours', value: '7', unit: 'hours', capturedAt: daysAgo(30), updatedAt: daysAgo(30) },
  { id: 'bl-002', careRecipientId: 'demo-recipient-001', category: 'sleep', field: 'sleep_quality', value: 'Generally restful, wakes once', capturedAt: daysAgo(30), updatedAt: daysAgo(30) },
  { id: 'bl-003', careRecipientId: 'demo-recipient-001', category: 'appetite', field: 'appetite_level', value: 'Good — eats most meals fully', capturedAt: daysAgo(30), updatedAt: daysAgo(30) },
  { id: 'bl-004', careRecipientId: 'demo-recipient-001', category: 'mood', field: 'typical_mood', value: 'Cheerful and engaged', capturedAt: daysAgo(30), updatedAt: daysAgo(30) },
  { id: 'bl-005', careRecipientId: 'demo-recipient-001', category: 'mobility', field: 'mobility_aids', value: 'Walking stick indoors', capturedAt: daysAgo(30), updatedAt: daysAgo(30) },
  { id: 'bl-006', careRecipientId: 'demo-recipient-001', category: 'hydration', field: 'typical_fluid_intake', value: '6', unit: 'cups/day', capturedAt: daysAgo(30), updatedAt: daysAgo(30) },
  { id: 'bl-007', careRecipientId: 'demo-recipient-001', category: 'pain', field: 'typical_pain_level', value: '2–3 out of 10, mainly knees', capturedAt: daysAgo(30), updatedAt: daysAgo(30) },
  { id: 'bl-008', careRecipientId: 'demo-recipient-001', category: 'medication', field: 'current_medications', value: 'Amlodipine 5mg morning, Naproxen as needed', capturedAt: daysAgo(30), updatedAt: daysAgo(30) },
]

const DEMO_OBSERVATIONS: Observation[] = [
  {
    id: 'obs-001',
    careRecipientId: 'demo-recipient-001',
    caregiverId: 'demo-user-001',
    rawText: 'Mom seemed tired today — said she only slept about 4 hours. Ate breakfast but only half her lunch. Mood was quiet but not distressed. Took her morning medication without prompting.',
    extractedFields: [
      { category: 'sleep', field: 'sleep_duration', value: '4', unit: 'hours', caregiverConfirmed: true, differentFromBaseline: true, notes: 'Usually sleeps 7 hours' },
      { category: 'appetite', field: 'lunch_intake', value: 'Half portion', caregiverConfirmed: true, differentFromBaseline: true },
      { category: 'mood', field: 'mood_observation', value: 'Quiet, not distressed', caregiverConfirmed: true, differentFromBaseline: true },
      { category: 'medication', field: 'morning_medication', value: 'Taken without prompting', caregiverConfirmed: true, differentFromBaseline: false },
    ],
    severity: 'noteworthy',
    observedAt: daysAgo(1),
    createdAt: daysAgo(1),
    isDemo: true,
  },
  {
    id: 'obs-002',
    careRecipientId: 'demo-recipient-001',
    caregiverId: 'demo-user-001',
    rawText: 'Good day overall. Mom ate all three meals and drank about 7 cups of water. She was cheerful and chatted about her garden. Walked to the mailbox with her stick — no difficulty noted.',
    extractedFields: [
      { category: 'appetite', field: 'meal_completion', value: 'All three meals eaten', caregiverConfirmed: true, differentFromBaseline: false },
      { category: 'hydration', field: 'fluid_intake', value: '7', unit: 'cups', caregiverConfirmed: true, differentFromBaseline: false },
      { category: 'mood', field: 'mood_observation', value: 'Cheerful, engaged', caregiverConfirmed: true, differentFromBaseline: false },
      { category: 'mobility', field: 'outdoor_walk', value: 'Walked to mailbox with stick, no difficulty', caregiverConfirmed: true, differentFromBaseline: false },
    ],
    severity: 'routine',
    observedAt: daysAgo(3),
    createdAt: daysAgo(3),
    isDemo: true,
  },
  {
    id: 'obs-003',
    careRecipientId: 'demo-recipient-001',
    caregiverId: 'demo-user-001',
    rawText: 'Mom complained of more knee discomfort than usual today — rated it about 6 out of 10. She took a naproxen in the afternoon. Stayed mostly seated. Drank only 3 cups of fluids.',
    extractedFields: [
      { category: 'pain', field: 'knee_discomfort', value: '6 out of 10', caregiverConfirmed: true, differentFromBaseline: true, notes: 'Caregiver-reported; higher than usual 2–3/10' },
      { category: 'medication', field: 'naproxen_use', value: 'One dose afternoon', caregiverConfirmed: true, differentFromBaseline: false },
      { category: 'mobility', field: 'activity_level', value: 'Mostly seated', caregiverConfirmed: true, differentFromBaseline: true },
      { category: 'hydration', field: 'fluid_intake', value: '3', unit: 'cups', caregiverConfirmed: true, differentFromBaseline: true },
    ],
    severity: 'noteworthy',
    observedAt: daysAgo(5),
    createdAt: daysAgo(5),
    isDemo: true,
  },
  {
    id: 'obs-004',
    careRecipientId: 'demo-recipient-001',
    caregiverId: 'demo-user-001',
    rawText: 'Normal day. Mom slept well — about 7 hours. Good appetite. She called her sister on the phone and seemed happy afterward. Pain was at usual level.',
    extractedFields: [
      { category: 'sleep', field: 'sleep_duration', value: '7', unit: 'hours', caregiverConfirmed: true, differentFromBaseline: false },
      { category: 'appetite', field: 'appetite_level', value: 'Good', caregiverConfirmed: true, differentFromBaseline: false },
      { category: 'social', field: 'social_interaction', value: 'Phone call with sister, appeared happy', caregiverConfirmed: true, differentFromBaseline: false },
      { category: 'pain', field: 'pain_level', value: 'Usual level', caregiverConfirmed: true, differentFromBaseline: false },
    ],
    severity: 'routine',
    observedAt: daysAgo(7),
    createdAt: daysAgo(7),
    isDemo: true,
  },
  {
    id: 'obs-005',
    careRecipientId: 'demo-recipient-001',
    caregiverId: 'demo-user-001',
    rawText: 'Difficult day. Mom was confused about what day it was this morning — this is different from her usual orientation. She also refused breakfast. I am flagging this as an incident for the doctor to review.',
    extractedFields: [
      { category: 'cognition', field: 'orientation', value: 'Caregiver-reported confusion about day of week this morning', caregiverConfirmed: true, differentFromBaseline: true, notes: 'Caregiver notes this is different from usual' },
      { category: 'appetite', field: 'breakfast', value: 'Refused', caregiverConfirmed: true, differentFromBaseline: true },
    ],
    severity: 'incident',
    observedAt: daysAgo(10),
    createdAt: daysAgo(10),
    isDemo: true,
  },
]

// ── Store ─────────────────────────────────────────────────────────────────────

interface DemoStore extends DemoState {
  enableDemo: () => void
  disableDemo: () => void
  addObservation: (obs: Observation) => void
  updateObservation: (id: string, updates: Partial<Observation>) => void
  updateBaseline: (entries: BaselineEntry[]) => void
}

export const useDemoStore = create<DemoStore>((set) => ({
  isDemo: false,
  careRecipient: DEMO_RECIPIENT,
  baseline: DEMO_BASELINE,
  observations: DEMO_OBSERVATIONS,

  enableDemo: () => set({ isDemo: true }),
  disableDemo: () => set({ isDemo: false }),

  addObservation: (obs) =>
    set((state) => ({
      observations: [obs, ...state.observations],
    })),

  updateObservation: (id, updates) =>
    set((state) => ({
      observations: state.observations.map((o) =>
        o.id === id ? { ...o, ...updates } : o
      ),
    })),

  updateBaseline: (entries) => set({ baseline: entries }),
}))
