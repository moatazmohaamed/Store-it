/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      // Add custom colors for better consistency
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
      // Add responsive breakpoints
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
  // Performance optimizations
  future: {
    hoverOnlyWhenSupported: true, // Optimize for touch devices
    respectDefaultRingColorOpacity: true,
    disableColorOpacityUtilitiesByDefault: true,
    purgeLayersByDefault: true,
  },
  // Reduce file size in production
  corePlugins: {
    preflight: true,
  },
  // Optimize for production
  mode: 'jit', // Just-in-time mode for faster builds
}
