/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // Modern SaaS Design System Colors
      colors: {
        // Core system colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // Gray scale (50-900)
        gray: {
          50: 'hsl(var(--gray-50))',
          100: 'hsl(var(--gray-100))',
          200: 'hsl(var(--gray-200))',
          300: 'hsl(var(--gray-300))',
          400: 'hsl(var(--gray-400))',
          500: 'hsl(var(--gray-500))',
          600: 'hsl(var(--gray-600))',
          700: 'hsl(var(--gray-700))',
          800: 'hsl(var(--gray-800))',
          900: 'hsl(var(--gray-900))',
        },

        // Accent color (#6B4EFF)
        accent: {
          50: 'hsl(var(--accent-50))',
          100: 'hsl(var(--accent-100))',
          200: 'hsl(var(--accent-200))',
          300: 'hsl(var(--accent-300))',
          400: 'hsl(var(--accent-400))',
          500: 'hsl(var(--accent-500))', // Primary accent
          600: 'hsl(var(--accent-600))',
          700: 'hsl(var(--accent-700))',
          800: 'hsl(var(--accent-800))',
          900: 'hsl(var(--accent-900))',
          foreground: 'hsl(var(--accent-foreground))',
        },

        // Semantic colors
        primary: {
          DEFAULT: 'hsl(var(--accent-500))', // Use accent as primary
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        success: {
          50: 'hsl(var(--success-50))',
          500: 'hsl(var(--success-500))',
          600: 'hsl(var(--success-600))',
          foreground: 'hsl(var(--success-foreground))',
        },
        error: {
          50: 'hsl(var(--error-50))',
          500: 'hsl(var(--error-500))',
          600: 'hsl(var(--error-600))',
          foreground: 'hsl(var(--error-foreground))',
        },
        warning: {
          50: 'hsl(var(--warning-50))',
          500: 'hsl(var(--warning-500))',
          600: 'hsl(var(--warning-600))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--error-500))',
          foreground: 'hsl(var(--error-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },

      // 8px spacing system
      spacing: {
        0.5: '4px', // 0.5 * 8px
        1: '8px', // 1 * 8px
        1.5: '12px', // 1.5 * 8px
        2: '16px', // 2 * 8px
        2.5: '20px', // 2.5 * 8px
        3: '24px', // 3 * 8px
        3.5: '28px', // 3.5 * 8px
        4: '32px', // 4 * 8px
        5: '40px', // 5 * 8px
        6: '48px', // 6 * 8px
        7: '56px', // 7 * 8px
        8: '64px', // 8 * 8px
        9: '72px', // 9 * 8px
        10: '80px', // 10 * 8px
        12: '96px', // 12 * 8px
        14: '112px', // 14 * 8px
        16: '128px', // 16 * 8px
        20: '160px', // 20 * 8px
        24: '192px', // 24 * 8px
        28: '224px', // 28 * 8px (sidebar expanded)
        32: '256px', // 32 * 8px
      },

      // Modern border radius system
      borderRadius: {
        sm: '4px', // Small radius
        md: '8px', // Medium radius
        lg: '12px', // Large radius
        xl: '16px', // Extra large radius
        '2xl': '24px', // 2x large radius
      },

      // Typography system
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }], // Body text
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }], // Card metrics
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['32px', { lineHeight: '40px' }], // Hero text
      },

      // Box shadow system
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.1)',
        dropdown: '0 4px 24px rgba(0, 0, 0, 0.12)',
        modal: '0 8px 32px rgba(0, 0, 0, 0.16)',
      },

      // Z-index system
      zIndex: {
        dropdown: '900',
        modal: '1000',
        tooltip: '1100',
      },

      // Animation system
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 150ms ease-out',
        'slide-in': 'slide-in 150ms ease-out',
      },
    },
  },

  plugins: [require('tailwindcss-animate')], // eslint-disable-line @typescript-eslint/no-require-imports
};
