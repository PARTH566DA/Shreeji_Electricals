import { motion } from 'framer-motion'

/**
 * Reusable frosted glass card. `solid` uses the more opaque variant for
 * text-heavy content so copy stays readable (brief §2).
 */
export default function GlassCard({ as = 'div', solid = false, hover = false, className = '', children, ...rest }) {
  const Comp = motion[as] || motion.div
  return (
    <Comp
      className={`glass ${solid ? 'glass-solid' : ''} ${className}`}
      {...(hover ? { whileHover: { y: -4 }, transition: { type: 'spring', stiffness: 300, damping: 20 } } : {})}
      {...rest}
    >
      {children}
    </Comp>
  )
}
