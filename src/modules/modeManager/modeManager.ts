export type SkyMode = 'AR' | 'Ceiling' | 'Weather' | 'Educational' | 'Minimal' | 'TimeTravel'

export type ModeState = {
  activeMode: SkyMode
  cameraMode: 'phone' | 'ceiling' | 'planetarium'
  label: string
}

const defaultModeState: ModeState = {
  activeMode: 'AR',
  cameraMode: 'phone',
  label: 'Live View',
}

export function getDefaultModeState() {
  return defaultModeState
}

export function getModeConfig(mode: SkyMode): ModeState {
  const configs: Record<SkyMode, ModeState> = {
    AR: { activeMode: 'AR', cameraMode: 'phone', label: 'Live View' },
    Ceiling: { activeMode: 'Ceiling', cameraMode: 'ceiling', label: 'Ceiling Projection' },
    Weather: { activeMode: 'Weather', cameraMode: 'planetarium', label: 'Weather Overlay' },
    Educational: { activeMode: 'Educational', cameraMode: 'planetarium', label: 'Guided Tour' },
    Minimal: { activeMode: 'Minimal', cameraMode: 'phone', label: 'Minimal View' },
    TimeTravel: { activeMode: 'TimeTravel', cameraMode: 'planetarium', label: 'Time Travel' },
  }

  return configs[mode]
}
