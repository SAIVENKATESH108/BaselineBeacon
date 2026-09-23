// src/lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { BaselineEntry, ExtractedField } from '@/types'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string

const EXTRACTION_PROMPT = `
You are a clinical documentation assistant for family caregivers. Your role is to extract observable facts from a caregiver's daily note about their care recipient.

CRITICAL SAFETY RULES:
- Do NOT diagnose any medical condition.
- Do NOT mention UTI, stroke, dementia, infection, falls risk, or any disease name.
- Do NOT prescribe or suggest medications or dosages.
- Do NOT make predictions about health outcomes.
- Use only observation language: "caregiver-reported", "observed", "different from usual".
- All extracted values must come from the caregiver's note — do not infer or add information.

BASELINE CONTEXT (the person's usual patterns):
{{BASELINE_CONTEXT}}

CAREGIVER'S NOTE:
{{RAW_TEXT}}

Extract observable fields from the note. For each field, determine if it appears different from the baseline.

Return ONLY valid JSON matching this schema:
{
  "extractedFields": [
    {
      "category": "sleep|appetite|mood|mobility|cognition|pain|hydration|bowel_bladder|social|medication|other",
      "field": "short_snake_case_field_name",
      "value": "caregiver-reported value as string",
      "unit": "optional unit string or null",
      "differentFromBaseline": true|false|null,
      "notes": "optional brief context note or null"
    }
  ]
}

Only include fields that are actually mentioned in the caregiver's note. Return 1-10 fields maximum.
`

function buildBaselineContext(baseline: BaselineEntry[]): string {
  if (!baseline.length) return 'No baseline established yet.'
  return baseline
    .map((b) => `${b.category} / ${b.field}: ${b.value}${b.unit ? ' ' + b.unit : ''}`)
    .join('\n')
}

export async function extractObservationFields(
  rawText: string,
  baseline: BaselineEntry[]
): Promise<ExtractedField[]> {
  if (!apiKey) {
    // Graceful fallback — mock extraction when no API key
    console.warn('[Gemini] No API key set — returning mock extraction.')
    return mockExtraction(rawText)
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = EXTRACTION_PROMPT
    .replace('{{BASELINE_CONTEXT}}', buildBaselineContext(baseline))
    .replace('{{RAW_TEXT}}', rawText)

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    const fields: ExtractedField[] = (parsed.extractedFields || []).map(
      (f: Omit<ExtractedField, 'caregiverConfirmed'>) => ({
        ...f,
        caregiverConfirmed: false,
      })
    )
    return fields
  } catch (err) {
    console.error('[Gemini] Extraction failed:', err)
    return mockExtraction(rawText)
  }
}

function mockExtraction(rawText: string): ExtractedField[] {
  const text = rawText.toLowerCase()
  const fields: ExtractedField[] = []

  if (text.includes('sleep') || text.includes('slept') || text.includes('tired')) {
    fields.push({ category: 'sleep', field: 'sleep_quality', value: 'caregiver-reported sleep mentioned', caregiverConfirmed: false })
  }
  if (text.includes('eat') || text.includes('appetite') || text.includes('food') || text.includes('meal')) {
    fields.push({ category: 'appetite', field: 'appetite_noted', value: 'caregiver-reported eating mentioned', caregiverConfirmed: false })
  }
  if (text.includes('mood') || text.includes('happy') || text.includes('sad') || text.includes('upset') || text.includes('calm')) {
    fields.push({ category: 'mood', field: 'mood_observation', value: 'caregiver-reported mood mentioned', caregiverConfirmed: false })
  }
  if (text.includes('walk') || text.includes('moved') || text.includes('mobility') || text.includes('fell') || text.includes('balance')) {
    fields.push({ category: 'mobility', field: 'mobility_observation', value: 'caregiver-reported mobility mentioned', caregiverConfirmed: false })
  }
  if (text.includes('confused') || text.includes('memory') || text.includes('forgot') || text.includes('cognition')) {
    fields.push({ category: 'cognition', field: 'cognition_observation', value: 'caregiver-reported cognition mentioned', caregiverConfirmed: false })
  }
  if (text.includes('pain') || text.includes('hurt') || text.includes('ache') || text.includes('discomfort')) {
    fields.push({ category: 'pain', field: 'pain_observation', value: 'caregiver-reported discomfort mentioned', caregiverConfirmed: false })
  }
  if (text.includes('drink') || text.includes('water') || text.includes('fluid') || text.includes('hydrat')) {
    fields.push({ category: 'hydration', field: 'fluid_intake', value: 'caregiver-reported fluid intake mentioned', caregiverConfirmed: false })
  }
  if (!fields.length) {
    fields.push({ category: 'other', field: 'general_observation', value: rawText.slice(0, 120), caregiverConfirmed: false })
  }
  return fields
}
