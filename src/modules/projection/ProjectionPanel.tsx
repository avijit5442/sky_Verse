import './projectionStyles.css'
import type { SkyMode } from '../modeManager'

type ProjectionPanelProps = {
  title?: string
  description?: string
  activeMode?: SkyMode
  projectionReady?: boolean
}

export function ProjectionPanel({
  title = 'Ceiling Projection',
  description = 'Projection-mode visualization for shared ceilings and planetarium-style displays.',
  activeMode = 'AR',
  projectionReady = false,
}: ProjectionPanelProps) {
  const isProjection = activeMode === 'Ceiling'
  const projectionState = isProjection ? 'Projection grid and ambient calibration active.' : 'Projection mode is ready when Ceiling is selected.'
  const calibrationMessage = projectionReady ? 'Projection calibration: OK' : 'Projection calibration: calibrating — follow sensor hints.'

  return (
    <section className="service-card" aria-label="Projection experience">
      <div className="panel-heading">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className={`projection-preview${isProjection ? ' projection-preview--active' : ''}`}>
        <div className="projection-preview__frame" />
        <div className="projection-preview__grid" />
        <div className="projection-preview__message">{projectionState}</div>
        <div className="projection-preview__calibration">{calibrationMessage}</div>
      </div>
      <p className="card-meta">Projection support is integrated into the shared scene and mode manager.</p>
    </section>
  )
}
