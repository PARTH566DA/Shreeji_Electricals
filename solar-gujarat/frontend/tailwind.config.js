/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Design tokens — "clean panels & blue sky" (brief §2).
      colors: {
        sky: {
          light: '#E9F6FF',
          DEFAULT: '#4DA8FF',
          deep: '#1B6FD6',
        },
        navy: '#0B3D91',
        ink: '#0F2540',
        muted: '#5B708B',
        sun: '#FFB81C',
        leaf: '#1FBF75',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        gujarati: ['"Noto Sans Gujarati"', 'sans-serif'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      borderRadius: {
        glass: '22px',
      },
      boxShadow: {
        glass: '0 12px 40px -12px rgba(15,37,64,0.25)',
      },
      keyframes: {
        drift: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(40px)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        drift: 'drift 24s ease-in-out infinite alternate',
        floaty: 'floaty 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
