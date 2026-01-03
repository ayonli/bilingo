package server

import (
	"github.com/ayonli/bilingo/common"
	"github.com/gofiber/fiber/v2"
)

var Api = fiber.New(fiber.Config{
	Immutable: true,
})

func NewApiEntry(path string, handlers ...fiber.Handler) fiber.Router {
	return Api.Group(path, handlers...)
}

func Success[T any](ctx *fiber.Ctx, data T, message ...string) error {
	var msg *string
	if len(message) > 0 {
		msg = &message[0]
	}
	return ctx.JSON(common.ApiResult[T]{
		Success: true,
		Code:    200,
		Data:    data,
		Message: msg,
	})
}

func Error(ctx *fiber.Ctx, code int, err error) error {
	msg := err.Error()
	return ctx.Status(code).JSON(common.ApiResult[any]{
		Success: false,
		Code:    code,
		Message: &msg,
	})
}
