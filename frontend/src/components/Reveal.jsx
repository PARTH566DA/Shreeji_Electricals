// CSS-based fade-up on mount. Content is visible by default (base opacity 1),
// so it can never get stuck invisible if animations don't run. `delay` staggers.
export default function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
  return (
    <Tag className={`animate-in ${className}`} style={delay ? { animationDelay: `${delay}s` } : undefined}>
      {children}
    </Tag>
  )
}
