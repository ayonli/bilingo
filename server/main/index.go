package main

import (
	_ "github.com/ayonli/bilingo/domains/article/api"
	_ "github.com/ayonli/bilingo/domains/user/api"
	"github.com/ayonli/bilingo/server"
	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New(fiber.Config{
		Immutable: true,
	})

	// Apply auth middleware to all API routes
	server.Api.Use(server.AuthMiddleware)

	app.Mount("/api", server.Api)

	err := app.Listen(":8090")
	if err != nil {
		panic(err)
	}
}
