/* =============================================================================
   BaselineBeacon — Observation Extraction Validation (Zod schemas)
   Safe, non-clinical schemas only.  No medical inference, no diagnosis,
   no risk/severity scores.  All values come explicitly from the caregiver's
   transcript — the mock extractor may only capture what is stated.
   ===================================================================== */

import { z } from 'zod'

// ─── Category enum — must match BaselineCategory from @/types ──────────────
export const BaselineCategory = z.enum([
  'sleep',
  'appetite',
  'mood',
  'mobility',
  'cognition',
  'pain',
  'hydration',
  'bowel_bladder',
  'social',
  'medication',
  'other',
])

// ─── Comparison to baseline enum ───────────────────────────────────────────
export const ComparisonToBaseline = z.enum(['lower', 'higher', 'same', 'different', 'unknown'])

// ─── Single extracted field ────────────────────────────────────────────────
export const ExtractedFieldSchema = z.object({
  category: BaselineCategory,
  metric_key: z.string(),
  value_text: z.string(),
  value_number: z.number().optional(),
  comparison_to_baseline: ComparisonToBaseline,
  exact_source_quote: z.string(),
  caregiver_confirmed: z.boolean().default(false),
})

// ─── Root extraction response ──────────────────────────────────────────────
export const ExtractionResponseSchema = z.object({
  extractedFields: z.array(ExtractedFieldSchema).min(1).max(10),
})

// ─── Type shortcuts ──────────────────────────────────────────────────────
export type ExtractedField = z.infer<typeof ExtractedFieldSchema>
export type ExtractionResponse = z.infer<typeof ExtractionResponseSchema>

// ─── Safe fallback — used when AI output is malformed or no fields match ─────
export const extractionFallback = (rawText: string): ExtractionResponse => ({
  extractedFields: [
    {
      category: 'other',
      metric_key: 'general_observation',
      value_text: rawText,
      value_number: undefined,
      comparison_to_baseline: 'unknown',
      exact_source_quote: rawText,
      caregiver_confirmed: false,
    },
  ],
})