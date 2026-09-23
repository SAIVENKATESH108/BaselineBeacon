// src/types/index.ts
// Legacy/compat types used by existing demoData.ts and pdfExport.ts
// The canonical domain model is in src/domain/models.ts
// These types bridge the old demoData shape to the app

export type BaselineCategory =
  | 'sleep'
  | 'appetite'
  | 'mood'
  | 'mobility'
  | 'cognition'
  | 'pain'
  | 'hydration'
  | 'bowel_bladder'
  | 'social'
  | 'medication'
  | 'other'
  | 'meal_intake'
  | 'mood_behavior'
  | 'pain_discomfort'
  | 'fall_incident'
  | 'energy'
  | 'severity' // legacy — used in existing demoData

export type ObservationSeverity = 'routine' | 'noteworthy' | 'incident'

export interface ExtractedField {
  category: BaselineCategory
  field: string
  value: string
  unit?: string | null
  caregiverConfirmed: boolean
  differentFromBaseline?: boolean | null
  sourceQuote?: string
  notes?: string
  comparison_to_baseline?: string
}

export interface BaselineEntry {
  id: string
  careRecipientId: string
  category: BaselineCategory
  field: string
  value: string
  unit?: string | null
  notes?: string
  capturedAt: string
  updatedAt: string
}

export interface Observation {
  id: string
  careRecipientId: string
  caregiverId: string
  rawText: string
  voiceTranscript?: string
  extractedFields: ExtractedField[]
  severity?: ObservationSeverity
  observedAt: string
  createdAt: string
  isDemo: boolean
  source?: string
}

export interface Report {
  id: string
  careRecipientId: string
  generatedBy: string
  dateRangeStart: string
  dateRangeEnd: string
  observations: Observation[]
  baselineSnapshot: BaselineEntry[]
  summaryMarkdown: string
  createdAt: string
  shareToken?: string
  shareExpiresAt?: string
}
