package api

import (
	"fmt"

	"github.com/ayonli/bilingo/domains/system/service"
	"github.com/ayonli/bilingo/domains/system/types"
	"github.com/ayonli/bilingo/server"
	"github.com/ayonli/bilingo/server/auth"
	"github.com/gofiber/fiber/v2"
)

var OpLogApi = server.NewApiEntry("/system/oplogs", auth.UseAuth)

func init() {
	OpLogApi.Get("/", auth.RequireAuth, listOpLogs)
}

func listOpLogs(ctx *fiber.Ctx) error {
	var query types.OpLogListQuery
	if err := ctx.QueryParser(&query); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed query: %w", err))
	}

	result, err := service.ListOpLogs(ctx.UserContext(), query)
	if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, result)
}
