package server

import (
	"context"
	"errors"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserEmailKey contextKey = "userEmail"

var jwtSecret = []byte(getJWTSecret())

func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "bilingo-secret-key-change-in-production"
	}
	return secret
}

// AuthMiddleware validates JWT token from cookie and sets user email in context
func AuthMiddleware(ctx *fiber.Ctx) error {
	tokenString := ctx.Cookies("auth_token")
	if tokenString == "" {
		return ctx.Next()
	}

	token, err := jwt.ParseWithClaims(tokenString, &jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return ctx.Next()
	}

	if claims, ok := token.Claims.(*jwt.MapClaims); ok {
		claimsMap := *claims
		if email, ok := claimsMap["email"].(string); ok {
			ctx.Locals(string(UserEmailKey), email)

			// Also set in context for service layer
			newCtx := context.WithValue(ctx.Context(), UserEmailKey, email)
			ctx.SetUserContext(newCtx)
		}
	}

	return ctx.Next()
}

// RequireAuth middleware ensures user is authenticated
func RequireAuth(ctx *fiber.Ctx) error {
	email := ctx.Locals(string(UserEmailKey))
	if email == nil || email == "" {
		return Error(ctx, 401, errors.New("unauthorized: authentication required"))
	}
	return ctx.Next()
}

// GetUserEmail retrieves user email from context
func GetUserEmail(ctx context.Context) (string, bool) {
	email, ok := ctx.Value(UserEmailKey).(string)
	return email, ok
}

// GenerateToken generates a JWT token for the given email
func GenerateToken(email string) (string, error) {
	now := time.Now()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": email,
		"iat":   now.Unix(),
		"exp":   now.Add(7 * 24 * time.Hour).Unix(), // 7 days
	})

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateToken validates a JWT token and returns the email
func ValidateToken(tokenString string) (string, error) {
	tokenString = strings.TrimSpace(tokenString)
	if tokenString == "" {
		return "", errors.New("token is empty")
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return jwtSecret, nil
	})

	if err != nil {
		return "", err
	}

	if !token.Valid {
		return "", errors.New("invalid token")
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		if email, ok := claims["email"].(string); ok {
			return email, nil
		}
	}

	return "", errors.New("email not found in token")
}
