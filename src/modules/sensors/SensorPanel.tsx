import type { SensorReading } from './sensorService'

type SensorPanelProps = {
  readings: SensorReading[]
  title?: string
  description?: string
}

export function SensorPanel({
  readings,
  title = 'Sensor Service',
  description = 'Live device sensor state for orientation, projection readiness, and environmental telemetry.',
}: SensorPanelProps) {
  return (
    <section className="service-card" aria-label="Sensor service">
      <div className="panel-heading">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="service-list">
        {readings.map((reading) => (
          <article className="service-item" key={reading.label}>
            <div>
              <p className="card-title">{reading.label}</p>
              <p className="card-meta">{reading.value}</p>
            </div>
            <span className="status-pill">{reading.status}</span>
          </article>
        ))}
      </div>
    </section>
  )
}
