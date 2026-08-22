/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b100e',
        panel: '#121a16',
        panelLight: '#18231d',
        line: '#26352c',
        moss: '#9ed44b',
        mossDark: '#6d9d30',
        cream: '#f4f4e9',
        muted: '#93a196',
        amber: '#e8aa55',
        rose: '#ef8271',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(158, 212, 75, 0.09), 0 20px 50px rgba(0, 0, 0, 0.16)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['DM Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

