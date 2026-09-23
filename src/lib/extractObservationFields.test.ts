/* =============================================================================
   BaselineBeacon — Mock Extraction Service Unit Tests
   Using vitest syntax.  All transcripts are fictional demo data.
   No real patient information.  Tests verify deterministic output shape,
   keyword matching, and safe fallbacks.
   ===================================================================== */

import { describe, it, expect, beforeEach } from 'vitest'
import { extractObservationFields } from '@/lib/extractObservationFields'
import type { ExtractionResponse } from '@/lib/validation'

// ─── Test transcripts (fictional, non-clinical) ─────────────────────────────
const transcripts = {
  t1:
    'Grandfather ate breakfast but only a few bites at lunch. He drank one glass of water and slept most of the afternoon. No fall.',
  t2: 'Everything was normal today.',
  t3: 'I do not know whether she took her tablets.',
  t4: 'He might be sick, I am not sure.',
  t5: 'She was sad and did not speak much.',
  t6: 'No update today.',
  t7:
    'Ate breakfast but only a few bites at lunch. Drank one glass of water. Slept most of the afternoon. No fall.',
  t8: 'She took her morning medication without prompting.',
  t9: 'He walked with more difficulty than usual but no fall.',
  t10: 'The caregiver reported a change in appetite and hydration.',
}

// ─── Test: each transcript returns a valid ExtractionResponse shape ───────────
describe('extractObservationFields', () => {
  beforeEach(() => {
    // No global setup needed; each test is independent.
  })

  // T1: Mixed transcript with multiple observed changes.
  it('T1 — mixed transcript extracts multiple fields with source quotes', () => {
    const result = extractObservationFields(transcripts.t1) as ExtractionResponse
    // Should have at least 3 fields: appetite, hydration, sleep, mobility
    expect(result).toBeDefined()
    expect(Array.isArray(result.extractedFields)).toBe(true)
    expect(result.extractedFields.length).toBeGreaterThanOrEqual(3)

    // Every field must have the required shape.
    for (const field of result.extractedFields) {
      expect(field).toHaveProperty('category')
      expect(field).toHaveProperty('metric_key')
      expect(field).toHaveProperty('value_text')
      expect(field).toHaveProperty('comparison_to_baseline')
      expect(field).toHaveProperty('exact_source_quote')
      expect(field).toHaveProperty('caregiver_confirmed')
      expect(field.caregiver_confirmed).toBe(false)
      // comparison_to_baseline must be one of the allowed values.
      expect(['lower', 'higher', 'same', 'different', 'unknown']).toContain(
        field.comparison_to_baseline
      )
    }
  })

  // T2: Boring "normal today" → fallback to generic other field.
  it('T2 — "Everything was normal today." yields generic other field', () => {
    const result = extractObservationFields(transcripts.t2) as ExtractionResponse
    expect(result.extractedFields.length).toBe(1)
    const field = result.extractedFields[0]
    expect(field.category).toBe('other')
    expect(field.metric_key).toBe('general_observation')
    expect(field.comparison_to_baseline).toBe('unknown')
    expect(field.value_text).toBe(transcripts.t2)
    expect(field.exact_source_quote).toBe(transcripts.t2)
    expect(field.caregiver_confirmed).toBe(false)
  })

  // T3: Unknown about medication → keyword "tablets" matches, comparison unknown.
  it('T3 — "I do not know whether she took her tablets." extracts medication field', () => {
    const result = extractObservationFields(transcripts.t3) as ExtractionResponse
    expect(result.extractedFields.length).toBeGreaterThanOrEqual(1)
    const medFields = result.extractedFields.filter(
      (f) => f.metric_key === 'medication_taken'
    )
    expect(medFields.length).toBeGreaterThanOrEqual(1)
    // comparison should be 'unknown' since the speaker is unsure.
    expect(medFields[0].comparison_to_baseline).toBe('unknown')
  })

  // T4: Unsure language → no matching keywords → generic other fallback.
  it('T4 — "He might be sick, I am not sure." yields generic other field', () => {
    const result = extractObservationFields(transcripts.t4) as ExtractionResponse
    expect(result.extractedFields.length).toBe(1)
    const field = result.extractedFields[0]
    expect(field.category).toBe('other')
    expect(field.metric_key).toBe('general_observation')
    expect(field.comparison_to_baseline).toBe('unknown')
  })

  // T5: Sad mood + silence → mood + communication observations.
  it('T5 — "She was sad and did not speak much." extracts mood and communication fields', () => {
    const result = extractObservationFields(transcripts.t5) as ExtractionResponse
    expect(result.extractedFields.length).toBeGreaterThanOrEqual(2)
    const moodFields = result.extractedFields.filter(
      (f) => f.category === 'mood'
    )
    expect(moodFields.length).toBeGreaterThanOrEqual(1)
    // "sad" should map to comparison 'different' from baseline.
    const sadField = moodFields.find((f) => f.metric_key === 'mood_observation')
    if (sadField) {
      expect(sadField.comparison_to_baseline).toBe('different')
    }
  })

  // T6: "No update today." → generic other field.
  it('T6 — "No update today." yields generic other field', () => {
    const result = extractObservationFields(transcripts.t6) as ExtractionResponse
    expect(result.extractedFields.length).toBe(1)
    const field = result.extractedFields[0]
    expect(field.category).toBe('other')
    expect(field.metric_key).toBe('general_observation')
    expect(field.value_text).toBe(transcripts.t6)
  })

  // T7: Duplicate of T1 logic — determinism check.
  it('T7 — deterministic: same transcript yields same field count', () => {
    const result1 = extractObservationFields(transcripts.t1) as ExtractionResponse
    const result2 = extractObservationFields(transcripts.t7) as ExtractionResponse
    // Both should extract the same number of fields (same keywords present).
    expect(result1.extractedFields.length).toBe(result2.extractedFields.length)
  })

  // T8: Medication taken without prompting → keyword "took her tablets".
  it('T8 — "She took her morning medication without prompting." extracts medication field', () => {
    const result = extractObservationFields(transcripts.t8) as ExtractionResponse
    expect(result.extractedFields.length).toBeGreaterThanOrEqual(1)
    const medFields = result.extractedFields.filter(
      (f) => f.metric_key === 'medication_taken'
    )
    expect(medFields.length).toBeGreaterThanOrEqual(1)
    // "took her tablets" variant should set comparison to 'same' (neutral).
    const medField = medFields.find((f) => f.metric_key === 'medication_taken')
    if (medField) {
      expect(medField.comparison_to_baseline).toBe('same')
    }
  })

  // T9: Mobility decline + no fall.
  it('T9 — "He walked with more difficulty than usual but no fall." extracts mobility fields', () => {
    const result = extractObservationFields(transcripts.t9) as ExtractionResponse
    expect(result.extractedFields.length).toBeGreaterThanOrEqual(2)
    const mobilityFields = result.extractedFields.filter(
      (f) => f.category === 'mobility'
    )
    expect(mobilityFields.length).toBeGreaterThanOrEqual(1)
    // "more difficult" → comparison 'lower'
    const diffField = mobilityFields.find((f) => f.metric_key === 'walking_difficulty')
    if (diffField) {
      expect(diffField.comparison_to_baseline).toBe('lower')
    }
    // "no fall" → fall_status 'same'
    const fallField = mobilityFields.find((f) => f.metric_key === 'fall_status')
    if (fallField) {
      expect(fallField.comparison_to_baseline).toBe('same')
    }
  })

  // T10: Unrelated vague language → fallback to other field only.
  it('T10 — "The caregiver reported a change in appetite and hydration." yields other field only', () => {
    const result = extractObservationFields(transcripts.t10) as ExtractionResponse
    // Neither "appetite" nor "hydration" has a specific token in the map
    // beyond generic words; expect fallback to single other field.
    expect(result.extractedFields.length).toBe(1)
    const field = result.extractedFields[0]
    expect(field.category).toBe('other')
    expect(field.metric_key).toBe('general_observation')
    expect(field.comparison_to_baseline).toBe('unknown')
  })

  // ─── Additional assertions for every returned field ───────────────────────
  it('every returned field has required properties and valid values', () => {
    // Run all transcripts and assert shape.
    const allTranscripts = Object.values(transcripts)
    for (const t of allTranscripts) {
      const result = extractObservationFields(t) as ExtractionResponse
      expect(result.extractedFields).toBeDefined()
      for (const field of result.extractedFields) {
        // 1. category is one of the allowed enum values.
        expect(['sleep', 'appetite', 'mood', 'mobility', 'cognition', 'pain', 'hydration', 'bowel_bladder', 'social', 'medication', 'other']).toContain(
          field.category
        )
        // 2. metric_key is a non-empty string.
        expect(typeof field.metric_key).toBe('string')
        expect(field.metric_key.length).toBeGreaterThan(0)
        // 3. value_text is a non-empty string.
        expect(typeof field.value_text).toBe('string')
        expect(field.value_text.length).toBeGreaterThan(0)
        // 4. comparison_to_baseline is valid enum.
        expect(['lower', 'higher', 'same', 'different', 'unknown']).toContain(
          field.comparison_to_baseline
        )
        // 5. exact_source_quote is a non-empty string.
        expect(typeof field.exact_source_quote).toBe('string')
        expect(field.exact_source_quote.length).toBeGreaterThan(0)
        // 6. caregiver_confirmed is always boolean false (initial state).
        expect(field.caregiver_confirmed).toBe(false)
        // 7. value_number is undefined (mock does not set numeric values).
        expect(field.value_number).toBeUndefined()
      }
    }
  })
})