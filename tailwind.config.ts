import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1B3A6B', bright: '#3D7FFF', dark: '#122748' },
        accent: { DEFAULT: '#F0A93B', soft: '#FDE8C4' },
        surface: '#FFFFFF',
        background: '#F6F8FB',
        border: '#E2E8F0',
        muted: '#5B6472',
        ink: '#101828',
        danger: '#D64545',
        success: '#2E9E5B',
      },
      fontFamily: {
        display: ['var(--font-sora)', 'sans-serif'],
        sans: ['var(--font-manrope)', 'sans-serif'],
      },
      borderRadius: { card: '14px' },
    },
  },
  plugins: [],
}
export default config
