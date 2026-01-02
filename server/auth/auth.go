package auth

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/ayonli/bilingo/common"
	"github.com/ayonli/bilingo/domains/user/models"
	"github.com/ayonli/bilingo/domains/user/repo"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
)

var ErrUnauthorized = errors.New("unauthorized")

var CookieName = "auth_token"
var Duration = 7 * 24 * time.Hour // 7 days
var authSecret []byte

type contextKey string

const userContextKey = contextKey("user")

func init() {
	// Load .env file if it exists (ignore errors if file doesn't exist)
	_ = godotenv.Load()

	if cookieName := os.Getenv("AUTH_COOKIE_NAME"); cookieName != "" {
		CookieName = cookieName
	}

	authDurationStr := os.Getenv("AUTH_DURATION")
	if authDurationStr != "" {
		if duration, err := time.ParseDuration(authDurationStr); err == nil {
			Duration = duration
		}
	}

	secret := os.Getenv("AUTH_SECRET")
	if secret == "" {
		secret = "bilingo-secret-key-change-in-production"
	}
	authSecret = []byte(secret)
}

// GenerateToken generates a JWT token for the given email
func GenerateToken(email string) (string, error) {
	now := time.Now()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": email,
		"iat":   now.Unix(),
		"exp":   now.Add(Duration).Unix(),
	})

	tokenString, err := token.SignedString(authSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func UseAuth(ctx *fiber.Ctx) error {
	// Extract and validate JWT token
	email, ok := extractEmailFromToken(ctx)
	if !ok {
		return ctx.Next()
	}

	// Fetch user from database
	user, err := repo.UserRepo.FindByEmail(ctx.UserContext(), email)
	if err != nil || user == nil {
		return ctx.Next()
	}

	// Store user in context
	storeUserInContext(ctx, user)
	return ctx.Next()
}

func extractEmailFromToken(ctx *fiber.Ctx) (string, bool) {
	tokenString := ctx.Cookies(CookieName)
	if tokenString == "" {
		return "", false
	}

	token, err := jwt.ParseWithClaims(tokenString, &jwt.MapClaims{}, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return authSecret, nil
	})

	if err != nil || !token.Valid {
		return "", false
	}

	claims, ok := token.Claims.(*jwt.MapClaims)
	if !ok {
		return "", false
	}

	email, ok := (*claims)["email"].(string)
	if !ok || email == "" {
		return "", false
	}

	return email, true
}

func storeUserInContext(ctx *fiber.Ctx, user *models.User) {
	// Clear password before storing
	user.Password = nil

	// Set in fiber locals for RequireAuth middleware
	ctx.Locals(userContextKey, user)

	// Set in request context for GetUser function
	newCtx := context.WithValue(ctx.UserContext(), userContextKey, user)
	ctx.SetUserContext(newCtx)
}

// GetUser retrieves the authenticated user from fiber context
// Pass ctx.UserContext() when calling this function
func GetUser(ctx context.Context) (*models.User, bool) {
	user, ok := ctx.Value(userContextKey).(*models.User)
	return user, ok
}

// RequireAuth middleware ensures user is authenticated
func RequireAuth(ctx *fiber.Ctx) error {
	user := ctx.Locals(userContextKey)
	if user == nil {
		return ctx.Status(401).JSON(common.ApiResponse[any]{
			Success: false,
			Code:    401,
			Message: ErrUnauthorized.Error(),
		})
	}
	return ctx.Next()
}
