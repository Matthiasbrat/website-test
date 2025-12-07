/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      // Semantic colors mapped to CSS variables
      bg: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        tertiary: 'var(--bg-tertiary)',
        code: 'var(--bg-code)',
        hover: 'var(--bg-hover)',
        active: 'var(--bg-active)',
      },
      text: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        link: 'var(--text-link)',
        'link-hover': 'var(--text-link-hover)',
        heading: 'var(--text-heading)',
      },
      border: {
        DEFAULT: 'var(--border-default)',
        subtle: 'var(--border-subtle)',
        focus: 'var(--border-focus)',
      },
      accent: {
        DEFAULT: 'var(--accent)',
        hover: 'var(--accent-hover)',
        text: 'var(--accent-text)',
      },
      // Syntax highlighting
      syntax: {
        keyword: 'var(--syntax-keyword)',
        string: 'var(--syntax-string)',
        number: 'var(--syntax-number)',
        comment: 'var(--syntax-comment)',
        function: 'var(--syntax-function)',
        variable: 'var(--syntax-variable)',
        operator: 'var(--syntax-operator)',
        punctuation: 'var(--syntax-punctuation)',
        class: 'var(--syntax-class)',
        property: 'var(--syntax-property)',
      },
      // Status colors
      success: 'var(--status-success)',
      warning: 'var(--status-warning)',
      error: 'var(--status-error)',
      info: 'var(--status-info)',
    },
    extend: {
      fontFamily: {
        sans: ['Hanken Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'xl': '20px',
        '2xl': '24px',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        'glass': '5px',
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--text-primary)',
            a: {
              color: 'var(--text-link)',
              '&:hover': {
                color: 'var(--text-link-hover)',
              },
            },
            h1: { color: 'var(--text-heading)' },
            h2: { color: 'var(--text-heading)' },
            h3: { color: 'var(--text-heading)' },
            h4: { color: 'var(--text-heading)' },
            strong: { color: 'var(--text-primary)' },
            code: {
              color: 'var(--syntax-keyword)',
              backgroundColor: 'var(--bg-code)',
              borderRadius: '4px',
              padding: '2px 6px',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            blockquote: {
              color: 'var(--text-secondary)',
              borderLeftColor: 'var(--accent)',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
