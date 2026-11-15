import { describe, expect, it } from 'vitest'
import { demoCandidates } from './demo'

describe('demo candidate ranking', () => {
  it('is ordered by score and has explainable components', () => {
    const scores = demoCandidates.map((candidate) => candidate.score)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
    expect(demoCandidates.every((candidate) => Object.keys(candidate.breakdown).length === 4)).toBe(true)
  })
})

