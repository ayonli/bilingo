package server

import (
	"github.com/ayonli/bilingo/common"
	"github.com/gofiber/fiber/v2"
)

var Api = fiber.New()

func NewApiEndpoint(path string) fiber.Router {
	return Api.Group(path)
}

func Success[T any](ctx *fiber.Ctx, data T, message ...string) error {
	var msg = ""
	if len(message) > 0 {
		msg = message[0]
	}
	return ctx.JSON(common.ApiResult[T]{
		Success: true,
		Code:    200,
		Data:    data,
		Message: msg,
	})
}

func Error(ctx *fiber.Ctx, code int, err error) error {
	return ctx.JSON(common.ApiResult[any]{
		Success: false,
		Code:    code,
		Message: err.Error(),
	})
}
