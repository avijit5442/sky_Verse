import { getModuleHealthChecks } from './testUtils'

type TestingPanelProps = {
  title?: string
}

export function TestingPanel({ title = 'System Testing' }: TestingPanelProps) {
  const checks = getModuleHealthChecks()

  return (
    <section className="service-card" aria-label="System testing">
      <div className="panel-heading">
        <h2>{title}</h2>
        <p>Health checks for the connected experience modules.</p>
      </div>

      <div className="service-list">
        {checks.map((check) => (
          <article className="service-item" key={check.name}>
            <div>
              <p className="card-title">{check.name}</p>
              <p className="card-meta">{check.status} • {check.progress}% complete</p>
            </div>
            <span className="status-pill">{check.progress}%</span>
          </article>
        ))}
      </div>
    </section>
  )
}
