import { VB_W, VB_H, HORIZON, clamp } from './sceneMath.js'

// Illustrated landscape + two-storey Gujarati home with a rooftop array. All colours,
// shadows and lights come from the derived `scene`; geometry here is static.
// House-local coordinates: origin at the centre of the front base line, y up is negative.

// Trees stay right of the house so the rising sun (left) is never hidden behind them.
const TREES = [
  { dx: 250, dy: -40, s: 0.95 },
  { dx: 430, dy: -24, s: 0.75 },
]
const BUSHES = [
  { dx: -214, dy: 10, s: 1 },
  { dx: -178, dy: 14, s: 0.7 },
  { dx: 214, dy: 12, s: 0.8 },
]

const WINDOWS = [
  { x: -112, y: -122, w: 64, h: 58 },
  { x: 60, y: -122, w: 72, h: 58 },
  { x: -118, y: -256, w: 86, h: 62 },
  { x: -18, y: -256, w: 78, h: 62 },
]

// Distant tree clumps along the tree line (fixed in world units).
const FAR_TREES = [
  [120, 634, 14], [150, 630, 18], [412, 640, 12], [690, 632, 16], [716, 636, 11],
  [940, 628, 15], [1188, 632, 13], [1216, 628, 18], [1460, 626, 14], [1490, 632, 11],
]

export default function SolarScene({ scene }) {
  const c = scene.colors
  const { house, shadow, glint, lightsOn } = scene
  const dir = shadow.dx >= 0 ? 1 : -1
  const g0 = clamp(glint.pos - 0.2, 0, 1)
  const g1 = clamp(glint.pos, 0, 1)
  const g2 = clamp(glint.pos + 0.2, 0, 1)

  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id="sch-ground" x1="0" y1={HORIZON - 10} x2="0" y2={VB_H} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={c.groundTop} />
          <stop offset="1" stopColor={c.groundBot} />
        </linearGradient>
        <linearGradient id="sch-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.haze} stopOpacity="0" />
          <stop offset="0.72" stopColor={c.haze} stopOpacity="0.6" />
          <stop offset="1" stopColor={c.haze} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sch-glint" x1="0" y1="0" x2="1" y2="0">
          <stop offset={g0} stopColor="#fff" stopOpacity="0" />
          <stop offset={g1} stopColor="#fff" stopOpacity={glint.a} />
          <stop offset={g2} stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="sch-warm">
          <stop offset="0" stopColor={c.warm} stopOpacity="0.9" />
          <stop offset="1" stopColor={c.warm} stopOpacity="0" />
        </radialGradient>
        <filter id="sch-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="sch-softer" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      {/* ---- Landscape ---- */}
      <path
        fill={c.farHill}
        d="M0 670 L0 610 C120 588 220 576 330 594 C430 610 520 568 640 564 C760 560 850 602 960 596 C1080 588 1160 558 1290 570 C1400 580 1480 604 1600 594 L1600 670 Z"
      />
      <rect x="0" y="540" width={VB_W} height="150" fill="url(#sch-haze)" />
      <path
        fill={c.midHill}
        d="M0 676 L0 642 C90 632 170 650 260 638 C360 624 450 648 560 642 C680 636 760 620 880 630 C1000 640 1100 628 1220 636 C1330 643 1450 626 1600 634 L1600 676 Z"
      />
      <g fill={c.foliageDark} opacity="0.55">
        {FAR_TREES.map(([x, y, r]) => (
          <circle key={x} cx={x} cy={y} r={r} />
        ))}
      </g>
      <rect x="0" y={HORIZON - 12} width={VB_W} height={VB_H - HORIZON + 12} fill="url(#sch-ground)" />

      <g transform={`translate(${house.x} ${house.y}) scale(${house.scale})`}>
        {/* Path from the door to the gate */}
        <path d="M-26 0 L30 0 L96 170 L-92 170 Z" fill={c.path} opacity="0.85" />

        {/* Cast + contact shadows (drawn under everything) */}
        <path
          d={`M-172 0 L190 -12 L${190 + shadow.dx} ${-12 + shadow.dy} L${-172 + shadow.dx} ${shadow.dy} Z`}
          fill="#0b1426"
          opacity={shadow.a}
          filter="url(#sch-soft)"
        />
        <ellipse cx="8" cy="2" rx="200" ry="12" fill="#0b1426" opacity={shadow.contact} filter="url(#sch-soft)" />

        {/* Trees behind / beside the house */}
        {TREES.map((tr) => (
          <Tree key={tr.dx} {...tr} c={c} dir={dir} shadow={shadow} />
        ))}
        {BUSHES.map((b) => (
          <Bush key={b.dx} {...b} c={c} dir={dir} />
        ))}

        {/* ---- House: ground floor ---- */}
        <rect x="-172" y="-10" width="362" height="10" fill={c.plinth} />
        <polygon points="160,-10 182,-22 182,-162 160,-150" fill={c.wallSide} />
        <rect x="-160" y="-150" width="320" height="140" fill={c.wall} />
        {/* Terrace slab (top face, side, front edge) */}
        <polygon points="-168,-162 168,-162 190,-174 -146,-174" fill={c.slab} />
        <polygon points="168,-150 190,-162 190,-174 168,-162" fill={c.wallSide} />
        <rect x="-168" y="-162" width="336" height="12" fill={c.slab} />
        <rect x="-168" y="-150" width="336" height="3" fill="#0b1426" opacity="0.08" />

        {/* Water tank on the terrace, behind the parapet */}
        <g>
          <rect x="116" y="-234" width="36" height="58" rx="4" fill={c.tank} />
          <ellipse cx="134" cy="-234" rx="18" ry="5" fill={c.tank} />
          <ellipse cx="134" cy="-234" rx="12" ry="3" fill="#fff" opacity="0.08" />
          {[-220, -206, -192].map((y) => (
            <rect key={y} x="116" y={y} width="36" height="2" fill="#fff" opacity="0.07" />
          ))}
        </g>
        <rect x="80" y="-188" width="88" height="26" fill={c.wall} />
        <rect x="78" y="-192" width="92" height="5" fill={c.slab} />

        {/* ---- First floor ---- */}
        <polygon points="80,-162 102,-174 102,-294 80,-282" fill={c.wallSide} />
        <rect x="-150" y="-282" width="230" height="120" fill={c.wall} />
        <rect x="-150" y="-282" width="18" height="120" fill={c.accent} />
        {/* Roof slab */}
        <polygon points="-158,-294 88,-294 110,-306 -136,-306" fill={c.slab} />
        <polygon points="88,-282 110,-294 110,-306 88,-294" fill={c.wallSide} />
        <rect x="-158" y="-294" width="246" height="12" fill={c.slab} />
        <rect x="-150" y="-282" width="230" height="3" fill="#0b1426" opacity="0.08" />

        {/* Window glow spill (night), then windows with sunshades */}
        <g opacity={lightsOn * 0.5} filter="url(#sch-soft)">
          {WINDOWS.map((wd) => (
            <rect key={`g${wd.x}${wd.y}`} x={wd.x - 10} y={wd.y - 8} width={wd.w + 20} height={wd.h + 20} fill={c.warm} />
          ))}
        </g>
        {WINDOWS.map((wd) => (
          <Window key={`${wd.x}${wd.y}`} {...wd} c={c} />
        ))}

        {/* Door + porch lamp */}
        <rect x="-22" y="-116" width="52" height="106" fill={c.frame} />
        <rect x="-18" y="-112" width="44" height="102" fill={c.door} />
        <rect x="-12" y="-104" width="14" height="40" fill="#000" opacity="0.1" />
        <rect x="8" y="-104" width="14" height="40" fill="#000" opacity="0.1" />
        <circle cx="18" cy="-58" r="2.5" fill={c.frame} />
        <rect x="-30" y="-10" width="68" height="6" fill={c.slab} />
        <circle cx="46" cy="-96" r="46" fill="url(#sch-warm)" opacity={lightsOn * 0.7} />
        <ellipse cx="8" cy="10" rx="80" ry="12" fill={c.warm} opacity={lightsOn * 0.3} filter="url(#sch-soft)" />
        <rect x="42" y="-104" width="8" height="12" rx="2" fill={c.tank} />
        <circle cx="46" cy="-92" r="3.5" fill={lightsOn > 0.1 ? c.warm : c.frame} />

        {/* Inverter + conduit carrying the panels' power down to the house */}
        <path d="M-142 -312 L-142 -112" stroke={c.frame} strokeWidth="4" fill="none" opacity="0.9" />
        <path
          className="sch-flow"
          d="M-142 -312 L-142 -112"
          stroke={c.flow}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 12"
          fill="none"
          opacity={scene.energy.flowA}
        />
        <rect x="-156" y="-112" width="28" height="38" rx="3" fill={c.frame} />
        <rect x="-152" y="-106" width="20" height="10" rx="1.5" fill={c.tank} opacity="0.85" />
        <circle
          cx="-142"
          cy="-84"
          r="3"
          fill={scene.energy.flowA > 0.02 ? '#35e08a' : '#5b6678'}
          style={{ filter: scene.energy.flowA > 0.02 ? 'drop-shadow(0 0 3px #35e08a)' : 'none' }}
        />

        {/* ---- Rooftop array: two rows of tilted modules ---- */}
        {[-128, -48, 32].map((x) => (
          <rect key={`bl${x}`} x={x} y="-358" width="4" height="8" fill={c.frame} opacity="0.8" />
        ))}
        <PanelRow transform="matrix(1 0 0.25 -1 -134 -358)" c={c} />
        {[-144, -64, 16, 70].map((x) => (
          <rect key={`fl${x}`} x={x} y="-312" width="4" height="16" fill={c.frame} opacity="0.85" />
        ))}
        <PanelRow transform="matrix(1 0 0.25 -1 -150 -312)" c={c} />

        {/* ---- Compound wall with gate, in front of the house ---- */}
        <CompoundWall c={c} />
      </g>
    </svg>
  )
}

function PanelRow({ transform, c }) {
  const W = 226
  const H = 40
  return (
    <g transform={transform}>
      <rect x="0" y="0" width={W} height={H} fill={c.panel} />
      <g stroke={c.panelEdge} strokeWidth="0.6" opacity="0.55">
        {Array.from({ length: 23 }, (_, i) => (i + 1) * (W / 24)).map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2={H} />
        ))}
        <line x1="0" y1={H / 3} x2={W} y2={H / 3} />
        <line x1="0" y1={(2 * H) / 3} x2={W} y2={(2 * H) / 3} />
      </g>
      <g stroke={c.frame} strokeWidth="2.2">
        {[1, 2, 3].map((k) => (
          <line key={k} x1={(k * W) / 4} y1="0" x2={(k * W) / 4} y2={H} />
        ))}
      </g>
      <rect x="0" y="0" width={W} height={H} fill="url(#sch-glint)" />
      <rect x="0" y="0" width={W} height={H} fill="none" stroke={c.frame} strokeWidth="2.6" />
    </g>
  )
}

function Window({ x, y, w, h, c }) {
  return (
    <g>
      <rect x={x - 7} y={y - 12} width={w + 14} height="6" fill={c.slab} />
      <rect x={x - 7} y={y - 6} width={w + 14} height="3" fill="#0b1426" opacity="0.1" />
      <rect x={x} y={y} width={w} height={h} fill={c.frame} />
      <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} fill={c.window} />
      <rect x={x + 4} y={y + 4} width={(w - 8) * 0.45} height={h - 8} fill="#fff" opacity="0.08" />
      <rect x={x + w / 2 - 1.5} y={y + 4} width="3" height={h - 8} fill={c.frame} />
      <rect x={x + 4} y={y + h * 0.42} width={w - 8} height="3" fill={c.frame} />
      <rect x={x - 4} y={y + h} width={w + 8} height="5" fill={c.slab} />
    </g>
  )
}

function Tree({ dx, dy, s, c, dir, shadow }) {
  return (
    <g transform={`translate(${dx} ${dy}) scale(${s})`}>
      <ellipse
        cx={dir * (20 + Math.abs(shadow.dx) * 0.22)}
        cy="4"
        rx={46 + Math.abs(shadow.dx) * 0.2}
        ry="9"
        fill="#0b1426"
        opacity={shadow.a * 0.8}
        filter="url(#sch-soft)"
      />
      <rect x="-6" y="-78" width="12" height="80" rx="4" fill={c.trunk} />
      <circle cx="0" cy="-122" r="54" fill={c.foliageDark} />
      <circle cx="-36" cy="-98" r="38" fill={c.foliage} />
      <circle cx="36" cy="-100" r="40" fill={c.foliage} />
      <circle cx="0" cy="-150" r="38" fill={c.foliage} />
      <circle cx={-dir * 18} cy="-134" r="30" fill={c.foliageLit} opacity="0.75" />
    </g>
  )
}

function Bush({ dx, dy, s, c, dir }) {
  return (
    <g transform={`translate(${dx} ${dy}) scale(${s})`}>
      <circle cx="-18" cy="-16" r="20" fill={c.foliageDark} />
      <circle cx="16" cy="-18" r="22" fill={c.foliage} />
      <circle cx="0" cy="-30" r="20" fill={c.foliage} />
      <circle cx={-dir * 8} cy="-32" r="12" fill={c.foliageLit} opacity="0.7" />
    </g>
  )
}

function CompoundWall({ c }) {
  const segment = (x, w) => (
    <g key={x}>
      <rect x={x} y="18" width={w} height="26" fill={c.wall} />
      <rect x={x - 2} y="14" width={w + 4} height="5" fill={c.slab} />
      <rect x={x} y="40" width={w} height="4" fill="#0b1426" opacity="0.08" />
    </g>
  )
  const pillar = (x) => (
    <g key={`p${x}`}>
      <rect x={x} y="8" width="18" height="36" fill={c.wallSide} />
      <rect x={x - 2} y="4" width="22" height="5" fill={c.slab} />
    </g>
  )
  return (
    <g>
      {segment(-258, 216)}
      {segment(44, 222)}
      {[-266, -46, 30, 262].map(pillar)}
      {/* Gate */}
      <g stroke={c.tank} strokeWidth="2.4">
        <line x1="-28" y1="20" x2="30" y2="20" />
        <line x1="-28" y1="40" x2="30" y2="40" />
        {[-22, -12, -2, 8, 18, 26].map((x) => (
          <line key={x} x1={x} y1="20" x2={x} y2="42" />
        ))}
      </g>
    </g>
  )
}
