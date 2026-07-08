import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  clamp,
  computeAcceleratedDisplacement,
  computeAcceleration,
  computeAverageSpeed,
  computeFirstLawDisplacement,
  computeFreeFall,
  computeFrictionState,
  computeProjectileFlightTime,
  computeProjectilePoints,
  computeProjectileRange,
  computeThirdLawSpeeds,
  computeVelocity,
  round,
} from './lib/physics'

type PlaybackControls = {
  progress: number
  isPlaying: boolean
  replay: () => void
  pause: () => void
  resume: () => void
  reset: () => void
}

type LessonMeta = {
  id: string
  title: string
  summary: string
  formula: string
  accent: string
}

const lessons: LessonMeta[] = [
  {
    id: 'speed',
    title: '速度與平均速度',
    summary: '把路程和時間放在同一張圖上，學生能看出速度就是每秒走多遠。',
    formula: 'v = s / t',
    accent: '#f26b4b',
  },
  {
    id: 'acceleration',
    title: '加速度',
    summary: '速度不是只有快慢，還有變快、變慢與方向改變。',
    formula: 'a = Δv / Δt',
    accent: '#ffb347',
  },
  {
    id: 'newton-1',
    title: '牛頓第一定律',
    summary: '沒有外力或合力為零時，物體會保持原本的運動狀態。',
    formula: 'ΣF = 0',
    accent: '#00a7a0',
  },
  {
    id: 'newton-2',
    title: '牛頓第二定律',
    summary: '同樣的力推不同質量，產生的加速度會不同。',
    formula: 'F = m a',
    accent: '#1f8fff',
  },
  {
    id: 'newton-3',
    title: '牛頓第三定律',
    summary: '作用力和反作用力大小相等、方向相反，兩個物體會一起改變。',
    formula: 'F₁₂ = -F₂₁',
    accent: '#7b61ff',
  },
  {
    id: 'friction',
    title: '摩擦力',
    summary: '推力要先超過最大靜摩擦，物體才會開始滑動。',
    formula: 'f ≤ μN',
    accent: '#f04d98',
  },
  {
    id: 'free-fall',
    title: '自由落體',
    summary: '只受重力時，速度會隨時間持續增加。',
    formula: 'g ≈ 9.8 m/s²',
    accent: '#2cbd85',
  },
  {
    id: 'projectile',
    title: '拋體運動',
    summary: '水平與垂直方向一起作用，路徑就變成拋物線。',
    formula: 'x, y 分開分析',
    accent: '#ff8f1f',
  },
]

function usePlayback(durationMs: number): PlaybackControls {
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const elapsedRef = useRef(0)
  const anchorRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)

  const cancel = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }

  const replay = () => {
    cancel()
    elapsedRef.current = 0
    anchorRef.current = null
    setProgress(0)
    setIsPlaying(true)
  }

  const pause = () => {
    cancel()
    anchorRef.current = null
    setIsPlaying(false)
  }

  const resume = () => {
    if (progress >= 1) {
      replay()
      return
    }

    setIsPlaying(true)
  }

  const reset = () => {
    cancel()
    elapsedRef.current = 0
    anchorRef.current = null
    setProgress(0)
    setIsPlaying(false)
  }

  useEffect(() => {
    if (!isPlaying) {
      return undefined
    }

    const tick = (timestamp: number) => {
      if (anchorRef.current === null) {
        anchorRef.current = timestamp - elapsedRef.current
      }

      const elapsed = timestamp - anchorRef.current
      elapsedRef.current = Math.min(elapsed, durationMs)
      const nextProgress = clamp(elapsedRef.current / durationMs, 0, 1)
      setProgress(nextProgress)

      if (nextProgress < 1) {
        frameRef.current = requestAnimationFrame(tick)
        return
      }

      setIsPlaying(false)
      anchorRef.current = null
      frameRef.current = null
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => cancel()
  }, [durationMs, isPlaying])

  return { progress, isPlaying, replay, pause, resume, reset }
}

function SliderControl({
  label,
  min,
  max,
  step,
  value,
  onChange,
  unit,
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  unit: string
}) {
  return (
    <label className="slider-control">
      <span>
        {label}
        <strong>
          {value}
          {unit}
        </strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function LessonSection({
  lesson,
  durationMs,
  children,
}: {
  lesson: LessonMeta
  durationMs: number
  children: (controls: PlaybackControls) => React.ReactNode
}) {
  const controls = usePlayback(durationMs)

  return (
    <section id={lesson.id} className="lesson-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow" style={{ color: lesson.accent }}>
            {lesson.title}
          </span>
          <h2>{lesson.title}</h2>
          <p>{lesson.summary}</p>
        </div>
        <span className="formula-chip" style={{ borderColor: lesson.accent }}>
          {lesson.formula}
        </span>
      </div>
      <div className="lesson-card" style={{ '--accent-color': lesson.accent } as React.CSSProperties}>
        <div className="lesson-controls">
          <button type="button" onClick={controls.replay}>
            重播
          </button>
          <button type="button" onClick={controls.isPlaying ? controls.pause : controls.resume}>
            {controls.isPlaying ? '暫停' : '播放'}
          </button>
          <button type="button" onClick={controls.reset}>
            重設
          </button>
        </div>
        {children(controls)}
      </div>
    </section>
  )
}

function App() {
  const [distance, setDistance] = useState(120)
  const [travelTime, setTravelTime] = useState(8)
  const [initialSpeed, setInitialSpeed] = useState(4)
  const [acceleration, setAcceleration] = useState(1.6)
  const [accelTime, setAccelTime] = useState(6)
  const [glideSpeed, setGlideSpeed] = useState(5)
  const [frictionLevel, setFrictionLevel] = useState(0.9)
  const [pushForce, setPushForce] = useState(18)
  const [pushMass, setPushMass] = useState(3)
  const [leftMass, setLeftMass] = useState(50)
  const [rightMass, setRightMass] = useState(70)
  const [surfaceMass, setSurfaceMass] = useState(6)
  const [surfaceForce, setSurfaceForce] = useState(34)
  const [surfaceMu, setSurfaceMu] = useState(0.45)
  const [dropHeight, setDropHeight] = useState(20)
  const [projectileSpeed, setProjectileSpeed] = useState(18)
  const [projectileAngle, setProjectileAngle] = useState(48)

  const averageSpeed = computeAverageSpeed(distance, travelTime)
  const totalAccelerationDistance = computeAcceleratedDisplacement(
    initialSpeed,
    acceleration,
    accelTime,
  )
  const secondLawAcceleration = computeAcceleration(pushForce, pushMass)
  const thirdLawSpeeds = computeThirdLawSpeeds(leftMass, rightMass, 160)
  const frictionState = computeFrictionState(surfaceForce, surfaceMass, surfaceMu)
  const freeFall = computeFreeFall(dropHeight)

  const projectilePoints = useMemo(
    () => computeProjectilePoints(projectileSpeed, projectileAngle),
    [projectileAngle, projectileSpeed],
  )
  const projectileRange = computeProjectileRange(projectileSpeed, projectileAngle)
  const projectileFlightTime = computeProjectileFlightTime(
    projectileSpeed,
    projectileAngle,
  )
  const projectileMaxHeight = Math.max(...projectilePoints.map((point) => point.y), 1)
  const projectilePolyline = projectilePoints
    .map((point) => {
      const x = (point.x / Math.max(projectileRange, 1)) * 100
      const y = 100 - (point.y / projectileMaxHeight) * 78
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="app-shell">
      <header className="hero-section">
        <nav className="top-nav" aria-label="主題導覽">
          <a href="#overview">課程總覽</a>
          <a href="#simulations">互動動畫</a>
          <a href="#teaching">教學提示</a>
        </nav>
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">國中基礎物理互動教室</span>
            <h1>把力、速度、加速度，變成看得見的動畫。</h1>
            <p>
              這個網站專門用來教國中生理解牛頓第一到第三運動定律，並延伸到摩擦力、自由落體與拋體。
              每個單元都能調參數、重播動畫、直接觀察變化。
            </p>
            <div className="hero-actions">
              <a href="#simulations">開始操作</a>
              <a href="#teaching" className="secondary-link">
                看教學建議
              </a>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="orbit orbit-one"></div>
            <div className="orbit orbit-two"></div>
            <div className="hero-core">
              <span>F</span>
              <span>v</span>
              <span>a</span>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="overview" className="overview-section">
          <div className="overview-header">
            <div>
              <span className="eyebrow">課程總覽</span>
              <h2>一個網站，從直線運動一路看到拋體軌跡。</h2>
            </div>
            <p>
              為了讓 GitHub Pages 穩定部署，整站採單頁式架構與純前端互動，手機、平板、桌機都能直接開啟使用。
            </p>
          </div>
          <div className="overview-metrics">
            <Metric label="互動單元" value="8 個" />
            <Metric label="核心主題" value="牛頓定律 + 運動學" />
            <Metric label="部署方式" value="GitHub Pages" />
            <Metric label="操作裝置" value="手機 / 平板 / 桌機" />
          </div>
          <div className="chapter-grid">
            {lessons.map((lesson) => (
              <a href={`#${lesson.id}`} key={lesson.id} className="chapter-card">
                <span className="chapter-dot" style={{ background: lesson.accent }}></span>
                <strong>{lesson.title}</strong>
                <p>{lesson.summary}</p>
                <span>{lesson.formula}</span>
              </a>
            ))}
          </div>
        </section>

        <section id="simulations" className="simulation-stack">
          <LessonSection lesson={lessons[0]} durationMs={3200}>
            {({ progress }) => {
              const position = progress * 100

              return (
                <div className="lesson-layout">
                  <div className="scene-card">
                    <div className="track-scene warm">
                      <div className="track-line"></div>
                      <div className="track-markers">
                        <span>0 m</span>
                        <span>{Math.round(distance / 2)} m</span>
                        <span>{distance} m</span>
                      </div>
                      <div className="runner" style={{ left: `${position}%` }}>
                        <span>{round(averageSpeed, 1)} m/s</span>
                      </div>
                    </div>
                  </div>
                  <div className="detail-column">
                    <div className="slider-grid">
                      <SliderControl
                        label="路程"
                        min={20}
                        max={200}
                        step={10}
                        value={distance}
                        onChange={setDistance}
                        unit=" m"
                      />
                      <SliderControl
                        label="時間"
                        min={2}
                        max={20}
                        step={1}
                        value={travelTime}
                        onChange={setTravelTime}
                        unit=" s"
                      />
                    </div>
                    <div className="metric-row">
                      <Metric label="平均速度" value={`${round(averageSpeed, 1)} m/s`} />
                      <Metric label="觀察重點" value="時間越短，速度越大" />
                    </div>
                  </div>
                </div>
              )
            }}
          </LessonSection>

          <LessonSection lesson={lessons[1]} durationMs={4200}>
            {({ progress }) => {
              const elapsed = accelTime * progress
              const displacement = computeAcceleratedDisplacement(
                initialSpeed,
                acceleration,
                elapsed,
              )
              const position = clamp(displacement / Math.max(totalAccelerationDistance, 1), 0, 1)
              const velocity = computeVelocity(initialSpeed, acceleration, elapsed)

              return (
                <div className="lesson-layout">
                  <div className="scene-card">
                    <div className="track-scene amber">
                      <div className="track-line"></div>
                      <div className="trail-points">
                        {Array.from({ length: 6 }, (_, index) => (
                          <span key={index} style={{ left: `${index * 20}%` }}></span>
                        ))}
                      </div>
                      <div className="runner square" style={{ left: `${position * 100}%` }}>
                        <span>{round(velocity, 1)} m/s</span>
                      </div>
                      <div className="vector-arrow" style={{ width: `${clamp(velocity * 6, 40, 170)}px` }}>
                        速度箭頭
                      </div>
                    </div>
                  </div>
                  <div className="detail-column">
                    <div className="slider-grid">
                      <SliderControl
                        label="初速度"
                        min={0}
                        max={12}
                        step={1}
                        value={initialSpeed}
                        onChange={setInitialSpeed}
                        unit=" m/s"
                      />
                      <SliderControl
                        label="加速度"
                        min={-2}
                        max={5}
                        step={0.2}
                        value={acceleration}
                        onChange={setAcceleration}
                        unit=" m/s²"
                      />
                      <SliderControl
                        label="觀察時間"
                        min={2}
                        max={8}
                        step={1}
                        value={accelTime}
                        onChange={setAccelTime}
                        unit=" s"
                      />
                    </div>
                    <div className="metric-row">
                      <Metric label="目前速度" value={`${round(velocity, 1)} m/s`} />
                      <Metric label="目前位移" value={`${round(displacement, 1)} m`} />
                    </div>
                  </div>
                </div>
              )
            }}
          </LessonSection>

          <LessonSection lesson={lessons[2]} durationMs={4000}>
            {({ progress }) => {
              const currentTime = progress * 5
              const noFriction = glideSpeed * currentTime
              const withFriction = computeFirstLawDisplacement(glideSpeed, currentTime, frictionLevel)
              const maxDistance = glideSpeed * 5

              return (
                <div className="lesson-layout">
                  <div className="scene-card dual-scene">
                    <div className="compare-lane">
                      <header>
                        <strong>接近無摩擦</strong>
                        <span>合力幾乎為 0</span>
                      </header>
                      <div className="lane-track">
                        <div className="runner disk" style={{ left: `${(noFriction / maxDistance) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="compare-lane">
                      <header>
                        <strong>有摩擦</strong>
                        <span>速度逐漸變小</span>
                      </header>
                      <div className="lane-track">
                        <div className="runner disk soft" style={{ left: `${(withFriction / maxDistance) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="detail-column">
                    <div className="slider-grid">
                      <SliderControl
                        label="初速度"
                        min={2}
                        max={10}
                        step={1}
                        value={glideSpeed}
                        onChange={setGlideSpeed}
                        unit=" m/s"
                      />
                      <SliderControl
                        label="摩擦影響"
                        min={0.2}
                        max={1.4}
                        step={0.1}
                        value={frictionLevel}
                        onChange={setFrictionLevel}
                        unit=""
                      />
                    </div>
                    <div className="metric-row">
                      <Metric label="無摩擦位移" value={`${round(noFriction, 1)} m`} />
                      <Metric label="有摩擦位移" value={`${round(withFriction, 1)} m`} />
                    </div>
                  </div>
                </div>
              )
            }}
          </LessonSection>

          <LessonSection lesson={lessons[3]} durationMs={3800}>
            {({ progress }) => {
              const elapsed = progress * 4
              const displacement = 0.5 * secondLawAcceleration * elapsed * elapsed
              const maxDisplacement = 0.5 * secondLawAcceleration * 16
              const position = clamp(displacement / Math.max(maxDisplacement, 1), 0, 1)

              return (
                <div className="lesson-layout">
                  <div className="scene-card">
                    <div className="push-scene">
                      <div className="push-arrow" style={{ width: `${clamp(pushForce * 5, 80, 200)}px` }}>
                        {pushForce} N
                      </div>
                      <div className="crate" style={{ left: `${position * 100}%` }}>
                        {pushMass} kg
                      </div>
                    </div>
                  </div>
                  <div className="detail-column">
                    <div className="slider-grid">
                      <SliderControl
                        label="推力"
                        min={6}
                        max={40}
                        step={2}
                        value={pushForce}
                        onChange={setPushForce}
                        unit=" N"
                      />
                      <SliderControl
                        label="質量"
                        min={1}
                        max={8}
                        step={1}
                        value={pushMass}
                        onChange={setPushMass}
                        unit=" kg"
                      />
                    </div>
                    <div className="metric-row">
                      <Metric label="加速度" value={`${round(secondLawAcceleration, 2)} m/s²`} />
                      <Metric label="重點" value="力越大或質量越小，加速度越大" />
                    </div>
                  </div>
                </div>
              )
            }}
          </LessonSection>

          <LessonSection lesson={lessons[4]} durationMs={3600}>
            {({ progress }) => {
              const leftTravel = thirdLawSpeeds.left * progress * 0.55
              const rightTravel = thirdLawSpeeds.right * progress * 0.55

              return (
                <div className="lesson-layout">
                  <div className="scene-card">
                    <div className="reaction-scene">
                      <div className="reaction-center"></div>
                      <div className="skater left" style={{ transform: `translateX(-${leftTravel * 18}px)` }}>
                        {leftMass} kg
                      </div>
                      <div className="skater right" style={{ transform: `translateX(${rightTravel * 18}px)` }}>
                        {rightMass} kg
                      </div>
                    </div>
                  </div>
                  <div className="detail-column">
                    <div className="slider-grid">
                      <SliderControl
                        label="左方質量"
                        min={40}
                        max={90}
                        step={5}
                        value={leftMass}
                        onChange={setLeftMass}
                        unit=" kg"
                      />
                      <SliderControl
                        label="右方質量"
                        min={40}
                        max={90}
                        step={5}
                        value={rightMass}
                        onChange={setRightMass}
                        unit=" kg"
                      />
                    </div>
                    <div className="metric-row">
                      <Metric label="左方速率" value={`${round(thirdLawSpeeds.left, 2)} m/s`} />
                      <Metric label="右方速率" value={`${round(thirdLawSpeeds.right, 2)} m/s`} />
                    </div>
                  </div>
                </div>
              )
            }}
          </LessonSection>

          <LessonSection lesson={lessons[5]} durationMs={3400}>
            {({ progress }) => {
              const slipDistance = frictionState.state === 'sliding' ? progress * 100 : 0

              return (
                <div className="lesson-layout">
                  <div className="scene-card">
                    <div className="surface-scene">
                      <div className="surface-pattern"></div>
                      <div className="push-arrow magenta" style={{ width: `${clamp(surfaceForce * 4, 90, 210)}px` }}>
                        推力 {surfaceForce} N
                      </div>
                      <div className="crate compact" style={{ left: `${slipDistance}%` }}>
                        木箱
                      </div>
                    </div>
                  </div>
                  <div className="detail-column">
                    <div className="slider-grid">
                      <SliderControl
                        label="施力"
                        min={10}
                        max={80}
                        step={2}
                        value={surfaceForce}
                        onChange={setSurfaceForce}
                        unit=" N"
                      />
                      <SliderControl
                        label="質量"
                        min={2}
                        max={10}
                        step={1}
                        value={surfaceMass}
                        onChange={setSurfaceMass}
                        unit=" kg"
                      />
                      <SliderControl
                        label="摩擦係數"
                        min={0.1}
                        max={0.8}
                        step={0.05}
                        value={surfaceMu}
                        onChange={setSurfaceMu}
                        unit=""
                      />
                    </div>
                    <div className="metric-row">
                      <Metric label="狀態" value={frictionState.state === 'static' ? '尚未滑動' : '開始滑動'} />
                      <Metric label="淨力" value={`${round(frictionState.netForce, 1)} N`} />
                    </div>
                  </div>
                </div>
              )
            }}
          </LessonSection>

          <LessonSection lesson={lessons[6]} durationMs={3600}>
            {({ progress }) => {
              const dropY = progress * 100
              const currentTime = freeFall.time * progress
              const currentVelocity = 9.8 * currentTime

              return (
                <div className="lesson-layout">
                  <div className="scene-card">
                    <div className="fall-scene">
                      <div className="drop-line"></div>
                      <div className="drop-object" style={{ top: `${dropY}%` }}></div>
                      <div className="ground-bar"></div>
                    </div>
                  </div>
                  <div className="detail-column">
                    <div className="slider-grid">
                      <SliderControl
                        label="下落高度"
                        min={5}
                        max={50}
                        step={1}
                        value={dropHeight}
                        onChange={setDropHeight}
                        unit=" m"
                      />
                    </div>
                    <div className="metric-row">
                      <Metric label="落地時間" value={`${round(freeFall.time, 2)} s`} />
                      <Metric label="目前速度" value={`${round(currentVelocity, 1)} m/s`} />
                      <Metric label="落地速度" value={`${round(freeFall.finalSpeed, 1)} m/s`} />
                    </div>
                  </div>
                </div>
              )
            }}
          </LessonSection>

          <LessonSection lesson={lessons[7]} durationMs={4200}>
            {({ progress }) => {
              const activeIndex = Math.min(
                Math.floor(progress * (projectilePoints.length - 1)),
                projectilePoints.length - 1,
              )
              const activePoint = projectilePoints[activeIndex]
              const activeX = (activePoint.x / Math.max(projectileRange, 1)) * 100
              const activeY = 100 - (activePoint.y / projectileMaxHeight) * 78

              return (
                <div className="lesson-layout">
                  <div className="scene-card">
                    <div className="projectile-scene">
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                        <polyline points={projectilePolyline} />
                        <circle cx={activeX} cy={activeY} r="2.6" />
                      </svg>
                    </div>
                  </div>
                  <div className="detail-column">
                    <div className="slider-grid">
                      <SliderControl
                        label="初速度"
                        min={10}
                        max={30}
                        step={1}
                        value={projectileSpeed}
                        onChange={setProjectileSpeed}
                        unit=" m/s"
                      />
                      <SliderControl
                        label="發射角"
                        min={20}
                        max={70}
                        step={1}
                        value={projectileAngle}
                        onChange={setProjectileAngle}
                        unit="°"
                      />
                    </div>
                    <div className="metric-row">
                      <Metric label="飛行時間" value={`${round(projectileFlightTime, 2)} s`} />
                      <Metric label="水平射程" value={`${round(projectileRange, 1)} m`} />
                    </div>
                  </div>
                </div>
              )
            }}
          </LessonSection>
        </section>

        <section id="teaching" className="teaching-section">
          <div className="overview-header">
            <div>
              <span className="eyebrow">教學提示</span>
              <h2>適合直接投影，也適合學生一邊拖拉桿一邊觀察。</h2>
            </div>
            <p>
              每個模組都先讓學生猜，再播放動畫、改參數、重新比較。這樣比只看公式更容易建立直覺。
            </p>
          </div>
          <div className="teaching-grid">
            <article>
              <strong>先預測，再驗證</strong>
              <p>先問學生哪個會跑得更快、哪個會落得更久，再用動畫驗證答案。</p>
            </article>
            <article>
              <strong>把公式對回畫面</strong>
              <p>讓學生看到力變大時箭頭變長、質量變大時位移變短，將符號與現象對上。</p>
            </article>
            <article>
              <strong>比較不同情境</strong>
              <p>例如無摩擦與有摩擦、不同質量互推、不同發射角拋體，對比越明顯越容易記住。</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>以 Vite 建置，針對 GitHub Pages 靜態部署調整。適合用於課堂投影與學生自主操作。</p>
      </footer>
    </div>
  )
}

export default App
