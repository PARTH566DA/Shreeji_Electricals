import { motion } from 'framer-motion'
import { useReducedMotion } from '../lib/useReducedMotion.js'

// Fade-up on scroll into view. Renders statically under reduced motion.
export default function Reveal({ children, delay = 0, className = '', as = 'div' }) {
  const reduced = useReducedMotion()
  const Comp = motion[as] || motion.div
  if (reduced) {
    const Plain = as
    return <Plain className={className}>{children}</Plain>
  }
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </Comp>
  )
}
