package main

import (
	"github.com/ayonli/bilingo/server"
	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	app.Mount("/api", server.Api)

	err := app.Listen(":8080")
	if err != nil {
		panic(err)
	}
}
