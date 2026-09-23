// src/data/repositories/InMemoryObservationRepository.ts
// Demo-mode and testing implementation of ObservationRepository.
// Zero network calls — all state is held in memory.
// AppMode.Demo always uses this implementation.

import type { ObservationRepository } from '@/domain/models'
import { ObservationEntry, ExtractedObservation } from '@/domain/models'

export class InMemoryObservationRepository implements ObservationRepository {
  private entries: Map<string, ObservationEntry> = new Map()
  private extracted: Map<string, ExtractedObservation[]> = new Map()

  /** Seed with pre-existing fixture data (for demo mode). */
  seed(entries: ObservationEntry[], extracted: Map<string, ExtractedObservation[]>): void {
    for (const e of entries) this.entries.set(e.id, e)
    for (const [entryId, obs] of extracted) this.extracted.set(entryId, obs)
  }

  async saveEntry(entry: ObservationEntry): Promise<void> {
    this.entries.set(entry.id, entry)
  }

  async findEntriesByRecipient(
    recipientId: string,
    limit = 50,
    cursor?: string,
  ): Promise<ObservationEntry[]> {
    const all = Array.from(this.entries.values())
      .filter((e) => e.careRecipientId === recipientId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    if (!cursor) return all.slice(0, limit)
    const idx = all.findIndex((e) => e.id === cursor)
    return idx === -1 ? [] : all.slice(idx + 1, idx + 1 + limit)
  }

  async saveExtractedObservations(
    entryId: string,
    observations: ExtractedObservation[],
  ): Promise<void> {
    this.extracted.set(entryId, observations)
  }

  async findExtractedByEntry(entryId: string): Promise<ExtractedObservation[]> {
    return this.extracted.get(entryId) ?? []
  }

  async findAllExtractedByRecipient(recipientId: string): Promise<ExtractedObservation[]> {
    const recipientEntryIds = Array.from(this.entries.values())
      .filter((e) => e.careRecipientId === recipientId)
      .map((e) => e.id)

    const result: ExtractedObservation[] = []
    for (const id of recipientEntryIds) {
      const obs = this.extracted.get(id) ?? []
      result.push(...obs)
    }
    return result
  }

  /** Reset all state — useful for test isolation. */
  reset(): void {
    this.entries.clear()
    this.extracted.clear()
  }
}
