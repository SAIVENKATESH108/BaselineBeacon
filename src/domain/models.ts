// src/domain/models.ts
// Canonical domain model for BaselineBeacon.
// All phases MUST use these classes and interfaces — do not introduce parallel ad hoc types.

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum MobilityLevel {
  Independent = 'independent',
  Cane = 'cane',
  Walker = 'walker',
  Wheelchair = 'wheelchair',
}

export enum ObservationCategory {
  MealIntake = 'meal_intake',
  Hydration = 'hydration',
  Sleep = 'sleep',
  Energy = 'energy',
  Mobility = 'mobility',
  MoodBehavior = 'mood_behavior',
  Medication = 'medication',
  PainDiscomfort = 'pain_discomfort',
  FallIncident = 'fall_incident',
  Other = 'other',
}

export enum Comparison {
  Lower = 'lower',
  Higher = 'higher',
  Same = 'same',
  Different = 'different',
  Unknown = 'unknown',
}

export enum AppMode {
  Demo = 'demo',    // deterministic fixture data, zero network calls
  Ai = 'ai',        // live extraction via provider chain
  Manual = 'manual', // caregiver fills structured fields directly, no AI
}

// ─── Base Entity ──────────────────────────────────────────────────────────────

export abstract class Entity {
  constructor(
    public readonly id: string,
    public readonly createdAt: Date,
  ) {}
}

// ─── CareRecipient ────────────────────────────────────────────────────────────

export class CareRecipient extends Entity {
  constructor(
    id: string,
    createdAt: Date,
    public name: string,
    public ageRange: string,
    public relationship: string,
  ) {
    super(id, createdAt)
  }
}

// ─── Baseline ─────────────────────────────────────────────────────────────────

export class Baseline extends Entity {
  constructor(
    id: string,
    createdAt: Date,
    public careRecipientId: string,
    public typicalMealsPerDay: number,
    public hydrationGoalGlasses: number,
    public usualSleepHours: number,
    public mobilityLevel: MobilityLevel,
    public notes: string | null,
  ) {
    super(id, createdAt)
  }
}

// ─── ObservationEntry ─────────────────────────────────────────────────────────

export class ObservationEntry extends Entity {
  constructor(
    id: string,
    createdAt: Date,
    public careRecipientId: string,
    public transcript: string,
    public source: 'voice' | 'text',
    public status: 'draft' | 'reviewed' | 'saved',
  ) {
    super(id, createdAt)
  }
}

// ─── ExtractedObservation ─────────────────────────────────────────────────────

export class ExtractedObservation extends Entity {
  constructor(
    id: string,
    createdAt: Date,
    public entryId: string,
    public category: ObservationCategory,
    public metricKey: string,
    public valueText: string | null,
    public valueNumber: number | null,
    public comparisonToBaseline: Comparison,
    public sourceQuote: string,
    public caregiverConfirmed: boolean,
  ) {
    super(id, createdAt)
  }
}

// ─── TrendInsight ─────────────────────────────────────────────────────────────

export class TrendInsight extends Entity {
  constructor(
    id: string,
    createdAt: Date,
    public careRecipientId: string,
    /** Must use only approved non-diagnostic wording from AI_AGENT_RULES.md §2 */
    public message: string,
    public supportingEntryIds: string[],
    public occurrenceCount: number,
  ) {
    super(id, createdAt)
  }
}

// ─── Extraction Types ─────────────────────────────────────────────────────────

export interface ExtractionResult {
  extractedFields: Array<{
    category: ObservationCategory
    metricKey: string
    valueText: string | null
    valueNumber: number | null
    comparisonToBaseline: Comparison
    sourceQuote: string
    caregiverConfirmed: false // always false until caregiver review
  }>
}

// ─── Repository Interface ─────────────────────────────────────────────────────

export interface ObservationRepository {
  saveEntry(entry: ObservationEntry): Promise<void>
  findEntriesByRecipient(
    recipientId: string,
    limit?: number,
    cursor?: string,
  ): Promise<ObservationEntry[]>
  saveExtractedObservations(
    entryId: string,
    observations: ExtractedObservation[],
  ): Promise<void>
  findExtractedByEntry(entryId: string): Promise<ExtractedObservation[]>
  findAllExtractedByRecipient(recipientId: string): Promise<ExtractedObservation[]>
}

// ─── Extractor Interface ──────────────────────────────────────────────────────

export interface ObservationExtractor {
  name: string
  extract(transcript: string): Promise<ExtractionResult>
}
