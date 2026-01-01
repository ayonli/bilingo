import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import paths from "vite-tsconfig-paths"

// https://vite.dev/config/
export default defineConfig({
    build: {
        outDir: "dist/web",
    },
    plugins: [
        react(),
        paths(),
    ],
})
