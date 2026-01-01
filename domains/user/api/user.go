package api

import (
	"errors"

	domain "github.com/ayonli/bilingo/domains/user"
	"github.com/ayonli/bilingo/domains/user/service"
	"github.com/ayonli/bilingo/domains/user/types"
	"github.com/ayonli/bilingo/server"
	"github.com/gofiber/fiber/v2"
)

var UserApi = server.NewApiEndpoint("/users")

func init() {
	UserApi.Get("/:email", getUser)
	UserApi.Get("/", listUsers)
	UserApi.Post("/", createUser)
	UserApi.Patch("/:email", updateUser)
	UserApi.Delete("/:email", deleteUser)
}

func getUser(ctx *fiber.Ctx) error {
	email := ctx.Params("email")
	user, err := service.GetUser(ctx.Context(), email)
	if err != nil {
		return err
	} else if user == nil {
		return server.Error(ctx, 404, "User not found")
	}

	return server.Success(ctx, user)
}

func listUsers(ctx *fiber.Ctx) error {
	var query types.UserListQuery
	if err := ctx.QueryParser(&query); err != nil {
		return err
	}

	result, err := service.ListUsers(ctx.Context(), query)
	if err != nil {
		return err
	}

	return server.Success(ctx, result)
}

func createUser(ctx *fiber.Ctx) error {
	var data types.UserCreate
	if err := ctx.BodyParser(&data); err != nil {
		return err
	}

	user, err := service.CreateUser(ctx.Context(), &data)
	if err != nil {
		return err
	}

	return server.Success(ctx, user)
}

func updateUser(ctx *fiber.Ctx) error {
	email := ctx.Params("email")
	var data types.UserUpdate
	if err := ctx.BodyParser(&data); err != nil {
		return err
	}

	user, err := service.UpdateUser(ctx.Context(), email, &data)
	if errors.Is(err, domain.ErrUserNotFound) {
		return server.Error(ctx, 404, "User not found")
	} else if err != nil {
		return err
	}

	return server.Success(ctx, user)
}

func deleteUser(ctx *fiber.Ctx) error {
	email := ctx.Params("email")
	err := service.DeleteUser(ctx.Context(), email)

	if errors.Is(err, domain.ErrUserNotFound) {
		return server.Error(ctx, 404, "User not found")
	} else if err != nil {
		return err
	}

	return server.Success[any](ctx, nil)
}
