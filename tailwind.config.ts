import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // OLED/Zinc premium dark theme
        background: {
          DEFAULT: '#09090b',  // OLED black / Zinc 950
          subtle: '#18181b',   // Zinc 900
          elevated: '#27272a', // Zinc 800
          overlay: '#3f3f46',  // Zinc 700
        },
        // Vibrant neon indigo accent
        accent: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        highlight: {
          500: '#f59e0b',
        },
        surface: {
          0: '#09090b',
          1: '#18181b',
          2: '#27272a',
          3: '#3f3f46',
          4: '#52525b',
        },
        text: {
          primary:   '#fafafa', // Zinc 50
          secondary: '#a1a1aa', // Zinc 400
          tertiary:  '#71717a', // Zinc 500
          disabled:  '#52525b', // Zinc 600
          inverse:   '#09090b',
        },
        success: { DEFAULT: '#10b981', muted: '#064e3b', text: '#6ee7b7' },
        warning: { DEFAULT: '#f59e0b', muted: '#451a03', text: '#fcd34d' },
        error:   { DEFAULT: '#ef4444', muted: '#450a0a', text: '#fca5a5' },
        info:    { DEFAULT: '#3b82f6', muted: '#1e3a5f', text: '#93c5fd' },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem', letterSpacing: '0.02em' }],
        xs:    ['0.75rem',  { lineHeight: '1rem', letterSpacing: '0.01em' }],
        sm:    ['0.8125rem',{ lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        base:  ['0.875rem', { lineHeight: '1.5rem', letterSpacing: '-0.01em' }],
        lg:    ['1rem',     { lineHeight: '1.625rem', letterSpacing: '-0.015em' }],
        xl:    ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.015em' }],
        '2xl': ['1.25rem',  { lineHeight: '1.875rem', letterSpacing: '-0.02em' }],
        '3xl': ['1.5rem',   { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '4xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
      },
      spacing: {
        // Kompaktni spacing za dense layout
        '0.5': '0.125rem',
        '1':   '0.25rem',
        '1.5': '0.375rem',
        '2':   '0.5rem',
        '2.5': '0.625rem',
        '3':   '0.75rem',
        '3.5': '0.875rem',
        '4':   '1rem',
        '5':   '1.25rem',
        '6':   '1.5rem',
        '7':   '1.75rem',
        '8':   '2rem',
        '10':  '2.5rem',
        '12':  '3rem',
        '14':  '3.5rem',
        '16':  '4rem',
        '20':  '5rem',
        '24':  '6rem',
        // Sidebar width
        'sidebar':         '15rem',  // 240px
        'sidebar-compact': '4rem',   // 64px
      },
      borderRadius: {
        none: '0',
        sm:   '0.125rem',
        DEFAULT: '0.25rem',
        md:   '0.375rem',
        lg:   '0.5rem',
        xl:   '0.75rem',
        '2xl':'1rem',
        full: '9999px',
      },
      boxShadow: {
        'xs':   '0 1px 2px 0 rgb(0 0 0 / 0.3)',
        'sm':   '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
        DEFAULT:'0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
        'md':   '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
        'lg':   '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
        'xl':   '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
        'glow': '0 0 20px rgb(99 102 241 / 0.3)',
        'glow-sm': '0 0 10px rgb(99 102 241 / 0.2)',
      },
      animation: {
        'fade-in':      'fadeIn 0.15s ease-out',
        'fade-out':     'fadeOut 0.15s ease-in',
        'slide-in-left':'slideInLeft 0.2s ease-out',
        'slide-in-up':  'slideInUp 0.2s ease-out',
        'slide-in-right':'slideInRight 0.2s ease-out',
        'scale-in':     'scaleIn 0.15s ease-out',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
        'skeleton':     'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to:   { opacity: '0' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.7' },
        },
        skeleton: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionDuration: {
        '50':  '50ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'snap':   'cubic-bezier(0.87, 0, 0.13, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
