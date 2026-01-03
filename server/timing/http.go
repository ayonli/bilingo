package timing

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

type contextKey string

const timingContextKey = contextKey("timing")

type TimingMetrics struct {
	StartTime   int64
	EndTime     int64
	Description *string
}

func sanitizeTimers(timers map[string]*TimingMetrics) map[string]*TimingMetrics {
	total, ok := timers["total"]
	_timers := make(map[string]*TimingMetrics)

	for name, metrics := range timers {
		if name != "total" && metrics.EndTime > 0 {
			_timers[name] = metrics
		}
	}

	if ok && total.EndTime > 0 {
		_timers["total"] = total
	}

	return _timers
}

// sanitizeMetricName sanitizes metric name to conform to Server-Timing specification
// Metric names must be tokens (no spaces, semicolons, commas, etc.)
func sanitizeMetricName(name string) string {
	// Replace spaces and other invalid characters with hyphens
	name = strings.ReplaceAll(name, " ", "-")
	name = strings.ReplaceAll(name, ";", "-")
	name = strings.ReplaceAll(name, ",", "-")
	name = strings.ReplaceAll(name, "\"", "")
	name = strings.ReplaceAll(name, "=", "-")
	return name
}

// formatServerTiming formats timing metrics into Server-Timing header value
func formatServerTiming(timers map[string]*TimingMetrics) string {
	var parts []string

	for name, metrics := range timers {
		if metrics.EndTime == 0 {
			continue
		}

		// Sanitize metric name to conform to Server-Timing spec
		sanitizedName := sanitizeMetricName(name)
		duration := metrics.EndTime - metrics.StartTime
		metric := fmt.Sprintf("%s;dur=%d", sanitizedName, duration)

		if metrics.Description != nil && *metrics.Description != "" {
			// Escape double quotes in description
			desc := strings.ReplaceAll(*metrics.Description, `"`, `\"`)
			metric = fmt.Sprintf("%s;desc=\"%s\"", metric, desc)
		} else if name == "total" {
			metric = fmt.Sprintf("%s;desc=\"Total\"", metric)
		}

		parts = append(parts, metric)
	}

	return strings.Join(parts, ", ")
}

// UseTiming is a middleware that initializes timing metrics in the request context
func UseTiming(ctx *fiber.Ctx) error {
	timers := make(map[string]*TimingMetrics)
	startTime := time.Now().UnixMilli()

	newCtx := context.WithValue(ctx.UserContext(), timingContextKey, timers)
	ctx.SetUserContext(newCtx)

	err := ctx.Next()

	// Automatically add total timing if not explicitly set but other timers exist
	if len(timers) > 0 {
		if _, hasTotal := timers["total"]; !hasTotal {
			timers["total"] = &TimingMetrics{
				StartTime: startTime,
				EndTime:   time.Now().UnixMilli(),
			}
		}
	}

	// Add Server-Timing header with sanitized timing metrics
	sanitized := sanitizeTimers(timers)
	if len(sanitized) > 0 {
		serverTiming := formatServerTiming(sanitized)
		if serverTiming != "" {
			ctx.Set("Server-Timing", serverTiming)
		}
	}

	return err
}

// Start starts timing for a given name with an optional description
func Start(ctx context.Context, name string, description ...string) {
	timers, ok := ctx.Value(timingContextKey).(map[string]*TimingMetrics)
	if !ok {
		return
	}

	var desc string
	if len(description) > 0 && description[0] != "" {
		desc = description[0]
	}

	timers[name] = &TimingMetrics{
		StartTime:   time.Now().UnixMilli(),
		Description: &desc,
	}
}

// End ends timing for a given name
func End(ctx context.Context, name string) {
	timers, ok := ctx.Value(timingContextKey).(map[string]*TimingMetrics)
	if !ok {
		return
	}

	if metrics, exists := timers[name]; exists {
		metrics.EndTime = time.Now().UnixMilli()
	}
}
