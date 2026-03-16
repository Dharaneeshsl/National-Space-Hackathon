/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#030305",
        panel: "rgba(10, 10, 15, 0.65)",
        primary: "#00f2ff", // electric cyan
        accent: "#bc13fe", // neon magenta
        success: "#00ff9d", // cyber green
        warning: "#ffaa00",
        danger: "#ff2a2a",
        surface: "rgba(20, 20, 30, 0.4)",
      },
      fontFamily: {
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 242, 255, 0.5), inset 0 0 10px rgba(0, 242, 255, 0.2)',
        'glow-magenta': '0 0 15px rgba(188, 19, 254, 0.5), inset 0 0 10px rgba(188, 19, 254, 0.2)',
        'glow-orange': '0 0 15px rgba(255, 170, 0, 0.5), inset 0 0 10px rgba(255, 170, 0, 0.2)',
        'glow-red': '0 0 30px rgba(255, 42, 42, 0.6), inset 0 0 20px rgba(255, 42, 42, 0.3)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'glass-border': 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.5, filter: 'blur(4px)' },
          '50%': { opacity: 1, filter: 'blur(8px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      },
      animation: {
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
