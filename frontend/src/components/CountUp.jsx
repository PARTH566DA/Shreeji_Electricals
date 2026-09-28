import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion.js'

// Animated number count-up; renders the final value instantly under reduced motion.
export default function CountUp({ value = 0, duration = 900, format = (v) => Math.round(v), className }) {
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(reduced ? value : 0)
  const raf = useRef()

  useEffect(() => {
    if (reduced) {
      setDisplay(value)
      return
    }
    const start = performance.now()
    const from = 0
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (value - from) * eased)
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, duration, reduced])

  return <span className={className}>{format(display)}</span>
}
