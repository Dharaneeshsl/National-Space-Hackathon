import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "stats.js": path.resolve(__dirname, "./src/shims/stats.ts"),
      "prop-types": path.resolve(__dirname, "./src/shims/prop-types.ts"),
      "prop-types/index.js": path.resolve(__dirname, "./src/shims/prop-types.ts"),
      "prop-types/index": path.resolve(__dirname, "./src/shims/prop-types.ts")
    }
  },
  optimizeDeps: {
    // Avoid pre-bundling this heavy three.js helper lib to
    // prevent rare "Outdated Optimize Dep" cache issues
    exclude: ["@react-three/drei", "prop-types"]
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    }
  }
})
