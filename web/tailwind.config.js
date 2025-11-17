/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        polka: {
          pink: '#E6007A',
          black: '#000000',
          white: '#FFFFFF',
          gray: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
          }
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Geist Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Geist Mono', 'SF Mono', 'Monaco', 'Courier New', 'monospace'],
        geist: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        'pp-neue': ['var(--font-pp-neue-montreal)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'Inter', 'sans-serif'],
        'supply-sans': ['var(--font-pp-supply-sans)', 'monospace'],
      },
    },
  },
  plugins: [],
}
