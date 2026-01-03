package server

import (
	"context"

	"github.com/gofiber/fiber/v2"
)

type contextKey string

const ipContextKey = contextKey("ip")

func ipMiddleware(ctx *fiber.Ctx) error {
	ip := ctx.IP()

	newCtx := context.WithValue(ctx.UserContext(), ipContextKey, ip)
	ctx.SetUserContext(newCtx)

	return ctx.Next()
}

// GetClientIp retrieves the client IP of the HTTP request from the context,
// if not available, returns an empty string.
func GetClientIp(ctx context.Context) string {
	ip, ok := ctx.Value(ipContextKey).(string)
	if !ok {
		return ""
	}
	return ip
}
