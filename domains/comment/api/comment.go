package api

import (
	"errors"
	"fmt"
	"strconv"

	domain "github.com/ayonli/bilingo/domains/comment"
	"github.com/ayonli/bilingo/domains/comment/service"
	"github.com/ayonli/bilingo/domains/comment/types"
	"github.com/ayonli/bilingo/server"
	"github.com/ayonli/bilingo/server/auth"
	"github.com/gofiber/fiber/v2"
)

var CommentApi = server.NewApiEntry("/comments", auth.UseAuth)

func init() {
	CommentApi.Get("/", listComments)
	CommentApi.Get("/:id", getComment)
	CommentApi.Post("/", createComment)
	CommentApi.Patch("/:id", auth.RequireAuth, updateComment)
	CommentApi.Delete("/:id", auth.RequireAuth, deleteComment)
}

func getComment(ctx *fiber.Ctx) error {
	id, err := strconv.ParseUint(ctx.Params("id"), 10, 32)
	if err != nil {
		return server.Error(ctx, 400, fmt.Errorf("invalid comment ID: %w", err))
	}

	comment, err := service.GetComment(ctx.UserContext(), uint(id))
	if errors.Is(err, domain.ErrCommentNotFound) {
		return server.Error(ctx, 404, domain.ErrCommentNotFound)
	} else if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, comment)
}

func listComments(ctx *fiber.Ctx) error {
	var query types.CommentListQuery
	if err := ctx.QueryParser(&query); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed query: %w", err))
	}

	result, err := service.ListComments(ctx.UserContext(), query)
	if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, result)
}

func createComment(ctx *fiber.Ctx) error {
	var data types.CommentCreate
	if err := ctx.BodyParser(&data); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed request body: %w", err))
	}

	comment, err := service.CreateComment(ctx.UserContext(), &data)
	if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, comment)
}

func updateComment(ctx *fiber.Ctx) error {
	id, err := strconv.ParseUint(ctx.Params("id"), 10, 32)
	if err != nil {
		return server.Error(ctx, 400, fmt.Errorf("invalid comment ID: %w", err))
	}

	var data types.CommentUpdate
	if err := ctx.BodyParser(&data); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed request body: %w", err))
	}

	comment, err := service.UpdateComment(ctx.UserContext(), uint(id), &data)
	if err != nil {
		if errors.Is(err, domain.ErrCommentNotFound) {
			return server.Error(ctx, 404, domain.ErrCommentNotFound)
		}
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, comment)
}

func deleteComment(ctx *fiber.Ctx) error {
	id, err := strconv.ParseUint(ctx.Params("id"), 10, 32)
	if err != nil {
		return server.Error(ctx, 400, fmt.Errorf("invalid comment ID: %w", err))
	}

	if err := service.DeleteComment(ctx.UserContext(), uint(id)); err != nil {
		if errors.Is(err, domain.ErrCommentNotFound) {
			return server.Error(ctx, 404, domain.ErrCommentNotFound)
		}
		return server.Error(ctx, 500, err)
	}

	return server.Success[any](ctx, nil)
}
