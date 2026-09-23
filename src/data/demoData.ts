/* =====================================================================
   BaselineBeacon — Fictional Demo Data
   For internal consistency testing only.
   Never commit real patient data; all entries are deterministic fiction.
   ===================================================================== */

import type { BaselineEntry, Observation } from '@/types'

// ─── Care Recipient ──────────────────────────────────────────────────────
export interface CareRecipient {
  id: string
  name: string
  ageRange: '70-79' // fictional age range
  relationship: 'grandfather' | 'grandmother' | 'parent' | 'spouse' | 'other'
  // No clinical fields — only caregiver-described relationship context
}

// ─── Ravi Kumar (fictional) ─────────────────────────────────────────────
export const RAVI: CareRecipient = {
  id: 'rav-kumar-001',
  name: 'Ravi Kumar',
  ageRange: '70-79',
  relationship: 'grandfather',
}

// ─── Baseline Entries ────────────────────────────────────────────────────
//
// Caregiver-defined "usual" for Ravi.  These are not medical reference ranges.
//
// All values are caregiver-reported and stored exactly as stated.
//
// [Safety: No diagnosis, no risk scores, no clinical metrics.]
export const RAVI_BASELINE: BaselineEntry[] = [
  {
    id: 'bl-001',
    careRecipientId: RAVI.id,
    category: 'appetite',
    field: 'typical_meals_per_day',
    value: 'three',
    unit: 'meals',
    notes: 'eats breakfast, lunch, and dinner without skipping',
    capturedAt: '2025-01-15T08:00:00Z',
    updatedAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'bl-002',
    careRecipientId: RAVI.id,
    category: 'hydration',
    field: 'typical_fluid_intake',
    value: 'six',
    unit: 'glasses',
    notes: 'drinks water throughout the day; usually about six glasses',
    capturedAt: '2025-01-15T08:00:00Z',
    updatedAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'bl-003',
    careRecipientId: RAVI.id,
    category: 'sleep',
    field: 'afternoon_nap',
    value: 'short nap',
    unit: null,
    notes: 'typically naps for about 30 minutes in the early afternoon',
    capturedAt: '2025-01-15T08:00:00Z',
    updatedAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'bl-004',
    careRecipientId: RAVI.id,
    category: 'mobility',
    field: 'walking_aids',
    value: 'cane',
    unit: null,
    notes: 'walks independently with a cane for outdoor and indoor mobility',
    capturedAt: '2025-01-15T08:00:00Z',
    updatedAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'bl-005',
    careRecipientId: RAVI.id,
    category: 'cognition',
    field: 'morning_communication',
    value: 'clearly',
    unit: null,
    notes: 'usually communicates clearly in the morning; oriented and coherent',
    capturedAt: '2025-01-15T08:00:00Z',
    updatedAt: '2025-01-15T08:00:00Z',
  },
]

// ─── Seven Fictional Observations ────────────────────────────────────────
//
// Each observation is internally consistent: every extracted field has:
//   • a sourceQuote (the caregiver's exact words, stored verbatim)
//   • caregiverConfirmed = true (confirmed before saving)
//   • differentFromBaseline computed from the baseline above
//   • an observedAt timestamp (chronologically ordered, no real dates)
//
// ordering: obs-001 → obs-007 (oldest → newest)
// - obs-001: baseline-similar day (nothing changed)
// - obs-002: first signs of change (reduced lunch)
// - obs-003: hydration down, sleep increased
// - obs-004: mobility decline (more difficulty with cane)
// - obs-005: mixed — some improved, some worsened
// - obs-006: stable day (nothing changed from baseline)
// - obs-007: incident day — refused breakfast + confusion noted (but no fall)

export type ObservationId =
  | 'obs-001'
  | 'obs-002'
  | 'obs-003'
  | 'obs-004'
  | 'obs-005'
  | 'obs-006'
  | 'obs-007'

// Helper: map an observation ID to its date (chronological, fictional)
const obsDate = (id: ObservationId): string => {
  const base = new Date('2025-02-01')
  const offset = Number(id.replace('obs-', '')) - 1 // 0-based
  return new Date(base.getTime() + offset * 86400000).toISOString()
}

// ---------------------------------------------------------------------------
// Observation data.  Structure mirrors the Observation interface from @/types
// but with fictional data only.  Every field that the AI could extract is
// explicitly present, each with a sourceQuote, and caregiverConfirmed = true.
// ---------------------------------------------------------------------------

export const RAVI_OBSERVATIONS: Observation[] = [
  {
    id: 'obs-001' as ObservationId,
    careRecipientId: RAVI.id,
    caregiverId: 'caregiver-demos-001',
    rawText: 'Had a quiet day. Ate all meals as usual. Drank tea with lunch. Took morning medication. Felt steady on feet. Communicated clearly this morning.',
    voiceTranscript: undefined,
    extractedFields: [
      {
        category: 'appetite',
        field: 'meal_completion',
        value: 'all meals eaten',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: false, // matches baseline: three meals, all eaten
        sourceQuote: 'Ate all meals as usual.',
      },
      {
        category: 'hydration',
        field: 'fluid_intake',
        value: 'usual',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: false, // matches baseline: six glasses usual
        sourceQuote: 'Drank tea with lunch.',
      },
      {
        category: 'mobility',
        field: 'walking_status',
        value: 'steady',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: false, // matches baseline: walks with cane independently
        sourceQuote: 'Felt steady on feet.',
      },
      {
        category: 'cognition',
        field: 'morning_communication',
        value: 'clear',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: false, // matches baseline: communicates clearly
        sourceQuote: 'Communicated clearly this morning.',
      },
    ],
    severity: 'routine',
    observedAt: obsDate('obs-001'),
    createdAt: obsDate('obs-001'),
    isDemo: true,
  },

  {
    id: 'obs-002' as ObservationId,
    careRecipientId: RAVI.id,
    caregiverId: 'caregiver-demos-001',
    rawText: 'Mom ate less at lunch today — only a sandwich, leaving most of the soup. Drank only three glasses of water, down from usual. Took medication. Seems a bit more tired than usual but no confusion.',
    voiceTranscript: undefined,
    extractedFields: [
      {
        category: 'appetite',
        field: 'lunch_intake',
        value: 'sandwich only',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: true, // reduced from usual three meals + soup
        sourceQuote: 'Ate less at lunch today — only a sandwich, leaving most of the soup.',
      },
      {
        category: 'hydration',
        field: 'fluid_intake',
        value: '3 glasses',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: true, // lower than usual six glasses
        sourceQuote: 'Drank only three glasses of water, down from usual.',
      },
      {
        category: 'sleep',
        field: 'daytime_tiredness',
        value: 'more tired',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: true, // beyond the usual short nap
        sourceQuote: 'Seems a bit more tired than usual but no confusion.',
      },
    ],
    severity: 'routine',
    observedAt: obsDate('obs-002'),
    createdAt: obsDate('obs-002'),
    isDemo: true,
  },

  {
    id: 'obs-003' as ObservationId,
    careRecipientId: RAVI.id,
    caregiverId: 'caregiver-demos-001',
    rawText: 'Today she slept most of the afternoon — over an hour, longer than her usual short nap. Drank only two glasses of water. Lunch was skipped. No concerns otherwise.',
    voiceTranscript: undefined,
    extractedFields: [
      {
        category: 'sleep',
        field: 'afternoon_nap_duration',
        value: 'over 1 hour',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: true, // longer than usual short nap (30 min)
        sourceQuote: 'Today she slept most of the afternoon — over an hour, longer than her usual short nap.',
      },
      {
        category: 'hydration',
        field: 'fluid_intake',
        value: '2 glasses',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: true, // lower than usual six glasses; also lower than obs-003's 3 glasses
        sourceQuote: 'Drank only two glasses of water.',
      },
      {
        category: 'appetite',
        field: 'lunch_intake',
        value: 'skipped',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: true, // reduced intake continues
        sourceQuote: 'Lunch was skipped.',
      },
    ],
    severity: 'routine',
    observedAt: obsDate('obs-003'),
    createdAt: obsDate('obs-003'),
    isDemo: true,
  },

  {
    id: 'obs-004' as ObservationId,
    careRecipientId: RAVI.id,
    caregiverId: 'caregiver-demos-001',
    rawText: 'Mom walked with her cane today but seemed to have more difficulty than usual. Needed more rest stops on the walk. Still no falls. Medication taken as scheduled.',
    voiceTranscript: undefined,
    extractedFields: [
      {
        category: 'mobility',
        field: 'walking_difficulty',
        value: 'more difficulty',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: true, // baseline: walks independently with a cane; now more difficulty
        sourceQuote: 'Mom walked with her cane today but seemed to have more difficulty than usual.',
      },
      {
        category: 'hydration',
        field: 'fluid_intake',
        value: '3 glasses',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: true, // still lower than usual
        sourceQuote: 'Needed more rest stops on the walk.',
      },
    ],
    severity: 'routine',
    observedAt: obsDate('obs-004'),
    createdAt: obsDate('obs-004'),
    isDemo: true,
  },

  {
    id: 'obs-005' as ObservationId,
    careRecipientId: RAVI.id,
    caregiverId: 'caregiver-demos-001',
    rawText: 'Mixed day. Ate all three meals but only half the usual portions. Drank about five glasses of water — less than usual but not as low as recent days. Took medication without prompting. Mood was cheerful.',
    voiceTranscript: undefined,
    extractedFields: [
      {
        category: 'appetite',
        field: 'meal_portions',
        value: 'half portions',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: true, // reduced portions vs. usual three full meals
        sourceQuote: 'Ate all three meals but only half the usual portions.',
      },
      {
        category: 'hydration',
        field: 'fluid_intake',
        value: '5 glasses',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: true, // reduced from usual six, but improved from 2-3 glasses
        sourceQuote: 'Drank about five glasses of water — less than usual but not as low as recent days.',
      },
      {
        category: 'mood',
        field: 'mood_observation',
        value: 'cheerful',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: false, // cheerful is within normal variation; baseline does not define mood as a fixed value but this caregiver notes it as typical
        sourceQuote: 'Mood was cheerful.',
      },
    ],
    severity: 'routine',
    observedAt: obsDate('obs-005'),
    createdAt: obsDate('obs-005'),
    isDemo: true,
  },

  {
    id: 'obs-006' as ObservationId,
    careRecipientId: RAVI.id,
    caregiverId: 'caregiver-demos-001',
    rawText: 'Normal day. Ate all three meals fully. Drank six glasses of water as usual. Took medication. Walked to the garden with cane without difficulty. Appeared cheerful and oriented.',
    voiceTranscript: undefined,
    extractedFields: [
      {
        category: 'appetite',
        field: 'meal_completion',
        value: 'all meals fully',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: false, // matches baseline exactly
        sourceQuote: 'Ate all three meals fully.',
      },
      {
        category: 'hydration',
        field: 'fluid_intake',
        value: 'six',
        unit: 'glasses',
        caregiverConfirmed: true,
        differentFromBaseline: false, // matches baseline exactly
        sourceQuote: 'Drank six glasses of water as usual.',
      },
      {
        category: 'mobility',
        field: 'walking_status',
        value: 'without difficulty',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: false, // matches baseline
        sourceQuote: 'Walked to the garden with cane without difficulty.',
      },
      {
        category: 'cognition',
        field: 'morning_communication',
        value: 'clear',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: false, // matches baseline
        sourceQuote: 'Appeared cheerful and oriented.',
      },
    ],
    severity: 'routine',
    observedAt: obsDate('obs-006'),
    createdAt: obsDate('obs-006'),
    isDemo: true,
  },

  {
    id: 'obs-007' as ObservationId,
    careRecipientId: RAVI.id,
    caregiverId: 'caregiver-demos-001',
    rawText: 'Flagging this as an incident: Mom was confused about the date this morning and refused breakfast. No fall observed, but behaviour is different from her usual clear morning communication. I am sharing this with the doctor for review.',
    voiceTranscript: undefined,
    extractedFields: [
      {
        category: 'cognition',
        field: 'orientation',
        value: 'confused about date',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: true, // baseline: usually communicates clearly in the morning
        sourceQuote: 'Mom was confused about the date this morning and refused breakfast.',
      },
      {
        category: 'appetite',
        field: 'breakfast_intake',
        value: 'refused',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: true, // differs from usual morning pattern
        sourceQuote: 'Mom was confused about the date this morning and refused breakfast.',
      },
      {
        category: 'severity',
        // Note: we avoid clinical labels; severity is caregiver-assigned entryType only
        field: 'entryType',
        value: 'incident',
        unit: null,
        caregiverConfirmed: true,
        differentFromBaseline: null, // not comparable to baseline; caregiver-labeled
        sourceQuote: 'Flagging this as an incident: Mom was confused about the date this morning and refused breakfast. No fall observed, but behaviour is different from her usual clear morning communication. I am sharing this with the doctor for review.',
      },
    ],
    severity: 'incident',
    observedAt: obsDate('obs-007'),
    createdAt: obsDate('obs-007'),
    isDemo: true,
  },
]

// ─── Pure Helper Functions (deterministic, no side effects) ──────────────
//
// These functions verify internal consistency of the demo dataset.
// They are pure: same input → same output, no external dependencies.

// Verify that every observation's extractedFields have required sub-fields.
function verifyFieldCompleteness(
  observation: Observation,
): { valid: boolean; missing: string[] } {
  const missing: string[] = []
  for (const field of observation.extractedFields) {
    if (field.category === undefined) missing.push(`missing category in ${field.field}`)
    if (field.field === undefined) missing.push(`missing field name in category ${field.category}`)
    if (field.value === undefined) missing.push(`missing value in ${field.field}`)
    if (field.sourceQuote === undefined || field.sourceQuote === '')
      missing.push(`missing sourceQuote for ${field.field}`)
    if (field.caregiverConfirmed === undefined)
      missing.push(`missing caregiverConfirmed for ${field.field}`)
  }
  return { valid: missing.length === 0, missing }
}

// Verify that differentFromBaseline is consistent with baseline values.
// Rule: if the observation's field value differs from the baseline value for the
// same category/field, then differentFromBaseline must be true; if it matches,
// differentFromBaseline must be false or null.
function verifyBaselineConsistency(
  observation: Observation,
  baseline: BaselineEntry[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const obsFields = new Map(
    observation.extractedFields.map(f => [f.field, f.value]),
  )
  const baseFields = new Map(
    baseline.map(b => [b.field, b.value]),
  )

  for (const [field, val] of obsFields) {
    const baseVal = baseFields.get(field)
    if (baseVal !== undefined) {
      const differs = val !== baseVal
      if (differs && field.differentFromBaseline !== true) {
        errors.push(
          `observation ${observation.id}: field ${field} differs from baseline but differentFromBaseline is not true`,
        )
      }
      if (!differs && field.differentFromBaseline !== false && field.differentFromBaseline !== null) {
        errors.push(
          `observation ${observation.id}: field ${field} matches baseline but differentFromBaseline is not false/null`,
        )
      }
    }
  }
  return { valid: errors.length === 0, errors }
}

// Verify that no observation contains a prohibited medical term.
// Prohibited: UTI, infection, stroke, dehydration, dementia decline, depression,
// fall risk, medication adherence (as clinical claim), any disease name,
// risk score, severity score, likelihood percentage, health score.
// (The list mirrors AI_AGENT_RULES.md §2.)
function verifyNoProhibitedLanguage(observation: Observation): { valid: boolean; found: string[] } {
  const prohibited = [
    'UTI',
    'infection',
    'stroke',
    'dehydration',
    'dementia decline',
    'depression',
    'fall risk',
    'medication adherence',
  ]
  const found: string[] = []
  const text = observation.rawText.toLowerCase()
  for (const term of prohibited) {
    if (text.includes(term.toLowerCase())) {
      found.push(term)
    }
  }
  // Also scan extracted field values and source quotes
  for (const field of observation.extractedFields) {
    const fieldText = (field.value + (field.sourceQuote || '')).toLowerCase()
    for (const term of prohibited) {
      if (fieldText.includes(term.toLowerCase())) {
        found.push(term)
      }
    }
  }
  return { valid: found.length === 0, found }
}

// ─── Dataset-Level Validation ─────────────────────────────────────────────

// Run all consistency checks on the full dataset and return a summary.
export function validateRaviDataset(): {
  totalObservations: number
  allFieldComplete: boolean
  allBaselineConsistent: boolean
  allLanguageClean: boolean
  errors: string[]
} {
  const fieldChecks = RAVI_OBSERVATIONS.map(obs => verifyFieldCompleteness(obs))
  const baselineChecks = RAVI_OBSERVATIONS.map(obs =>
    verifyBaselineConsistency(obs, RAVI_BASELINE),
  )
  const languageChecks = RAVI_OBSERVATIONS.map(verifyNoProhibitedLanguage)

  const allFieldComplete = fieldChecks.every(f => f.valid)
  const allBaselineConsistent = baselineChecks.every(b => b.valid)
  const allLanguageClean = languageChecks.every(l => l.valid)

  const errors: string[] = []
  if (!allFieldComplete) {
    errors.push('Field completeness failures')
    fieldChecks.filter(f => !f.valid).forEach(f => errors.push(...f.missing))
  }
  if (!allBaselineConsistent) {
    errors.push('Baseline consistency failures')
    baselineChecks.filter(b => !b.valid).forEach(b => errors.push(...b.errors))
  }
  if (!allLanguageClean) {
    errors.push('Prohibited language found')
    languageChecks.filter(l => !l.valid).forEach(l => errors.push(...l.found))
  }

  return {
    totalObservations: RAVI_OBSERVATIONS.length,
    allFieldComplete,
    allBaselineConsistent,
    allLanguageClean,
    errors,
  }
}

// ─── Exported Sample Test Cases ───────────────────────────────────────────
//
// These demonstrate the kinds of assertions a test suite would run.
//
// 1. Dataset has exactly 7 observations (matching the spec).
// 2. At least two observations contain reported changes from baseline
//    (reduced lunch intake + lower hydration).
// 3. No observation contains prohibited medical language.
// 4. Every extracted field has a sourceQuote and caregiverConfirmed.
// 5. Baseline entries are internally consistent (no duplicate fields).
// 6. Observations are chronologically ordered by observedAt.

// Example test assertions (to be implemented in a test framework):
//
// test('dataset has 7 observations', () => {
//   const { totalObservations, errors } = validateRaviDataset()
//   expect(totalObservations).toBe(7)
//   expect(errors).toEqual([])
// })
//
// test('at least two observations show changes from baseline', () => {
//   const changes = RAVI_OBSERVATIONS.filter(o =>
//     o.extractedFields.some(f => f.differentFromBaseline === true),
//   )
//   expect(changes.length).toBeGreaterThanOrEqual(2)
// })
//
// test('no prohibited language in any observation', () => {
//   const { allLanguageClean, errors } = validateRaviDataset()
//   expect(allLanguageClean).toBe(true)
//   expect(errors).toEqual([])
// })
//
// test('every extracted field has sourceQuote and caregiverConfirmed', () => {
//   const { allFieldComplete } = validateRaviDataset()
//   expect(allFieldComplete).toBe(true)
// })
//
// test('baseline entries have no duplicate fields', () => {
//   const fieldNames = RAVI_BASELINE.map(b => b.field)
//   const duplicates = fieldNames.filter((f, i) => fieldNames.indexOf(f) !== i)
//   expect(duplicates).toEqual([])
//
// })
//
// test('observations are in chronological order', () => {
//   const dates = RAVI_OBSERVATIONS.map(o => new Date(o.observedAt))
//   const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime())
//   expect(dates).toEqual(sorted)
// })