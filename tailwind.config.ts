/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design tokens mapped to CSS variables (Tailwind v4 recommended)
        accent: 'hsl(var(--accent-500))',
        success: {
          50: 'hsl(var(--success-50))',
          500: 'hsl(var(--success-500))',
          600: 'hsl(var(--success-600))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          50: 'hsl(var(--warning-50))',
          500: 'hsl(var(--warning-500))',
          600: 'hsl(var(--warning-600))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        error: {
          50: 'hsl(var(--error-50))',
          500: 'hsl(var(--error-500))',
          600: 'hsl(var(--error-600))',
          foreground: 'hsl(var(--error-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--accent-500))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
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
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10)',
      },
    },
  },
};

export default config;
