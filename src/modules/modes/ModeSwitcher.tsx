import { useEffect, useState } from 'react'
import type { SkyMode } from '../modeManager'

const modes = [
  { id: 'AR', label: 'Live View', description: 'Phone AR guidance' },
  { id: 'Ceiling', label: 'Ceiling', description: 'Projection-style view' },
  { id: 'Weather', label: 'Weather', description: 'Forecast overlay' },
  { id: 'Educational', label: 'Guided Tour', description: 'Narrated experience' },
  { id: 'Minimal', label: 'Minimal', description: 'Simplified view' },
  { id: 'TimeTravel', label: 'Time Travel', description: 'Past and future sky' },
] as const

type ModeSwitcherProps = {
  title?: string
  activeMode?: SkyMode
  onModeChange?: (mode: SkyMode) => void
}

export function ModeSwitcher({ title = 'Observation Modes', activeMode, onModeChange }: ModeSwitcherProps) {
  const [selectedMode, setSelectedMode] = useState<SkyMode>(activeMode ?? modes[0].id)

  useEffect(() => {
    if (activeMode) {
      setSelectedMode(activeMode)
    }
  }, [activeMode])

  const handleModeChange = (mode: SkyMode) => {
    setSelectedMode(mode)
    onModeChange?.(mode)
  }

  return (
    <section className="service-card" aria-label="Observation modes">
      <div className="panel-heading">
        <h2>{title}</h2>
        <p>Choose how the sky experience should behave.</p>
      </div>

      <div className="mode-switcher">
        {modes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`mode-pill${selectedMode === mode.id ? ' mode-pill--active' : ''}`}
            onClick={() => handleModeChange(mode.id)}
          >
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      <p className="mode-hint">
        Active mode: {modes.find((mode) => mode.id === selectedMode)?.label ?? 'Live View'}
      </p>
    </section>
  )
}
