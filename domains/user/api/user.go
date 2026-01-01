package api

import (
	"errors"
	"fmt"

	domain "github.com/ayonli/bilingo/domains/user"
	"github.com/ayonli/bilingo/domains/user/service"
	"github.com/ayonli/bilingo/domains/user/types"
	"github.com/ayonli/bilingo/server"
	"github.com/ayonli/bilingo/utils"
	"github.com/gofiber/fiber/v2"
)

var UserApi = server.NewApiEntry("/users")

func init() {
	// Authentication routes (must come before /:email to avoid conflicts)
	UserApi.Post("/login", login)
	UserApi.Post("/logout", logout)
	UserApi.Get("/me", getMe)

	// User CRUD routes
	UserApi.Get("/", listUsers)
	UserApi.Post("/", createUser)
	UserApi.Get("/:email", getUser)
	UserApi.Patch("/:email", updateUser)
	UserApi.Patch("/:email/password", changePassword)
	UserApi.Delete("/:email", deleteUser)
}

func getUser(ctx *fiber.Ctx) error {
	email := ctx.Params("email")
	user, err := service.GetUser(ctx.Context(), email)
	if errors.Is(err, domain.ErrUserNotFound) {
		return server.Error(ctx, 404, domain.ErrUserNotFound)
	} else if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, user)
}

func listUsers(ctx *fiber.Ctx) error {
	var query types.UserListQuery
	if err := ctx.QueryParser(&query); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed query: %w", err))
	}

	// Manually parse array parameters
	if emailList := utils.ParseArrayQuery(ctx, "emails"); len(emailList) > 0 {
		query.Emails = &emailList
	}

	result, err := service.ListUsers(ctx.Context(), query)
	if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, result)
}

func createUser(ctx *fiber.Ctx) error {
	var data types.UserCreate
	if err := ctx.BodyParser(&data); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed input: %w", err))
	}

	user, err := service.CreateUser(ctx.Context(), &data)
	if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, user)
}

func updateUser(ctx *fiber.Ctx) error {
	email := ctx.Params("email")
	var data types.UserUpdate
	if err := ctx.BodyParser(&data); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed input: %w", err))
	}

	user, err := service.UpdateUser(ctx.Context(), email, &data)
	if errors.Is(err, domain.ErrUserNotFound) {
		return server.Error(ctx, 404, domain.ErrUserNotFound)
	} else if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, user)
}

func deleteUser(ctx *fiber.Ctx) error {
	email := ctx.Params("email")
	err := service.DeleteUser(ctx.Context(), email)

	if errors.Is(err, domain.ErrUserNotFound) {
		return server.Error(ctx, 404, domain.ErrUserNotFound)
	} else if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success[any](ctx, nil)
}

func changePassword(ctx *fiber.Ctx) error {
	email := ctx.Params("email")
	var data types.PasswordChange
	if err := ctx.BodyParser(&data); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed input: %w", err))
	}

	err := service.ChangePassword(ctx.Context(), email, &data)
	if errors.Is(err, domain.ErrUserNotFound) {
		return server.Error(ctx, 404, domain.ErrUserNotFound)
	} else if errors.Is(err, domain.ErrInvalidPassword) {
		return server.Error(ctx, 401, domain.ErrInvalidPassword)
	} else if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success[any](ctx, nil)
}

func login(ctx *fiber.Ctx) error {
	var credentials types.LoginCredentials
	if err := ctx.BodyParser(&credentials); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed input: %w", err))
	}

	user, err := service.Login(ctx.Context(), &credentials)
	if errors.Is(err, domain.ErrUserNotFound) || errors.Is(err, domain.ErrInvalidPassword) {
		return server.Error(ctx, 401, fmt.Errorf("invalid email or password"))
	} else if err != nil {
		return server.Error(ctx, 500, err)
	}

	// Generate JWT token
	token, err := server.GenerateToken(user.Email)
	if err != nil {
		return server.Error(ctx, 500, err)
	}

	// Set cookie with token
	ctx.Cookie(&fiber.Cookie{
		Name:     "auth_token",
		Value:    token,
		HTTPOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: "Lax",
		MaxAge:   86400 * 7, // 7 days
	})

	return server.Success(ctx, user)
}

func logout(ctx *fiber.Ctx) error {
	// Clear the auth cookie
	ctx.Cookie(&fiber.Cookie{
		Name:     "auth_token",
		Value:    "",
		HTTPOnly: true,
		MaxAge:   -1,
	})

	return server.Success[any](ctx, nil)
}

func getMe(ctx *fiber.Ctx) error {
	emailInterface := ctx.Locals(string(server.UserEmailKey))
	if emailInterface == nil {
		return server.Error(ctx, 401, fmt.Errorf("not logged in: email not found in context"))
	}

	email, ok := emailInterface.(string)
	if !ok || email == "" {
		return server.Error(ctx, 401, fmt.Errorf("not logged in: email is empty or invalid type"))
	}

	user, err := service.GetUser(ctx.Context(), email)
	if errors.Is(err, domain.ErrUserNotFound) {
		return server.Error(ctx, 404, domain.ErrUserNotFound)
	} else if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, user)
}
