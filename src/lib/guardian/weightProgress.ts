import type { GuardianAnimal } from '@/types'

export interface WeightProgress {
  /** 0–100, how close the latest recorded weight is to `targetWeight`. */
  progress: number
  latestWeight: number
  targetWeight: number
  /** True once within 3% of target — treated as "goal reached" in the UI. */
  onTrack: boolean
}

/**
 * Derives Recovery Ring progress from data that actually exists on the
 * Animal record (`targetWeight`) and its most recent WeightRecord — no
 * synthetic numbers. Returns null when either input is missing (no goal
 * set yet, or no weight logged yet), and the UI renders a neutral empty
 * ring rather than inventing a percentage.
 */
export function getWeightProgress(animal: GuardianAnimal): WeightProgress | null {
  const targetWeight = animal.targetWeight
  const latestWeight = animal.weightRecords?.[0]?.weight

  if (!targetWeight || latestWeight == null) return null

  const diff = Math.abs(latestWeight - targetWeight)
  const progress = Math.max(0, Math.min(100, 100 - (diff / targetWeight) * 100))

  return {
    progress,
    latestWeight,
    targetWeight,
    onTrack: diff / targetWeight <= 0.03,
  }
}
