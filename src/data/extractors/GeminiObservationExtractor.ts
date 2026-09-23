// src/data/extractors/GeminiObservationExtractor.ts
// Live Gemini extractor — implements ObservationExtractor with a 5-second timeout.
// Falls through (throws) on any failure so ResilientObservationExtractor can chain.

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ObservationExtractor, ExtractionResult } from '@/domain/models'
import { ObservationCategory, Comparison } from '@/domain/models'
import { z } from 'zod'

// ─── Zod validation for LLM response ─────────────────────────────────────────
const ExtractionFieldSchema = z.object({
  category: z.nativeEnum(ObservationCategory),
  metricKey: z.string(),
  valueText: z.string().nullable(),
  valueNumber: z.number().nullable(),
  comparisonToBaseline: z.nativeEnum(Comparison),
  sourceQuote: z.string(),
  caregiverConfirmed: z.literal(false),
})

const ExtractionResultSchema = z.object({
  extractedFields: z.array(ExtractionFieldSchema).min(1).max(10),
})

// ─── System prompt — verbatim from AI_AGENT_RULES.md §6 ──────────────────────
const SYSTEM_PROMPT = `You are BaselineBeacon Extractor. You are not a clinician. You must not diagnose, predict, interpret, assess urgency, recommend treatment, or infer information not explicitly stated. Extract only facts directly stated by the caregiver.
Allowed categories: meal_intake, hydration, sleep, energy, mobility, mood_behavior, medication, pain_discomfort, fall_incident, other.
Rules: (1) If not explicitly stated, use null — never infer. (2) Never mention medical conditions (infection, UTI, dehydration, stroke, dementia decline, depression, non-adherence). (3) No probability/confidence/risk/severity/urgency/diagnosis/treatment/recommendation language. (4) Preserve caregiver uncertainty in valueText. (5) Every observation needs an exact sourceQuote. (6) "Medication taken" is caregiver-reported only, never "verified." (7) "No fall" → fall_reported=false. (8) Return JSON only, no Markdown, no explanation.

Return JSON matching this exact schema:
{
  "extractedFields": [
    {
      "category": "meal_intake | hydration | sleep | energy | mobility | mood_behavior | medication | pain_discomfort | fall_incident | other",
      "metricKey": "snake_case_metric_name",
      "valueText": "caregiver-reported text or null",
      "valueNumber": null or number,
      "comparisonToBaseline": "lower | higher | same | different | unknown",
      "sourceQuote": "exact quote from transcript",
      "caregiverConfirmed": false
    }
  ]
}`

export class GeminiObservationExtractor implements ObservationExtractor {
  readonly name = 'GeminiObservationExtractor'
  private readonly timeoutMs = 5000

  async extract(transcript: string): Promise<ExtractionResult> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
    if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not set')

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    })

    const prompt = `Caregiver note:\n${transcript}`

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini timeout')), this.timeoutMs),
      ),
    ])

    const text = result.response.text()
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    // Throws ZodError on invalid shape — caught by ResilientExtractor
    return ExtractionResultSchema.parse(parsed)
  }
}
