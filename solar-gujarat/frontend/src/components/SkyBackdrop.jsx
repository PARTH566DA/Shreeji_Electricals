// Decorative blue-sky backdrop: gradient sky, slow-drifting clouds, a sun glow,
// and a row of angled solar panels along the bottom so the glass has real art to
// blur over. Purely decorative — aria-hidden. Drift disabled under reduced motion.
export default function SkyBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-light to-sky" />

      {/* Sun glow */}
      <div className="absolute -top-16 right-8 h-56 w-56 rounded-full bg-sun/70 blur-3xl" />

      {/* Drifting clouds */}
      <div className="absolute top-10 left-[-10%] h-16 w-48 rounded-full bg-white/70 blur-xl animate-drift" />
      <div className="absolute top-24 left-[20%] h-12 w-36 rounded-full bg-white/60 blur-xl animate-drift" style={{ animationDuration: '32s' }} />
      <div className="absolute top-16 right-[10%] h-14 w-44 rounded-full bg-white/60 blur-xl animate-drift" style={{ animationDuration: '40s' }} />

      {/* Solar panel row along the bottom */}
      <svg className="absolute bottom-0 left-0 w-full h-40" viewBox="0 0 1200 200" preserveAspectRatio="xMidYMax slice" role="presentation">
        <defs>
          <linearGradient id="panelGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1B6FD6" />
            <stop offset="100%" stopColor="#0B3D91" />
          </linearGradient>
          <pattern id="cells" width="34" height="22" patternUnits="userSpaceOnUse">
            <rect width="34" height="22" fill="url(#panelGrad)" />
            <rect width="32" height="20" x="1" y="1" fill="none" stroke="#4DA8FF" strokeOpacity="0.5" strokeWidth="1" />
          </pattern>
        </defs>
        {/* green ground strip */}
        <rect x="0" y="160" width="1200" height="40" fill="#1FBF75" fillOpacity="0.35" />
        {/* three angled panel arrays */}
        {[0, 420, 840].map((x) => (
          <g key={x} transform={`translate(${x},70) skewX(-12)`}>
            <rect x="20" y="0" width="320" height="92" rx="4" fill="url(#cells)" stroke="#0B3D91" strokeWidth="2" />
            <rect x="170" y="92" width="14" height="48" fill="#5B708B" />
          </g>
        ))}
      </svg>
    </div>
  )
}
