import process from "node:process"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import paths from "vite-tsconfig-paths"
import pages from "vite-plugin-pages"

// https://vite.dev/config/
export default defineConfig({
    build: {
        outDir: "dist/client",
    },
    server: {
        proxy: {
            "/api": {
                target: process.env["SERVER_URL"] || "http://localhost:8090",
                changeOrigin: true,
            },
        },
    },
    plugins: [
        react(),
        paths(),
        // @ts-ignore compatibility issue
        pages({
            dirs: [
                {
                    dir: "./domains",
                    baseRoute: "/",
                },
                {
                    dir: "./domains/user/views",
                    baseRoute: "/users",
                },
                {
                    dir: "./domains/article/views",
                    baseRoute: "/articles",
                },
            ],
        }),
    ],
})
