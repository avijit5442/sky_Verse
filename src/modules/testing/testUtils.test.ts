import { describe, expect, it } from 'vitest'
import { getModuleHealthChecks } from './testUtils'

describe('getModuleHealthChecks', () => {
  it('returns progress percentages for each module', () => {
    const checks = getModuleHealthChecks()

    expect(checks.length).toBeGreaterThan(0)
    expect(checks[0]).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        status: expect.any(String),
        progress: expect.any(Number),
      }),
    )

    checks.forEach((check) => {
      expect(check.progress).toBeGreaterThanOrEqual(0)
      expect(check.progress).toBeLessThanOrEqual(100)
    })
  })
})
