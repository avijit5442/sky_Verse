import { useMemo, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

type SkySceneProps = {
  title?: string
  description?: string
  activeMode?: string
  modeLabel?: string
  weatherSummary?: string
  astronomySummary?: string
  bestTarget?: string
  visibility?: string
  locationLabel?: string
  temperature?: string
  recommendation?: string
  showOverlays?: boolean
  onToggleOverlays?: () => void
  sceneMessage?: string
}

function getSceneVariant(activeMode = 'Live View') {
  const normalizedMode = activeMode.toLowerCase()

  if (normalizedMode.includes('ceiling') || normalizedMode.includes('projection')) {
    return 'ceiling'
  }

  if (normalizedMode.includes('weather')) {
    return 'weather'
  }

  if (normalizedMode.includes('tour') || normalizedMode.includes('educational')) {
    return 'guided'
  }

  if (normalizedMode.includes('timetravel') || normalizedMode.includes('time travel')) {
    return 'timetravel'
  }

  if (normalizedMode.includes('minimal')) {
    return 'minimal'
  }

  return 'default'
}

const stars = Array.from({ length: 90 }, (_, index) => ({
  id: index,
  size: 1 + (index % 5),
  left: `${(index * 13) % 100}%`,
  top: `${(index * 17) % 100}%`,
  opacity: 0.35 + (index % 6) * 0.1,
}))

const majorStars = [
  { id: 'sirius', name: 'Sirius', left: '18%', top: '24%', size: '8px' },
  { id: 'betelgeuse', name: 'Betelgeuse', left: '70%', top: '36%', size: '7px' },
  { id: 'vega', name: 'Vega', left: '58%', top: '20%', size: '7px' },
]

const minorStars = [
  { id: 'orion', name: 'Orion', left: '76%', top: '58%', size: '6px' },
  { id: 'cassiopeia', name: 'Cassiopeia', left: '36%', top: '18%', size: '6px' },
]

const clouds = [
  { id: 'cloud-1', left: '12%', top: '22%', width: '90px', height: '28px' },
  { id: 'cloud-2', left: '62%', top: '60%', width: '110px', height: '34px' },
]

const rainDrops = Array.from({ length: 26 }, (_, index) => ({
  id: index,
  left: `${8 + (index % 8) * 11}%`,
  top: `${index % 6 * 16}%`,
  animationDelay: `${index * 0.08}s`,
}))

export function SkyScene({
  title = 'SkyScene',
  description = 'A living astronomy-inspired view for SkyVerse.',
  activeMode = 'Live View',
  modeLabel,
  weatherSummary = 'Weather: stable',
  astronomySummary = 'Astronomy: ready',
  bestTarget = 'Mars',
  visibility = 'High',
  locationLabel = 'Current location',
  temperature = '18°C',
  recommendation = 'Live sky conditions will appear here.',
  showOverlays,
  onToggleOverlays,
  sceneMessage,
}: SkySceneProps) {
  const glow = useMemo(() => ({
    transform: 'translate3d(0, 0, 0)',
  }), [])
  const sceneVariant = getSceneVariant(activeMode)
  const [now, setNow] = useState(new Date())
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [localShowOverlays, setLocalShowOverlays] = useState(true)
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)

  const effectiveShowOverlays = typeof showOverlays === 'boolean' ? showOverlays : localShowOverlays
  const toggleOverlays = () => {
    if (onToggleOverlays) {
      onToggleOverlays()
      return
    }
    setLocalShowOverlays((current) => !current)
  }

  const hour = now.getHours()
  const phase = hour < 6 ? 'Night' : hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening'
  const isNight = phase === 'Night'
  const skyGlow = isNight ? '#0f172a' : phase === 'Morning' ? '#1d4ed8' : phase === 'Afternoon' ? '#2563eb' : '#7c3aed'

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const container = canvasContainerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth || 640, container.clientHeight || 320)
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const mountNode = document.createElement('div')
    mountNode.style.position = 'absolute'
    mountNode.style.inset = '0'
    mountNode.style.zIndex = '0'
    mountNode.style.pointerEvents = 'none'
    container.appendChild(mountNode)
    mountNode.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(skyGlow)

    const camera = new THREE.PerspectiveCamera(54, (container.clientWidth || 640) / (container.clientHeight || 320), 0.1, 100)
    camera.position.set(0, 0, 7)

    const ambient = new THREE.AmbientLight(0xffffff, 0.8)
    const directional = new THREE.DirectionalLight(0xffffff, 0.8)
    directional.position.set(5, 5, 8)
    scene.add(ambient, directional)

    const starGeometry = new THREE.BufferGeometry()
    const starPositions = new Float32Array(260 * 3)
    for (let index = 0; index < 260; index += 1) {
      starPositions[index * 3] = (Math.random() - 0.5) * 18
      starPositions[index * 3 + 1] = (Math.random() - 0.5) * 14
      starPositions[index * 3 + 2] = (Math.random() - 0.5) * 20
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, sizeAttenuation: true, transparent: true, opacity: 0.9 })
    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    const planetMaterial = new THREE.MeshStandardMaterial({
      color: isNight ? 0xf8fafc : 0x60a5fa,
      emissive: isNight ? 0x1d4ed8 : 0x172554,
      emissiveIntensity: isNight ? 0.25 : 0.12,
      roughness: 0.85,
      metalness: 0.1,
    })
    const planet = new THREE.Mesh(new THREE.SphereGeometry(0.95, 32, 32), planetMaterial)
    planet.position.set(2.6, 1.2, -2)
    scene.add(planet)

    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(1.7, 0.02, 12, 100),
      new THREE.MeshBasicMaterial({ color: isNight ? 0xfbbf24 : 0xcbd5e1 })
    )
    orbit.rotation.x = Math.PI / 2.2
    scene.add(orbit)

    const clock = new THREE.Clock()
    let animationFrameId = 0

    const animate = () => {
      const elapsed = clock.getElapsedTime()
      stars.rotation.y = elapsed * 0.02
      planet.rotation.y = elapsed * 0.35
      orbit.rotation.z = elapsed * 0.15
      renderer.render(scene, camera)
      animationFrameId = window.requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      camera.aspect = (container.clientWidth || 640) / (container.clientHeight || 320)
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth || 640, container.clientHeight || 320)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      starGeometry.dispose()
      starMaterial.dispose()
      planetMaterial.dispose()
      if (mountNode.parentNode) {
        mountNode.parentNode.removeChild(mountNode)
      }
    }
  }, [skyGlow, isNight])

  const moonVisible = isNight || astronomySummary.toLowerCase().includes('moon')
  const starsVisible = isNight || visibility === 'High'
  const weatherLabel = weatherSummary.toLowerCase()
  const isRainy = weatherLabel.includes('rain')
  const isWindy = weatherLabel.includes('wind')
  const isCloudy = weatherLabel.includes('cloud')
  const isCold = weatherLabel.includes('cold') || weatherSummary.includes('Clear') && hour < 6
  const isHot = weatherLabel.includes('hot') || weatherSummary.includes('Clear') && hour > 14
  const weatherSeverity = isRainy ? 1 : isWindy ? 0.85 : isCloudy ? 0.65 : 0.3
  const cloudAnimationDuration = `${Math.max(11, 24 - weatherSeverity * 10)}s`
  const cloudOpacity = Math.min(0.95, 0.45 + weatherSeverity * 0.2)
  const isGuidedMode = sceneVariant === 'guided'
  const isWeatherMode = sceneVariant === 'weather'
  const isCeilingMode = sceneVariant === 'ceiling'
  const isTimeTravelMode = activeMode?.toLowerCase().includes('timetravel') || activeMode?.toLowerCase().includes('time travel')
  const sceneAccent = isNight ? '#fbbf24' : '#fef3c7'
  const sceneBackground = isCeilingMode
    ? 'linear-gradient(160deg, #020617 0%, #0f172a 85%)'
    : isWeatherMode
      ? 'linear-gradient(160deg, #071b37 0%, #1d4ed8 85%)'
      : isGuidedMode
        ? 'linear-gradient(160deg, #120b26 0%, #6d28d9 85%)'
        : isTimeTravelMode
          ? 'linear-gradient(160deg, #0f172a 0%, #7c3aed 85%)'
          : `linear-gradient(160deg, ${skyGlow} 0%, rgba(15, 23, 42, 0.96) 100%)`

  return (
    <section className="sky-scene" aria-label="SkyScene module">
      <div className="sky-scene__panel">
        <div className="sky-scene__header">
          <div>
            <p className="sky-scene__eyebrow">SkyScene Module</p>
            <h2>{title}</h2>
            <p className="sky-scene__mode-label">{modeLabel ?? activeMode}</p>
          </div>
          <span className="sky-scene__badge">Astronomy Ready</span>
        </div>

        <p className="sky-scene__description">{description}</p>
        {sceneMessage ? <div className="sky-scene__message">{sceneMessage}</div> : null}

        <div ref={canvasContainerRef} className={`sky-scene__canvas sky-scene__canvas--${sceneVariant}`} style={{ ...glow, background: sceneBackground }}>
          <div className={`sky-scene__sun ${isNight ? 'sky-scene__sun--night' : ''} ${isHot ? 'sky-scene__sun--hot' : ''}`} />
          <div className="sky-scene__orbit" />
          <div className={`sky-scene__planet ${moonVisible ? 'sky-scene__planet--moon' : ''}`} />
          {isGuidedMode ? <div className="sky-scene__guide-ring" style={{ borderColor: sceneAccent }} /> : null}
          {isWeatherMode ? <div className="sky-scene__weather-band" /> : null}
          {isCeilingMode ? <div className="sky-scene__projection-grid" /> : null}
          {moonVisible ? <div className="sky-scene__moon" /> : null}
          <div className="sky-scene__timeline" aria-label="Live sky timeline">
            <span className="sky-scene__time">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="sky-scene__phase">{phase}</span>
          </div>
          <div className="sky-scene__target-pill">Target: {bestTarget}</div>
          <div className="sky-scene__location-pill">{locationLabel}</div>
          <button type="button" className="sky-scene__toggle" onClick={toggleOverlays}>
            {effectiveShowOverlays ? 'Hide labels' : 'Show labels'}
          </button>
          {effectiveShowOverlays ? (
            <>
              <div className="sky-scene__status-chip">Condition: {weatherSummary}</div>
              <div className="sky-scene__status-chip sky-scene__status-chip--secondary">Sky: {astronomySummary}</div>
              <div className="sky-scene__status-chip sky-scene__status-chip--tertiary">Temp: {temperature}</div>
              <div className="sky-scene__status-chip sky-scene__status-chip--quaternary">Note: {recommendation}</div>
            </>
          ) : null}
          {clouds.map((cloud, index) => (
            <div
              key={cloud.id}
              className="sky-scene__cloud"
              style={{
                left: cloud.left,
                top: cloud.top,
                width: cloud.width,
                height: cloud.height,
                animationDuration: cloudAnimationDuration,
                animationDelay: `${index * 0.35}s`,
                opacity: cloudOpacity,
              }}
            >
              {effectiveShowOverlays ? <span className="sky-scene__cloud-name">{index === 0 ? 'Cloud cover' : 'Weather drift'}</span> : null}
            </div>
          ))}
          {isRainy ? rainDrops.map((drop) => (
            <span key={drop.id} className="sky-scene__rain" style={{ left: drop.left, top: drop.top, animationDelay: drop.animationDelay }} />
          )) : null}
          {effectiveShowOverlays ? majorStars.map((star) => {
            const isActive = activeTooltip === star.id

            return (
              <div key={star.id} className="sky-scene__label-wrapper" style={{ left: star.left, top: star.top }}>
                <button
                  type="button"
                  className={`sky-scene__label sky-scene__label--major ${isActive ? 'sky-scene__label--active' : ''}`}
                  title={star.name}
                  onMouseEnter={() => setActiveTooltip(star.id)}
                  onMouseLeave={() => setActiveTooltip((current) => (current === star.id ? null : current))}
                  onFocus={() => setActiveTooltip(star.id)}
                  onBlur={() => setActiveTooltip((current) => (current === star.id ? null : current))}
                  aria-label={star.name}
                  aria-describedby={isActive ? `tooltip-${star.id}` : undefined}
                >
                  <span className="sky-scene__label-marker" />
                  <span className="sky-scene__label-text">{star.name}</span>
                </button>
                {isActive ? <span id={`tooltip-${star.id}`} className="sky-scene__tooltip" role="tooltip">{star.name}</span> : null}
              </div>
            )
          }) : null}
          {effectiveShowOverlays ? minorStars.map((star) => {
            const isActive = activeTooltip === star.id

            return (
              <div key={star.id} className="sky-scene__label-wrapper" style={{ left: star.left, top: star.top }}>
                <button
                  type="button"
                  className={`sky-scene__label sky-scene__label--minor ${isActive ? 'sky-scene__label--active' : ''}`}
                  title={star.name}
                  onMouseEnter={() => setActiveTooltip(star.id)}
                  onMouseLeave={() => setActiveTooltip((current) => (current === star.id ? null : current))}
                  onFocus={() => setActiveTooltip(star.id)}
                  onBlur={() => setActiveTooltip((current) => (current === star.id ? null : current))}
                  aria-label={star.name}
                  aria-describedby={isActive ? `tooltip-${star.id}` : undefined}
                >
                  <span className="sky-scene__label-marker" />
                  <span className="sky-scene__label-text">{star.name}</span>
                </button>
                {isActive ? <span id={`tooltip-${star.id}`} className="sky-scene__tooltip" role="tooltip">{star.name}</span> : null}
              </div>
            )
          }) : null}
          <div className="sky-scene__hud">
            <p className="sky-scene__hud-item"><strong>Mode:</strong> {activeMode}</p>
            <p className="sky-scene__hud-item"><strong>Weather:</strong> {weatherSummary}</p>
            <p className="sky-scene__hud-item"><strong>Astronomy:</strong> {astronomySummary}</p>
            <p className="sky-scene__hud-item"><strong>Target:</strong> {bestTarget}</p>
            <p className="sky-scene__hud-item"><strong>Visibility:</strong> {visibility}</p>
            <p className="sky-scene__hud-item"><strong>Heat:</strong> {isHot ? 'Hot' : isCold ? 'Cold' : 'Mild'}</p>
          </div>
          {starsVisible ? stars.map((star) => (
            <span
              key={star.id}
              className="sky-scene__star"
              style={{
                left: star.left,
                top: star.top,
                opacity: star.opacity,
                width: star.size,
                height: star.size,
              }}
            />
          )) : null}
        </div>
      </div>
    </section>
  )
}
