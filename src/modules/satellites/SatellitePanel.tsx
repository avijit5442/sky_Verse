import type { SatellitePassSummary } from './satelliteService'

type SatellitePanelProps = {
  summary?: SatellitePassSummary | null
  title?: string
}

export function SatellitePanel({ summary, title = 'Satellite Passes' }: SatellitePanelProps) {
  const nextPass = summary?.nextPass

  return (
    <section className="service-card" aria-label="Satellite tracking">
      <div className="panel-heading">
        <h2>{title}</h2>
        <p>Visible orbit passes for the selected observation location.</p>
      </div>

      {summary ? (
        <div className="weather-summary">
          <p><strong>Location:</strong> {summary.locationLabel}</p>
          <p><strong>Next visible pass:</strong> {nextPass?.name} at {nextPass?.nextVisible}</p>
          <p><strong>Pass duration:</strong> {nextPass?.durationMinutes} min</p>
          <p><strong>Elevation:</strong> {nextPass?.elevation}</p>
          <p><strong>Recommendation:</strong> {summary.recommendation}</p>
          <p><strong>Updated:</strong> {summary.updatedAt}</p>
        </div>
      ) : (
        <p className="card-meta">Loading satellite pass data...</p>
      )}

      {summary ? (
        <div className="service-list">
          {summary.upcomingPasses.slice(0, 3).map((pass) => (
            <article className="service-item" key={pass.id}>
              <div>
                <p className="card-title">{pass.name}</p>
                <p className="card-meta">Visible at {pass.nextVisible}</p>
              </div>
              <span className="status-pill">{pass.elevation}</span>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
