// src/types/index.ts

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

// ─── Care Recipient ───────────────────────────────────────────────────────────
export interface CareRecipient {
  id: string;
  userId: string;
  name: string;
  dateOfBirth?: string;
  relationship: string;
  primaryConditions?: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Baseline ─────────────────────────────────────────────────────────────────
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
  | 'other';

export interface BaselineEntry {
  id: string;
  careRecipientId: string;
  category: BaselineCategory;
  field: string;
  value: string;
  unit?: string;
  notes?: string;
  capturedAt: string;
  updatedAt: string;
}

// ─── Observation ──────────────────────────────────────────────────────────────
export type ObservationSeverity = 'routine' | 'noteworthy' | 'incident';

export interface ExtractedField {
  category: BaselineCategory;
  field: string;
  value: string;
  unit?: string;
  caregiverConfirmed: boolean;
  differentFromBaseline?: boolean;
  notes?: string;
}

export interface Observation {
  id: string;
  careRecipientId: string;
  caregiverId: string;
  rawText: string;
  voiceTranscript?: string;
  extractedFields: ExtractedField[];
  severity?: ObservationSeverity;
  observedAt: string;
  createdAt: string;
  isDemo: boolean;
}

// ─── Report ───────────────────────────────────────────────────────────────────
export interface Report {
  id: string;
  careRecipientId: string;
  generatedBy: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  observations: Observation[];
  baselineSnapshot: BaselineEntry[];
  summaryMarkdown: string;
  createdAt: string;
  shareToken?: string;
  shareExpiresAt?: string;
}

// ─── Demo Mode ────────────────────────────────────────────────────────────────
export interface DemoState {
  isDemo: boolean;
  careRecipient: CareRecipient;
  baseline: BaselineEntry[];
  observations: Observation[];
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface BaselineFormValues {
  name: string;
  dateOfBirth: string;
  relationship: string;
  primaryConditions: string;
  // Sleep
  typicalSleepHours: string;
  sleepQuality: string;
  // Appetite
  appetiteLevel: string;
  dietaryRestrictions: string;
  // Mood
  typicalMood: string;
  // Mobility
  mobilityAids: string;
  mobilityNotes: string;
  // Cognition
  memoryNotes: string;
  // Pain
  typicalPainLevel: string;
  painLocations: string;
  // Hydration
  typicalFluidIntake: string;
  // Medication
  currentMedications: string;
  // Other
  otherNotes: string;
}
