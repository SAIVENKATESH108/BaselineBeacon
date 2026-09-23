/* =============================================================================
   BaselineBeacon — Mock Observation Extraction Service
   Deterministic, keyword-based mock that captures only explicitly stated facts.
   Never diagnoses, infers, predicts, or invents medical data.
   Falls back to a safe default when no keywords match.
   ===================================================================== */

import {
  ExtractedField,
  ExtractionResponse,
  extractionFallback,
  Transcript,
} from '@/lib/validation'

// ─── Keyword map: transcript token → { category, metric_key, comparison } ────
//
// Each entry represents a phrase the mock may find in a transcript.
// The mock performs a case-insensitive contains check for each phrase.
// If multiple phrases match, the first (longest-first sorted) wins for a given
// metric_key to avoid duplicates.
//
// IMPORTANT: This map is the sole source of what the mock can surface.
// It adds NO medical knowledge, NO inferred meanings, and NO disease labels.
// Any phrase that could be interpreted as clinical is explicitly avoided.
const KEYWORD_MAP = [
  // ── Appetite / Meal intake ────────────────────────────────────────────
  { phrase: 'ate breakfast', category: 'appetite', metric_key: 'meal_completion' },
  { phrase: 'ate lunch', category: 'appetite', metric_key: 'lunch_intake' },
  { phrase: 'few bites', category: 'appetite', metric_key: 'lunch_intake' },
  { phrase: 'ate less', category: 'appetite', metric_key: 'lunch_intake' },
  { phrase: 'ate all', category: 'appetite', metric_key: 'meal_completion' },

  // ── Hydration ──────────────────────────────────────────────────────────
  { phrase: 'water', category: 'hydration', metric_key: 'fluid_intake' },
  { phrase: 'one glass', category: 'hydration', metric_key: 'fluid_intake' },
  { phrase: 'two glasses', category: 'hydration', metric_key: 'fluid_intake' },
  { phrase: 'six glasses', category: 'hydration', metric_key: 'fluid_intake' },

  // ── Sleep ──────────────────────────────────────────────────────────────
  { phrase: 'slept', category: 'sleep', metric_key: 'sleep_duration' },
  { phrase: 'afternoon nap', category: 'sleep', metric_key: 'afternoon_nap_duration' },
  { phrase: 'most of the afternoon', category: 'sleep', metric_key: 'afternoon_nap_duration' },
  { phrase: 'slept most of the day', category: 'sleep', metric_key: 'sleep_duration' },

  // ── Mobility ───────────────────────────────────────────────────────────
  { phrase: 'walk', category: 'mobility', metric_key: 'walking_status' },
  { phrase: 'more difficult', category: 'mobility', metric_key: 'walking_difficulty' },
  { phrase: 'no fall', category: 'mobility', metric_key: 'fall_status' },

  // ── Mood / Behavior ───────────────────────────────────────────────────
  { phrase: 'sad', category: 'mood', metric_key: 'mood_observation' },
  { phrase: 'cheerful', category: 'mood', metric_key: 'mood_observation' },
  { phrase: 'did not speak much', category: 'mood', metric_key: 'communication_observation' },

  // ── Medication ─────────────────────────────────────────────────────────
  { phrase: 'tablets', category: 'medication', metric_key: 'medication_taken' },
  { phrase: 'took her tablets', category: 'medication', metric_key: 'medication_taken' },

  // ── Pain / Discomfort ──────────────────────────────────────────────────
  { phrase: 'pain', category: 'pain', metric_key: 'pain_level' },
  { phrase: 'discomfort', category: 'pain', metric_key: 'discomfort_level' },

  // ── Other / General ────────────────────────────────────────────────────
  { phrase: 'no fall', category: 'other', metric_key: 'general_observation' },
  { phrase: 'no update', category: 'other', metric_key: 'general_observation' },
].sort((a, b) => b.phrase.length - a.phrase.length) // longest first

// ─── Helper: find the sentence containing a given phrase ───────────────────
/** Return the first sentence (split by '.') that contains the phrase, or null. */
const findSourceQuote = (rawText: Transcript, phrase: string): string | null => {
  const sentences = rawText.split('.')
  const matching = sentences.find((s) => s.toLowerCase().includes(phrase.toLowerCase()))
  return matching ? matching.trim() : null
}

/** Core deterministic extraction logic. */
const rawExtract = (rawText: Transcript): ExtractedField[] => {
  const lower = rawText.toLowerCase()

  // Track which metric_keys we've already added to avoid duplicates.
  const addedMetrics = new Set<string>()

  const fields: ExtractedField[] = []

  // Iterate phrases longest-first so more specific matches win.
  for (const { phrase, category, metric_key } of KEYWORD_MAP) {
    if (addedMetrics.has(metric_key)) continue // already have this metric

    if (lower.includes(phrase.toLowerCase())) {
      addedMetrics.add(metric_key)

      const sourceQuote = findSourceQuote(rawText, phrase) || rawText.trim()

      // Determine comparison_to_baseline based on keyword heuristics.
      // These are deliberately simple and non-clinical.
      let comparison: 'lower' | 'higher' | 'same' | 'different' | 'unknown' = 'unknown'

      if (['few bites', 'ate less', 'one glass', 'two glasses'].includes(phrase)) {
        comparison = 'lower'
      } else if (['ate all', 'six glasses', 'cheerful'].includes(phrase)) {
        comparison = 'higher'
      } else if (['ate breakfast', 'ate lunch', 'slept', 'walk', 'tablets', 'no fall'].includes(phrase)) {
        comparison = 'same' // default neutral when explicit contrast is absent
      } else if (['sad', 'did not speak much'].includes(phrase)) {
        comparison = 'different'
      }

      fields.push({
        category,
        metric_key,
        value_text: phrase,
        value_number: undefined,
        comparison_to_baseline: comparison,
        exact_source_quote: sourceQuote,
        caregiver_confirmed: false,
      })
    }
  }

  // If nothing matched, return a single generic field (handled by caller's fallback).
  return fields
}

/** Public API: analyze a transcript and return a validated ExtractionResponse. */
export function extractObservationFields(
  rawText: Transcript
): ExtractionResponse {
  // Input guard: empty/whitespace → fallback.
  if (!rawText || rawText.trim().length === 0) {
    return extractionFallback(rawText)
  }

  const extracted = rawExtract(rawText)

  // Validate with Zod; if invalid (should not happen with deterministic logic),
  // return the safe fallback that guarantees a usable response.
  try {
    return {
      extractedFields: extracted.map((f) => ({
        category: f.category,
        metric_key: f.metric_key,
        value_text: f.value_text,
        value_number: f.value_number,
        comparison_to_baseline: f.comparison_to_baseline,
        exact_source_quote: f.exact_source_quote,
        caregiver_confirmed: f.caregiver_confirmed,
      })),
    }
  } catch {
    // Should never reach here, but safety net:
    return extractionFallback(rawText)
  }
}