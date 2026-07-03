export type SatellitePass = {
  id: string
  name: string
  nextVisible: string
  durationMinutes: number
  elevation: string
}

export type SatellitePassSummary = {
  locationLabel: string
  nextPass: SatellitePass
  upcomingPasses: SatellitePass[]
  recommendation: string
  updatedAt: string
}

const satelliteTargets = [
  { name: 'ISS', baseElevation: 75 },
  { name: 'Hubble', baseElevation: 62 },
  { name: 'Starlink', baseElevation: 48 },
]

function getNextPassTime(offsetMinutes: number) {
  const date = new Date(Date.now() + offsetMinutes * 60_000)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatElevation(value: number) {
  return `${Math.round(value)}° elevation`
}

export async function getSatellitePassSummary(location?: { latitude: number; longitude: number }): Promise<SatellitePassSummary> {
  const latitude = location?.latitude ?? 34.0522
  const longitude = location?.longitude ?? -118.2437

  const nextPassIndex = Math.floor((Math.abs(latitude) + Math.abs(longitude)) % satelliteTargets.length)
  const nextPassTarget = satelliteTargets[nextPassIndex]
  const currentMinuteOffset = Math.round((latitude + Math.abs(longitude)) % 90)
  const passDuration = 3 + (Math.abs(latitude) % 10)
  const elevationValue = nextPassTarget.baseElevation + ((Math.abs(longitude) % 15) - 7)

  const nextPass: SatellitePass = {
    id: `${nextPassTarget.name}-${currentMinuteOffset}`,
    name: nextPassTarget.name,
    nextVisible: getNextPassTime(15 + currentMinuteOffset),
    durationMinutes: passDuration,
    elevation: formatElevation(elevationValue),
  }

  const upcomingPasses = satelliteTargets.map((target, index) => ({
    id: `${target.name}-${index}`,
    name: target.name,
    nextVisible: getNextPassTime(30 + index * 12),
    durationMinutes: passDuration - index,
    elevation: formatElevation(target.baseElevation - index * 7),
  }))

  return {
    locationLabel: `Lat ${latitude.toFixed(2)}, Lon ${longitude.toFixed(2)}`,
    nextPass,
    upcomingPasses,
    recommendation: `Focus on ${nextPass.name} for the next visible pass; the shared sky scene can highlight bright orbital objects when in guided mode.`,
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }
}
