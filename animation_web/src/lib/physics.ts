export type Point = {
  x: number
  y: number
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function round(value: number, digits = 1) {
  return Number(value.toFixed(digits))
}

export function computeAverageSpeed(distance: number, time: number) {
  return distance / time
}

export function computeVelocity(
  initialSpeed: number,
  acceleration: number,
  time: number,
) {
  return initialSpeed + acceleration * time
}

export function computeAcceleratedDisplacement(
  initialSpeed: number,
  acceleration: number,
  time: number,
) {
  return initialSpeed * time + 0.5 * acceleration * time * time
}

export function computeFirstLawDisplacement(
  initialSpeed: number,
  time: number,
  frictionFactor: number,
) {
  const deceleration = frictionFactor * 1.6
  return Math.max(initialSpeed * time - 0.5 * deceleration * time * time, 0)
}

export function computeAcceleration(force: number, mass: number) {
  return force / mass
}

export function computeThirdLawSpeeds(
  leftMass: number,
  rightMass: number,
  impulse: number,
) {
  return {
    left: impulse / leftMass,
    right: impulse / rightMass,
  }
}

export function computeFrictionState(
  appliedForce: number,
  mass: number,
  coefficient: number,
) {
  const normalForce = mass * 9.8
  const maxStatic = coefficient * normalForce
  const kinetic = coefficient * normalForce * 0.82

  if (appliedForce <= maxStatic) {
    return {
      state: 'static' as const,
      friction: appliedForce,
      netForce: 0,
    }
  }

  return {
    state: 'sliding' as const,
    friction: kinetic,
    netForce: appliedForce - kinetic,
  }
}

export function computeFreeFall(height: number, gravity = 9.8) {
  const time = Math.sqrt((2 * height) / gravity)
  const finalSpeed = gravity * time
  return {
    time,
    finalSpeed,
  }
}

export function computeProjectileFlightTime(
  speed: number,
  angleDeg: number,
  gravity = 9.8,
) {
  const angleRad = (angleDeg * Math.PI) / 180
  return (2 * speed * Math.sin(angleRad)) / gravity
}

export function computeProjectileRange(
  speed: number,
  angleDeg: number,
  gravity = 9.8,
) {
  const angleRad = (angleDeg * Math.PI) / 180
  return (speed * speed * Math.sin(2 * angleRad)) / gravity
}

export function computeProjectilePoints(
  speed: number,
  angleDeg: number,
  steps = 40,
  gravity = 9.8,
) {
  const angleRad = (angleDeg * Math.PI) / 180
  const totalTime = computeProjectileFlightTime(speed, angleDeg, gravity)

  return Array.from({ length: steps + 1 }, (_, index) => {
    const time = (totalTime * index) / steps
    const x = speed * Math.cos(angleRad) * time
    const y = speed * Math.sin(angleRad) * time - 0.5 * gravity * time * time

    return { x, y: Math.max(y, 0) }
  })
}