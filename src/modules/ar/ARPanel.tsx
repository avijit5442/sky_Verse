type ARPanelProps = {
  title?: string
  description?: string
  activeMode?: string
}

export function ARPanel({ title = 'AR Overlay', description = 'Augmented sky guidance for the next observation target.', activeMode = 'Live View' }: ARPanelProps) {
  const normalizedMode = activeMode?.toLowerCase() ?? ''
  const isCeilingMode = normalizedMode.includes('ceiling') || normalizedMode.includes('tour') || normalizedMode.includes('projection')
  const isWeatherMode = normalizedMode.includes('weather')
  const isMinimalMode = normalizedMode.includes('minimal')
  const label = isCeilingMode
    ? 'Ceiling projection mode ready'
    : isWeatherMode
      ? 'Weather overlay tuned for visibility'
      : isMinimalMode
        ? 'Minimal view focused on the target'
        : 'Phone AR overlay active'

  return (
    <section className="service-card" aria-label="AR experience">
      <div className="panel-heading">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className={`ar-preview${isCeilingMode ? ' ar-preview--ceiling' : ''}`}>
        <div className="ar-preview__target" />
        <div className="ar-preview__ring" />
        <div className="ar-preview__label">{label}</div>
      </div>
      <p className="card-meta">Orientation-aware guidance is now tied to the selected mode and target context.</p>
    </section>
  )
}
