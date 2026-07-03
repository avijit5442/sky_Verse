export type AstronomyEvent = {
  id: string
  title: string
  type: 'Planet' | 'Moon' | 'Meteor' | 'Constellation'
  description: string
  visibility: 'High' | 'Medium' | 'Low'
}

export type AstronomySnapshot = {
  phase: string
  bestTarget: string
  highlight: string
  events: AstronomyEvent[]
}

type AstronomyApiResponse = {
  phase?: string
  moon_phase?: string
  best_target?: string
  highlight?: string
  events?: Array<{
    title: string
    type: AstronomyEvent['type']
    description: string
    visibility: AstronomyEvent['visibility']
  }>
}

async function fetchAstronomyData(location?: { latitude: number; longitude: number }): Promise<AstronomyApiResponse | null> {
  try {
    const latitude = location?.latitude ?? 20.5937
    const longitude = location?.longitude ?? 78.9629
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code&current=temperature_2m&timezone=auto`)
    if (!response.ok) return null

    const data = await response.json()
    const currentTemperature = data?.current?.temperature_2m
    const weatherCode = data?.daily?.weather_code?.[0]

    if (typeof currentTemperature !== 'number' || typeof weatherCode !== 'number') return null

    const weatherLabel = weatherCode === 0 ? 'Clear' : weatherCode < 50 ? 'Cloudy' : 'Rainy'
    const phaseLabel = currentTemperature > 20 ? 'Bright Moon' : 'Quiet Sky'
    const bestTarget = weatherLabel === 'Clear' ? 'Mars' : weatherLabel === 'Cloudy' ? 'Moon' : 'Saturn'
    const highlight = weatherLabel === 'Clear'
      ? 'Low cloud cover keeps the target visible for a phone AR session.'
      : weatherLabel === 'Cloudy'
        ? 'Clouds are present, so the shared sky scene should shift toward a guided or ceiling view.'
        : 'Poor conditions suggest shorter observing windows and stronger guidance.'

    return {
      phase: phaseLabel,
      best_target: bestTarget,
      highlight,
      events: [
        {
          title: 'Sky Conditions',
          type: 'Moon',
          description: `The sky currently looks ${weatherLabel.toLowerCase()} with ${currentTemperature}°C.`,
          visibility: weatherLabel === 'Clear' ? 'High' : 'Medium',
        },
        {
          title: 'Best Viewing Target',
          type: 'Planet',
          description: `The best target is ${bestTarget} under current conditions.`,
          visibility: 'High',
        },
      ],
    }
  } catch {
    return null
  }
}

function createFallbackSnapshot(): AstronomySnapshot {
  return {
    phase: 'Data unavailable',
    bestTarget: 'Mars',
    highlight: 'Live celestial data is unavailable right now. Showing offline fallback.',
    events: [
      {
        id: 'fallback-mars',
        title: 'Mars Visibility',
        type: 'Planet',
        description: 'Offline fallback mode. Connect to a live astronomy source for live data.',
        visibility: 'Medium',
      },
    ],
  }
}

export async function getAstronomySnapshot(location?: { latitude: number; longitude: number }): Promise<AstronomySnapshot> {
  const apiData = await fetchAstronomyData(location)

  if (!apiData) {
    return createFallbackSnapshot()
  }

  return {
    phase: apiData.phase ?? 'Unknown',
    bestTarget: apiData.best_target ?? 'Mars',
    highlight: apiData.highlight ?? 'Live celestial data loaded.',
    events: (apiData.events ?? []).map((event, index) => ({
      id: `${event.title}-${index}`,
      title: event.title,
      type: event.type,
      description: event.description,
      visibility: event.visibility,
    })),
  }
}
