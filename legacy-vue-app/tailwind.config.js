/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#ffffff',          // Pure White Primary Background
          secBg: '#f8fafc',       // Slate 50 Secondary Background
          cardBg: '#ffffff',      // Card Background (white)
          accent: '#0284c7',      // Sky 600 Accent Cyan/Blue
          accentLight: '#f0f9ff', // Sky 50 Light Accent Background
          textPrimary: '#0f172a', // Slate 900 Primary Text
          textSecondary: '#475569', // Slate 600 Secondary Text
          border: '#e2e8f0',      // Slate 200 Border Color
          success: '#059669',     // Emerald 600 Success Green
          warning: '#d97706',     // Amber 600 Warning Amber
          danger: '#dc2626',      // Red 600 Error Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 8px -1px rgba(15, 23, 42, 0.04)',
        'premium-hover': '0 10px 25px -3px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.05)',
        'premium-sm': '0 2px 8px -1px rgba(15, 23, 42, 0.04)',
        'premium-lg': '0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 10px 10px -5px rgba(15, 23, 42, 0.02)',
      }
    },
  },
  plugins: [],
}
