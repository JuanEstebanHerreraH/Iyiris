/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        bg:      '#07070f',
        surface: '#0e0e1a',
        elevated:'#14142200',
        border:  '#1e1e30',
        muted:   '#52527a',
        subtle:  '#9090b8',
        text:    '#e8e8f4',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'chip': '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        'panel': '0 0 0 1px rgba(255,255,255,0.04), 0 20px 40px rgba(0,0,0,0.4)',
        'glow': '0 0 20px var(--glow-color, rgba(99,102,241,0.4))',
      },
      animation: {
        'fade-in':     'fadeIn 0.3s ease forwards',
        'slide-up':    'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-soft':  'pulseSoft 2s ease-in-out infinite',
        'spin-slow':   'spin 3s linear infinite',
        'copy-flash':  'copyFlash 0.5s ease forwards',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        copyFlash: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(0.9)', opacity: '0.7' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      }
    },
  },
  plugins: [],
};
