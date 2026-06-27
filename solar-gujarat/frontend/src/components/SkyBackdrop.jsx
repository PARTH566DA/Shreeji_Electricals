import Grainient from './Grainient.jsx'

// Animated grainy gradient background (React Bits "Grainient", WebGL via ogl).
// Soft white→sky-blue palette to keep the site light, airy and on-brand.
export default function SkyBackdrop() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Grainient
        color1="#ffffff"
        color2="#a0c0f3"
        color3="#ffffff"
        timeSpeed={1.55}
        colorBalance={0.0}
        warpStrength={1.0}
        warpFrequency={5.0}
        warpSpeed={2.0}
        warpAmplitude={50.0}
        blendAngle={0.0}
        blendSoftness={0.05}
        rotationAmount={500.0}
        noiseScale={2.0}
        grainAmount={0.1}
        grainScale={2.0}
        grainAnimated={false}
        contrast={1.5}
        gamma={1.0}
        saturation={1.0}
        centerX={0.0}
        centerY={0.0}
        zoom={0.9}
      />
    </div>
  )
}
