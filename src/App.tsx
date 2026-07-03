import './App.css'
import { SkyScene } from './modules/skyScene'
import { SetupPanel } from './modules/setup'
import { getAstronomySnapshot } from './modules/astronomy'
import { getWeatherSummary } from './modules/weather'
import { getSensorReadings, SensorPanel } from './modules/sensors'
import { ARPanel } from './modules/ar'
import { ModeSwitcher } from './modules/modes'
import { VoicePanel } from './modules/voice'
import { ProjectionPanel } from './modules/projection'
import { TestingPanel } from './modules/testing'
import { SatellitePanel, getSatellitePassSummary } from './modules/satellites'
import { getDefaultModeState, type SkyMode } from './modules/modeManager'
import { useEffect, useRef, useState } from 'react'
import { getModeConfig } from './modules/modeManager/modeManager'

function App() {  
  const [weatherSummary, setWeatherSummary] = useState<Awaited<ReturnType<typeof getWeatherSummary>> | null>(null)
  const [sensorReadings, setSensorReadings] = useState(getSensorReadings())
  const modeState = getDefaultModeState()
  const [activeMode, setActiveMode] = useState<SkyMode>(modeState.activeMode)
  const [modeLabel, setModeLabel] = useState(modeState.label)
  const [setupConfig, setSetupConfig] = useState<{ preset: string; mode: SkyMode; location: { latitude: number; longitude: number } }>({ preset: 'Suburban', mode: 'AR', location: { latitude: 34.0522, longitude: -118.2437 } })
  const [astronomySnapshot, setAstronomySnapshot] = useState<{ phase: string; bestTarget: string; highlight: string; events: Array<{ id: string; title: string; type: string; description: string; visibility: string }> } | null>(null)
  const [satelliteSummary, setSatelliteSummary] = useState<Awaited<ReturnType<typeof getSatellitePassSummary>> | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showOverlays, setShowOverlays] = useState(true)
  const [sceneMessage, setSceneMessage] = useState('Speak a command: Hey Projector ...')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [locationStatus, setLocationStatus] = useState('Detecting GPS…')

  useEffect(() => {
    const timeIntervalId = window.setInterval(() => {
      setCurrentTime(new Date())
    }, 1_000)

    return () => {
      window.clearInterval(timeIntervalId)
    }
  }, [])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setLocationStatus('GPS unavailable')
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setSetupConfig((current) => ({
          ...current,
          location: { latitude: coords.latitude, longitude: coords.longitude },
        }))
        setLocationStatus('Live GPS')
      },
      () => {
        setLocationStatus('GPS unavailable')
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    )
  }, [])

  const refreshLiveData = () => {
    setIsRefreshing(true)

    void Promise.allSettled([
      getAstronomySnapshot(setupConfig.location),
      getWeatherSummary(setupConfig.location),
      getSatellitePassSummary(setupConfig.location),
    ]).then(([astronomyResult, weatherResult, satelliteResult]) => {
      if (astronomyResult.status === 'fulfilled') {
        setAstronomySnapshot(astronomyResult.value)
      }

      if (weatherResult.status === 'fulfilled') {
        setWeatherSummary(weatherResult.value)
      }

      if (satelliteResult.status === 'fulfilled') {
        setSatelliteSummary(satelliteResult.value)
      }
    }).finally(() => {
      setLastUpdated(new Date())
      setIsRefreshing(false)
    })
  }

  useEffect(() => {
    refreshLiveData()

    const intervalId = window.setInterval(refreshLiveData, 5 * 60_000)

    const sensorIntervalId = window.setInterval(() => {
      setSensorReadings(getSensorReadings())
    }, 5_000)

    return () => {
      window.clearInterval(intervalId)
      window.clearInterval(sensorIntervalId)
    }
  }, [setupConfig.location])

  const previousModeRef = useRef<SkyMode>(activeMode)

  useEffect(() => {
    const hasJustEnteredCeiling = activeMode === 'Ceiling' && previousModeRef.current !== 'Ceiling'

    if (hasJustEnteredCeiling && drawerOpen) {
      const timeoutId = window.setTimeout(() => {
        setDrawerOpen(false)
      }, 0)

      return () => {
        window.clearTimeout(timeoutId)
      }
    }

    previousModeRef.current = activeMode
    return undefined
  }, [activeMode, drawerOpen])

  const syncMode = (mode: SkyMode) => {
    const nextMode = getModeConfig(mode)
    setActiveMode(nextMode.activeMode)
    setModeLabel(nextMode.label)
    setSetupConfig((current) => ({ ...current, mode: nextMode.activeMode }))
  }

  const handleModeChange = (mode: SkyMode) => {
    syncMode(mode)
  }

  const handleSetupConfigChange = (config: { preset: string; mode: SkyMode; location: { latitude: number; longitude: number } }) => {
    setSetupConfig(config)
    syncMode(config.mode)
  }

  const handleVoiceCommand = (command: string) => {
    const wakePhrase = 'hey projector'
    const normalized = command.toLowerCase()
    const stripped = normalized.replace(new RegExp(wakePhrase, 'gi'), '').trim()
    const commandText = stripped.length > 0 ? stripped : normalized

    const matches = (phrases: string[]) => phrases.some((phrase) => commandText.includes(phrase))
    const firstEvent = astronomySnapshot?.events?.[0]
    const eventText = firstEvent ? `${firstEvent.title} (${firstEvent.visibility} visibility)` : 'No specific night event loaded.'

    if (matches(['switch to ar', 'ar mode', 'augmented reality', 'show planets', 'satellite tracking', 'live view'])) {
      handleModeChange('AR')
      setShowOverlays(true)
      setSceneMessage('Hey Projector → AR mode engaged. Live sky controls are active.')
      return
    }

    if (matches(['switch to ceiling', 'ceiling mode', 'projection mode', 'projection'])) {
      handleModeChange('Ceiling')
      setSceneMessage('Hey Projector → Ceiling projection mode enabled.')
      return
    }

    if (matches(['weather mode', 'show weather', 'weather'])) {
      handleModeChange('Weather')
      setSceneMessage('Hey Projector → Weather overlay mode activated.')
      return
    }

    if (matches(['educational mode', 'start tour', 'guided tour', 'learn', 'lesson', 'show constellations'])) {
      handleModeChange('Educational')
      setSceneMessage('Hey Projector → Educational mode ready for guided stargazing.')
      return
    }

    if (matches(['hide labels', 'hide overlays'])) {
      setShowOverlays(false)
      setSceneMessage('Hey Projector → labels hidden for a clean projection.')
      return
    }

    if (matches(['show labels', 'show overlays'])) {
      setShowOverlays(true)
      setSceneMessage('Hey Projector → labels restored.')
      return
    }

    if (matches(['reset view', 'reset scene', 'default view'])) {
      syncMode('AR')
      setShowOverlays(true)
      setSceneMessage('Hey Projector → view reset to Live View.')
      return
    }

    if (matches(['what is visible tonight', 'whats visible tonight', 'visible tonight', 'tonight'])) {
      setSceneMessage(`Hey Projector → Tonight: ${astronomySnapshot?.bestTarget ?? 'bright objects'}. ${eventText}`)
      return
    }

    setSceneMessage(`Voice command heard: "${command}"`)
    setModeLabel(`Voice: ${command}`)
  }

  const projectionSensor = sensorReadings.find((s) => s.label === 'Projection sensor')
  const isProjectionReady = projectionSensor?.status === 'Stable'

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">SkyVerse AI</p>
          <h1>Single-screen astronomy experience</h1>
        </div>
        <div className="topbar__meta">
          <div className="topbar__pill">Phone AR MVP • Shared Engine • Ceiling Projection Ready</div>
          <div className="topbar__clock" aria-label="Current time">
            <span className="topbar__clock-label">Current time</span>
            <strong>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
          </div>
          <div className="topbar__refresh" aria-label="Auto-refresh status">
            <span className="topbar__clock-label">Auto-refresh</span>
            <strong>Every 5 min</strong>
          </div>
          <div className="topbar__gps" aria-label="GPS status">
            <span className="topbar__clock-label">GPS</span>
            <strong>{locationStatus}</strong>
          </div>
          <button type="button" className="topbar__refresh-btn" onClick={refreshLiveData} disabled={isRefreshing}>
            {isRefreshing ? 'Refreshing…' : 'Refresh now'}
          </button>
        </div>
      </header>

      <button type="button" className="modules-toggle" onClick={() => setDrawerOpen((open) => !open)}>
        {drawerOpen ? 'Hide modules' : 'Open modules'}
      </button>

      <div className={`drawer-backdrop ${drawerOpen ? 'drawer-backdrop--visible' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`details-drawer ${drawerOpen ? 'details-drawer--open' : ''}`}>
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Modules</p>
            <h2>Hidden panels</h2>
          </div>
          <button type="button" className="drawer-close" onClick={() => setDrawerOpen(false)}>
            Close
          </button>
        </div>

        <div className="drawer-body">
          <section className="service-card" aria-label="Architecture summary">
            <div className="panel-heading">
              <h2>Architecture</h2>
              <p>Only the shared sky scene appears on the main stage.</p>
            </div>
            <ul>
              <li>One shared sky scene for AR and ceiling projection</li>
              <li>Live astronomy, weather, satellite, and sensor states in the drawer</li>
              <li>Mode manager, voice panel, and setup remain hidden until requested</li>
            </ul>
          </section>

          <ModeSwitcher activeMode={activeMode} onModeChange={handleModeChange} />
          <ProjectionPanel activeMode={activeMode} projectionReady={!!isProjectionReady} />
          <SensorPanel readings={sensorReadings} />
          <ARPanel activeMode={modeLabel} />
          <SetupPanel onConfigChange={handleSetupConfigChange} />
          <SatellitePanel summary={satelliteSummary} />
          <VoicePanel onCommand={handleVoiceCommand} />
          <TestingPanel />

          <section className="service-card" aria-label="Astronomy service">
            <div className="panel-heading">
              <h2>Astronomy Service</h2>
              <p>{astronomySnapshot?.highlight ?? 'Loading celestial data...'}</p>
            </div>
            <div className="weather-summary">
              <p><strong>Phase:</strong> {astronomySnapshot?.phase ?? 'Loading...'}</p>
              <p><strong>Best target:</strong> {astronomySnapshot?.bestTarget ?? 'Loading...'}</p>
            </div>
            <div className="service-list">
              {(astronomySnapshot?.events ?? []).map((event) => (
                <article className="service-item" key={event.id}>
                  <div>
                    <p className="card-title">{event.title}</p>
                    <p className="card-meta">{event.description}</p>
                  </div>
                  <span className="status-pill">{event.visibility}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="service-card" aria-label="Weather service">
            <div className="panel-heading">
              <h2>Weather Service</h2>
              <p>Weather overlays and conditions for observation planning.</p>
            </div>
            <div className="weather-summary">
              <p><strong>Condition:</strong> {weatherSummary?.condition ?? 'Loading...'}</p>
              <p><strong>Visibility:</strong> {weatherSummary?.visibility ?? 'Loading...'}</p>
              <p><strong>Temperature:</strong> {weatherSummary?.temperature ?? 'Loading...'}</p>
              <p><strong>Recommendation:</strong> {weatherSummary?.recommendation ?? 'Loading...'}</p>
              <p><strong>Source:</strong> {weatherSummary?.source ?? 'Loading...'}</p>
              <p><strong>Updated:</strong> {weatherSummary?.updatedAt ?? 'Loading...'}</p>
              <p className="card-meta">Live weather data is fetched from Open-Meteo and shown in the same service panel pattern as astronomy.</p>
            </div>
          </section>
        </div>
      </aside>

      <main className="content-grid">
        <section className="roadmap-panel">
          <SkyScene
            title="SkyScene"
            description="One shared celestial scene designed first for phone AR and later reused for ceiling projection without changing the rendering engine."
            activeMode={activeMode}
            modeLabel={modeLabel}
            showOverlays={showOverlays}
            onToggleOverlays={() => setShowOverlays((current) => !current)}
            sceneMessage={sceneMessage}
            weatherSummary={weatherSummary?.condition ?? 'Loading weather'}
            astronomySummary={astronomySnapshot?.phase ?? 'Loading astronomy'}
            bestTarget={astronomySnapshot?.bestTarget ?? 'Mars'}
            visibility={astronomySnapshot?.events?.[0]?.visibility ?? 'High'}
            locationLabel={`${setupConfig.location.latitude.toFixed(2)}, ${setupConfig.location.longitude.toFixed(2)}`}
            temperature={weatherSummary?.temperature ?? '18°C'}
            recommendation={weatherSummary?.recommendation ?? 'Live sky conditions will appear here.'}
          />

          <div className="roadmap-note">
            Use the modules drawer to open mode controls, projection state, sensors, weather, and satellite data.
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
