/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./frontend/index.html",
    "./frontend/src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          bg: 'rgba(255, 255, 255, 0.1)',
          'bg-hover': 'rgba(255, 255, 255, 0.15)',
          border: 'rgba(255, 255, 255, 0.2)',
        },
        primary: {
          light: '#667eea',
          DEFAULT: '#764ba2',
          dark: '#5a3f8a',
        },
        daily: {
          light: '#4facfe',
          DEFAULT: '#00f2fe',
        },
        creative: {
          light: '#667eea',
          DEFAULT: '#764ba2',
        },
        success: {
          light: '#11998e',
          DEFAULT: '#38ef7d',
        },
        danger: {
          light: '#eb3349',
          DEFAULT: '#f45c43',
        },
      },
      backdropBlur: {
        glass: '10px',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'daily-gradient': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'creative-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'success-gradient': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        'danger-gradient': 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
        'bg-gradient': 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      },
    },
  },
  plugins: [],
}
