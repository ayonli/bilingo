package main

import (
	"github.com/ayonli/bilingo/server"
	"github.com/gofiber/fiber/v2"

	_ "github.com/ayonli/bilingo/domains/article/api"
	_ "github.com/ayonli/bilingo/domains/user/api"
)

func main() {
	app := fiber.New(fiber.Config{
		Immutable: true,
	})

	app.Mount("/api", server.Api)

	err := app.Listen(":8090")
	if err != nil {
		panic(err)
	}
}
