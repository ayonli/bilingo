package main

import (
	"os"
	"strings"

	"github.com/ayonli/bilingo/config"
	"github.com/ayonli/bilingo/server"
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"

	_ "github.com/ayonli/bilingo/domains/article/api"
	_ "github.com/ayonli/bilingo/domains/comment/api"
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

	port := ":8090"
	if serverUrl := os.Getenv("SERVER_URL"); serverUrl != "" {
		port = serverUrl[strings.LastIndex(serverUrl, ":"):]
	}

	err := app.Listen(port)
	if err != nil {
		panic(err)
	}
}
