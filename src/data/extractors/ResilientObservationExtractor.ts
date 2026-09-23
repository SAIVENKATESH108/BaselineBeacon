// src/data/extractors/ResilientObservationExtractor.ts
// Circuit-breaker chain: Gemini (5s) → Mock (always succeeds).
// Implements the Graceful Degradation Ladder from docs/ARCHITECTURE.md.
// Never lets a provider failure produce a blank screen or unhandled exception.

import type { ObservationExtractor, ExtractionResult } from '@/domain/models'
import { MockObservationExtractor } from './MockObservationExtractor'
import { GeminiObservationExtractor } from './GeminiObservationExtractor'

interface CircuitBreakerState {
  failureCount: number
  openUntil: number | null // epoch ms, null = closed
}

const FAILURE_THRESHOLD = 3
const COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes

export class ResilientObservationExtractor implements ObservationExtractor {
  readonly name = 'ResilientObservationExtractor'

  private gemini: ObservationExtractor = new GeminiObservationExtractor()
  private mock: ObservationExtractor = new MockObservationExtractor()

  private breakers: Map<string, CircuitBreakerState> = new Map()

  private getBreaker(name: string): CircuitBreakerState {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, { failureCount: 0, openUntil: null })
    }
    return this.breakers.get(name)!
  }

  private isOpen(name: string): boolean {
    const b = this.getBreaker(name)
    if (b.openUntil === null) return false
    if (Date.now() >= b.openUntil) {
      // Reset after cooldown
      b.failureCount = 0
      b.openUntil = null
      return false
    }
    return true
  }

  private recordFailure(name: string): void {
    const b = this.getBreaker(name)
    b.failureCount++
    if (b.failureCount >= FAILURE_THRESHOLD) {
      b.openUntil = Date.now() + COOLDOWN_MS
      console.warn(`[ResilientExtractor] Circuit open for ${name} for ${COOLDOWN_MS / 1000}s`)
    }
  }

  private recordSuccess(name: string): void {
    const b = this.getBreaker(name)
    b.failureCount = 0
    b.openUntil = null
  }

  /** Returns current provider health status for the /health indicator. */
  getProviderStatus(): Record<string, 'reachable' | 'degraded' | 'down'> {
    const status = (name: string): 'reachable' | 'degraded' | 'down' => {
      const b = this.getBreaker(name)
      if (b.openUntil !== null && Date.now() < b.openUntil) return 'down'
      if (b.failureCount > 0) return 'degraded'
      return 'reachable'
    }
    return {
      gemini: status(this.gemini.name),
      mock: 'reachable', // mock is always reachable
    }
  }

  async extract(transcript: string): Promise<ExtractionResult> {
    // Try Gemini unless circuit is open
    if (!this.isOpen(this.gemini.name)) {
      try {
        const result = await this.gemini.extract(transcript)
        this.recordSuccess(this.gemini.name)
        return result
      } catch (err) {
        this.recordFailure(this.gemini.name)
        console.warn(`[ResilientExtractor] Gemini failed, falling through to Mock:`, err)
      }
    } else {
      console.warn(`[ResilientExtractor] Gemini circuit open, skipping to Mock`)
    }

    // Final fallback — always succeeds
    const result = await this.mock.extract(transcript)
    return result
  }
}

// Singleton for use across the app
export const resilientExtractor = new ResilientObservationExtractor()
