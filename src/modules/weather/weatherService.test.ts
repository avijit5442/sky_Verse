import { describe, expect, it } from 'vitest'
import { getWeatherConditionLabel } from './weatherService'

describe('getWeatherConditionLabel', () => {
  it('returns cloudy when the sky is overcast but there is no precipitation', () => {
    expect(getWeatherConditionLabel({ weather_code: 3, windspeed: 8, precipitation: 0, cloud_cover: 82 })).toBe('Cloudy')
  })

  it('returns rain when precipitation is present', () => {
    expect(getWeatherConditionLabel({ weather_code: 61, windspeed: 8, precipitation: 0.4, cloud_cover: 88 })).toBe('Rain')
  })
})
