package main

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/ayonli/bilingo/config"
	"github.com/ayonli/bilingo/server"
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"

	_ "github.com/ayonli/bilingo/domains/article/api"
	_ "github.com/ayonli/bilingo/domains/system/api"
	_ "github.com/ayonli/bilingo/domains/user/api"
)

func init() {
	// Load .env file if it exists (ignore errors if file doesn't exist)
	_ = godotenv.Load()
}

func main() {
	cfg := config.GetConfig()
	app := fiber.New(fiber.Config{
		AppName:   cfg.AppName,
		Immutable: true,
	})

	app.Mount("/api", server.Api)

	// Check if executable is in /dist/ directory
	executable, err := os.Executable()
	if err == nil {
		execPath := filepath.Clean(executable)
		if strings.Contains(execPath, string(filepath.Separator)+"dist"+string(filepath.Separator)) {
			// Serve static files from dist/client directory
			staticDir := filepath.Join(filepath.Dir(executable), "client")
			if stat, err := os.Stat(staticDir); err == nil && stat.IsDir() {
				indexFile := filepath.Join(staticDir, "index.html")

				// Serve static files
				app.Static("/", staticDir, fiber.Static{
					Browse:    false,
					Index:     "index.html",
					MaxAge:    86400, // 1 day cache
					ByteRange: true,
				})

				// SPA fallback: serve index.html for all non-API routes
				app.Use(func(c *fiber.Ctx) error {
					// Only handle GET requests
					if c.Method() != fiber.MethodGet {
						return fiber.ErrNotFound
					}

					// Return index.html for SPA routing
					return c.SendFile(indexFile)
				})
			}
		}
	}

	port := ":8090"
	if serverUrl := os.Getenv("SERVER_URL"); serverUrl != "" {
		port = serverUrl[strings.LastIndex(serverUrl, ":"):]
	}

	err = app.Listen(port)
	if err != nil {
		panic(err)
	}
}
