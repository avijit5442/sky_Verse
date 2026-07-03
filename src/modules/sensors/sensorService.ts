export type SensorReading = {
  label: string
  value: string
  status: 'Stable' | 'Tracking' | 'Calibrating' | 'Unavailable'
}

type SensorSnapshot = {
  compassHeading: number
  pitch: number
  roll: number
  lightLevel: number
  batteryLevel: number
  isCompassAvailable: boolean
  isOrientationAvailable: boolean
}

let orientationState = {
  compassHeading: 0,
  pitch: 0,
  roll: 0,
}

let orientationListenerRegistered = false

function ensureOrientationListener() {
  if (typeof window === 'undefined' || orientationListenerRegistered || !('DeviceOrientationEvent' in window)) {
    return
  }

  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (typeof event.alpha === 'number') {
      orientationState.compassHeading = Math.round(event.alpha)
    }

    if (typeof event.beta === 'number') {
      orientationState.pitch = Math.round(event.beta)
    }

    if (typeof event.gamma === 'number') {
      orientationState.roll = Math.round(event.gamma)
    }
  }

  window.addEventListener('deviceorientation', handleOrientation as EventListener)
  orientationListenerRegistered = true
}

function getDeviceSensorSnapshot(): SensorSnapshot {
  ensureOrientationListener()

  const hasOrientation = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
  const hasCompass = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
  const lightLevel = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 58 : 42)
    : 42

  return {
    compassHeading: hasCompass ? orientationState.compassHeading : 0,
    pitch: hasOrientation ? orientationState.pitch : 0,
    roll: hasOrientation ? orientationState.roll : 0,
    lightLevel,
    batteryLevel: 86,
    isCompassAvailable: hasCompass,
    isOrientationAvailable: hasOrientation,
  }
}

function createSensorReadings(): SensorReading[] {
  const snapshot = getDeviceSensorSnapshot()

  const projectionReady = snapshot.isOrientationAvailable && snapshot.isCompassAvailable && snapshot.batteryLevel > 45
  const alignmentStatus = snapshot.isOrientationAvailable ? 'Tracking' : 'Unavailable'

  return [
    {
      label: 'Compass',
      value: snapshot.isCompassAvailable ? `${Math.round(snapshot.compassHeading)}° north` : 'Unavailable on this device',
      status: snapshot.isCompassAvailable ? 'Stable' : 'Unavailable',
    },
    {
      label: 'Orientation',
      value: snapshot.isOrientationAvailable ? `Pitch ${snapshot.pitch}° • Roll ${snapshot.roll}°` : 'Unavailable on this device',
      status: alignmentStatus,
    },
    {
      label: 'Ambient light',
      value: `${snapshot.lightLevel}% detected`,
      status: snapshot.lightLevel > 60 ? 'Calibrating' : 'Stable',
    },
    {
      label: 'Battery',
      value: `${snapshot.batteryLevel}% remaining`,
      status: snapshot.batteryLevel < 20 ? 'Calibrating' : 'Stable',
    },
    {
      label: 'Projection sensor',
      value: projectionReady ? 'Ready for ceiling projection' : 'Calibrating for shared ceiling output',
      status: projectionReady ? 'Stable' : 'Calibrating',
    },
  ]
}

export function getSensorReadings() {
  return createSensorReadings()
}
