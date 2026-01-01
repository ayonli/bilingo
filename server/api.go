package server

import (
	"github.com/ayonli/bilingo/common"
	"github.com/gofiber/fiber/v2"
)

var Api = fiber.New()

func init() {
	// Register AuthMiddleware before any routes are registered
	Api.Use(AuthMiddleware)
}

func NewApiEntry(path string) fiber.Router {
	return Api.Group(path)
}

func Success[T any](ctx *fiber.Ctx, data T, message ...string) error {
	var msg = ""
	if len(message) > 0 {
		msg = message[0]
	}
	return ctx.JSON(common.ApiResponse[T]{
		Success: true,
		Code:    200,
		Data:    data,
		Message: msg,
	})
}

func Error(ctx *fiber.Ctx, code int, err error) error {
	return ctx.Status(code).JSON(common.ApiResponse[any]{
		Success: false,
		Code:    code,
		Message: err.Error(),
	})
}
