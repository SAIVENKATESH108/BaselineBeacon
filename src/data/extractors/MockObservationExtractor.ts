// src/data/extractors/MockObservationExtractor.ts
// Deterministic keyword-based extractor — always succeeds, zero network calls.
// This is the final fallback in the ResilientObservationExtractor chain.
// It may only capture facts explicitly mentioned in the transcript.
// It never diagnoses, infers, or invents medical data.

import type { ObservationExtractor, ExtractionResult } from '@/domain/models'
import { ObservationCategory, Comparison } from '@/domain/models'

type KeywordRule = {
  phrase: string
  category: ObservationCategory
  metricKey: string
  comparison: Comparison
}

/** Longest-first sorted for specificity — more specific phrases win. */
const KEYWORD_RULES: KeywordRule[] = [
  // Meal intake
  { phrase: 'ate all three meals', category: ObservationCategory.MealIntake, metricKey: 'meal_completion', comparison: Comparison.Same },
  { phrase: 'ate all meals', category: ObservationCategory.MealIntake, metricKey: 'meal_completion', comparison: Comparison.Same },
  { phrase: 'skipped lunch', category: ObservationCategory.MealIntake, metricKey: 'lunch_intake', comparison: Comparison.Lower },
  { phrase: 'ate less', category: ObservationCategory.MealIntake, metricKey: 'meal_completion', comparison: Comparison.Lower },
  { phrase: 'few bites', category: ObservationCategory.MealIntake, metricKey: 'meal_completion', comparison: Comparison.Lower },
  { phrase: 'refused breakfast', category: ObservationCategory.MealIntake, metricKey: 'breakfast_intake', comparison: Comparison.Lower },
  { phrase: 'ate breakfast', category: ObservationCategory.MealIntake, metricKey: 'breakfast_intake', comparison: Comparison.Same },
  { phrase: 'half portions', category: ObservationCategory.MealIntake, metricKey: 'meal_portions', comparison: Comparison.Lower },

  // Hydration
  { phrase: 'two glasses of water', category: ObservationCategory.Hydration, metricKey: 'fluid_intake', comparison: Comparison.Lower },
  { phrase: 'three glasses', category: ObservationCategory.Hydration, metricKey: 'fluid_intake', comparison: Comparison.Lower },
  { phrase: 'five glasses', category: ObservationCategory.Hydration, metricKey: 'fluid_intake', comparison: Comparison.Lower },
  { phrase: 'six glasses', category: ObservationCategory.Hydration, metricKey: 'fluid_intake', comparison: Comparison.Same },
  { phrase: 'drank less', category: ObservationCategory.Hydration, metricKey: 'fluid_intake', comparison: Comparison.Lower },
  { phrase: 'drank only', category: ObservationCategory.Hydration, metricKey: 'fluid_intake', comparison: Comparison.Lower },

  // Sleep
  { phrase: 'most of the afternoon', category: ObservationCategory.Sleep, metricKey: 'afternoon_nap_duration', comparison: Comparison.Higher },
  { phrase: 'afternoon nap', category: ObservationCategory.Sleep, metricKey: 'afternoon_nap_duration', comparison: Comparison.Same },
  { phrase: 'more tired', category: ObservationCategory.Sleep, metricKey: 'daytime_tiredness', comparison: Comparison.Different },
  { phrase: 'slept', category: ObservationCategory.Sleep, metricKey: 'sleep_duration', comparison: Comparison.Unknown },

  // Mobility
  { phrase: 'more difficulty', category: ObservationCategory.Mobility, metricKey: 'walking_difficulty', comparison: Comparison.Different },
  { phrase: 'no fall', category: ObservationCategory.FallIncident, metricKey: 'fall_reported', comparison: Comparison.Same },
  { phrase: 'fell', category: ObservationCategory.FallIncident, metricKey: 'fall_reported', comparison: Comparison.Different },
  { phrase: 'walked', category: ObservationCategory.Mobility, metricKey: 'walking_status', comparison: Comparison.Unknown },
  { phrase: 'walk', category: ObservationCategory.Mobility, metricKey: 'walking_status', comparison: Comparison.Unknown },

  // Mood / Behavior
  { phrase: 'did not speak much', category: ObservationCategory.MoodBehavior, metricKey: 'communication_observation', comparison: Comparison.Different },
  { phrase: 'cheerful', category: ObservationCategory.MoodBehavior, metricKey: 'mood_observation', comparison: Comparison.Same },
  { phrase: 'sad', category: ObservationCategory.MoodBehavior, metricKey: 'mood_observation', comparison: Comparison.Different },

  // Medication
  { phrase: 'took her tablets', category: ObservationCategory.Medication, metricKey: 'medication_taken', comparison: Comparison.Same },
  { phrase: 'took medication', category: ObservationCategory.Medication, metricKey: 'medication_taken', comparison: Comparison.Same },
  { phrase: 'tablets', category: ObservationCategory.Medication, metricKey: 'medication_taken', comparison: Comparison.Unknown },

  // Pain / Discomfort
  { phrase: 'discomfort', category: ObservationCategory.PainDiscomfort, metricKey: 'discomfort_level', comparison: Comparison.Different },
  { phrase: 'pain', category: ObservationCategory.PainDiscomfort, metricKey: 'pain_level', comparison: Comparison.Different },
].sort((a, b) => b.phrase.length - a.phrase.length)

function findSourceQuote(transcript: string, phrase: string): string {
  const sentences = transcript.split(/[.!?]+/)
  const match = sentences.find((s) => s.toLowerCase().includes(phrase.toLowerCase()))
  return match ? match.trim() : transcript.trim()
}

export class MockObservationExtractor implements ObservationExtractor {
  readonly name = 'MockObservationExtractor'

  async extract(transcript: string): Promise<ExtractionResult> {
    if (!transcript || transcript.trim().length === 0) {
      return this.fallback(transcript)
    }

    const lower = transcript.toLowerCase()
    const addedKeys = new Set<string>()
    const fields: ExtractionResult['extractedFields'] = []

    for (const rule of KEYWORD_RULES) {
      if (addedKeys.has(rule.metricKey)) continue
      if (!lower.includes(rule.phrase.toLowerCase())) continue

      addedKeys.add(rule.metricKey)
      fields.push({
        category: rule.category,
        metricKey: rule.metricKey,
        valueText: rule.phrase,
        valueNumber: null,
        comparisonToBaseline: rule.comparison,
        sourceQuote: findSourceQuote(transcript, rule.phrase),
        caregiverConfirmed: false,
      })
    }

    if (fields.length === 0) return this.fallback(transcript)
    return { extractedFields: fields }
  }

  private fallback(transcript: string): ExtractionResult {
    return {
      extractedFields: [
        {
          category: ObservationCategory.Other,
          metricKey: 'general_observation',
          valueText: transcript.trim() || 'No content provided',
          valueNumber: null,
          comparisonToBaseline: Comparison.Unknown,
          sourceQuote: transcript.trim() || 'No content provided',
          caregiverConfirmed: false,
        },
      ],
    }
  }
}
