// Per-page header band — sits over the shared backdrop, on brand.
export default function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <section className="px-3 pt-10 pb-4">
      <div className="animate-in glass glass-solid mx-auto max-w-5xl px-6 py-9 text-center">
        {eyebrow && <p className="text-sky-deep font-semibold text-sm uppercase tracking-wide">{eyebrow}</p>}
        <h1 className="text-3xl md:text-4xl text-navy mt-1">{title}</h1>
        {subtitle && <p className="text-muted mt-3 max-w-2xl mx-auto">{subtitle}</p>}
      </div>
    </section>
  )
}
