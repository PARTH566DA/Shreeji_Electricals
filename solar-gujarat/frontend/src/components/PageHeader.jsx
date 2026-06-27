import { motion } from 'framer-motion'

// Per-page header band — sits over the shared sky backdrop, on brand.
export default function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <section className="px-3 pt-10 pb-4">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass glass-solid mx-auto max-w-5xl px-6 py-9 text-center"
      >
        {eyebrow && <p className="text-sky-deep font-semibold text-sm uppercase tracking-wide">{eyebrow}</p>}
        <h1 className="text-3xl md:text-4xl text-navy mt-1">{title}</h1>
        {subtitle && <p className="text-muted mt-3 max-w-2xl mx-auto">{subtitle}</p>}
      </motion.div>
    </section>
  )
}
