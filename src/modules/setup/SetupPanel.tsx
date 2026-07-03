import { useState } from 'react'
import type { SkyMode } from '../modeManager'

type SetupPanelProps = {
  title?: string
  description?: string
  onConfigChange?: (config: { preset: string; mode: SkyMode; location: { latitude: number; longitude: number } }) => void
}

const modeProfiles = {
  Urban: { hint: 'Bright city lights; use AR guidance and focus on bright planets and lunar details.' },
  Suburban: { hint: 'Balanced conditions; ideal for a mixed visual and audio experience with shared sky context.' },
  'Dark Sky': { hint: 'Excellent visibility; use the full celestial view and prepare for ceiling projection mode.' },
}

const presets = ['Urban', 'Suburban', 'Dark Sky'] as const

const presetLocations: Record<(typeof presets)[number], { latitude: number; longitude: number }> = {
  Urban: { latitude: 40.7128, longitude: -74.006 },
  Suburban: { latitude: 34.0522, longitude: -118.2437 },
  'Dark Sky': { latitude: 34.4222, longitude: -119.6990 },
}

export function SetupPanel({
  title = 'Observation Setup',
  description = 'Tune the experience for your current observation environment.',
  onConfigChange,
}: SetupPanelProps) {
  const [preset, setPreset] = useState('Suburban')
  const [mode, setMode] = useState<SkyMode>('AR')
  const [latitude, setLatitude] = useState(String(presetLocations.Suburban.latitude))
  const [longitude, setLongitude] = useState(String(presetLocations.Suburban.longitude))

  const emitConfig = (nextPreset: string, nextMode: SkyMode, nextLatitude: number, nextLongitude: number) => {
    onConfigChange?.({ preset: nextPreset, mode: nextMode, location: { latitude: nextLatitude, longitude: nextLongitude } })
  }

  const handlePresetChange = (value: string) => {
    const nextPreset = value as (typeof presets)[number]
    const nextLocation = presetLocations[nextPreset]
    setPreset(nextPreset)
    setLatitude(String(nextLocation.latitude))
    setLongitude(String(nextLocation.longitude))
    emitConfig(nextPreset, mode, nextLocation.latitude, nextLocation.longitude)
  }

  const handleModeChange = (value: string) => {
    const nextMode = value as SkyMode
    setMode(nextMode)
    emitConfig(preset, nextMode, Number(latitude), Number(longitude))
  }

  const handleLatitudeChange = (value: string) => {
    setLatitude(value)
    const numericLatitude = Number.parseFloat(value)
    if (Number.isFinite(numericLatitude)) {
      emitConfig(preset, mode, numericLatitude, Number(longitude))
    }
  }

  const handleLongitudeChange = (value: string) => {
    setLongitude(value)
    const numericLongitude = Number.parseFloat(value)
    if (Number.isFinite(numericLongitude)) {
      emitConfig(preset, mode, Number(latitude), numericLongitude)
    }
  }

  return (
    <section className="setup-panel" aria-label="Observation setup">
      <div className="setup-panel__header">
        <div>
          <p className="setup-panel__eyebrow">Setup</p>
          <h3>{title}</h3>
        </div>
        <span className="setup-panel__badge">Ready</span>
      </div>

      <p className="setup-panel__description">{description}</p>

      <div className="setup-panel__grid">
        <label className="setup-panel__field">
          <span>Location preset</span>
          <select value={preset} onChange={(event) => handlePresetChange(event.target.value)}>
            {presets.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="setup-panel__field">
          <span>Observation mode</span>
          <select value={mode} onChange={(event) => handleModeChange(event.target.value)}>
            <option value="AR">AR</option>
            <option value="Ceiling">Ceiling</option>
            <option value="Weather">Weather</option>
            <option value="Educational">Guided</option>
            <option value="Minimal">Minimal</option>
            <option value="TimeTravel">Time Travel</option>
          </select>
        </label>
      </div>

      <div className="setup-panel__grid">
        <label className="setup-panel__field">
          <span>Latitude</span>
          <input type="number" step="0.0001" value={latitude} onChange={(event) => handleLatitudeChange(event.target.value)} />
        </label>

        <label className="setup-panel__field">
          <span>Longitude</span>
          <input type="number" step="0.0001" value={longitude} onChange={(event) => handleLongitudeChange(event.target.value)} />
        </label>
      </div>

      <p className="setup-panel__summary">
        Current profile: {preset} • {mode}
      </p>
      <p className="card-meta">
        {modeProfiles[preset as keyof typeof modeProfiles]?.hint ?? 'Adjust the profile to tailor the experience.'}
      </p>
    </section>
  )
}
