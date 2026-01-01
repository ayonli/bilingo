package utils

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

// ParseArrayQuery extracts array query parameters from the request.
// It handles both formats: field[0]=value&field[1]=value and field=value1&field=value2
func ParseArrayQuery(ctx *fiber.Ctx, fieldName string) []string {
	queries := ctx.Queries()
	var result []string
	prefix := fieldName + "["

	// Try parsing as field[0], field[1], etc.
	for key, value := range queries {
		if strings.HasPrefix(key, prefix) {
			result = append(result, value)
		}
	}

	// If no array format found, try comma-separated or multiple same-name params
	if len(result) == 0 {
		if value := ctx.Query(fieldName); value != "" {
			result = []string{value}
		}
	}

	return result
}
