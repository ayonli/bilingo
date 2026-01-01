package api

import (
	"errors"
	"fmt"
	"strconv"

	domain "github.com/ayonli/bilingo/domains/article"
	"github.com/ayonli/bilingo/domains/article/service"
	"github.com/ayonli/bilingo/domains/article/types"
	"github.com/ayonli/bilingo/server"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

var ArticleApi = server.NewApiEntry("/articles")

func init() {
	ArticleApi.Post("/", server.RequireAuth, createArticle)
	ArticleApi.Get("/", listArticles)
	ArticleApi.Get("/:id", getArticle)
	ArticleApi.Patch("/:id", server.RequireAuth, updateArticle)
	ArticleApi.Delete("/:id", server.RequireAuth, deleteArticle)
	ArticleApi.Post("/:id/like", likeArticle)
}

func createArticle(ctx *fiber.Ctx) error {
	// Get authenticated user email
	email, ok := server.GetUserEmail(ctx.Context())
	if !ok {
		return server.Error(ctx, 401, fmt.Errorf("authentication required"))
	}

	var data types.ArticleCreate
	if err := ctx.BodyParser(&data); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed request body: %w", err))
	}

	article, err := service.CreateArticle(ctx.Context(), &data, email)
	if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, article)
}

func getArticle(ctx *fiber.Ctx) error {
	id, err := strconv.ParseUint(ctx.Params("id"), 10, 32)
	if err != nil {
		return server.Error(ctx, 400, fmt.Errorf("invalid article ID: %w", err))
	}

	article, err := service.GetArticle(ctx.Context(), uint(id))
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return server.Error(ctx, 404, domain.ErrArticleNotFound)
	} else if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, article)
}

func listArticles(ctx *fiber.Ctx) error {
	var query types.ArticleListQuery
	if err := ctx.QueryParser(&query); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed query: %w", err))
	}

	result, err := service.ListArticles(ctx.Context(), query)
	if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, result)
}

func updateArticle(ctx *fiber.Ctx) error {
	// Get authenticated user email
	email, ok := server.GetUserEmail(ctx.Context())
	if !ok {
		return server.Error(ctx, 401, fmt.Errorf("authentication required"))
	}

	id, err := strconv.ParseUint(ctx.Params("id"), 10, 32)
	if err != nil {
		return server.Error(ctx, 400, fmt.Errorf("invalid article ID: %w", err))
	}

	// Check if user is the author
	article, err := service.GetArticle(ctx.Context(), uint(id))
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return server.Error(ctx, 404, domain.ErrArticleNotFound)
	} else if err != nil {
		return server.Error(ctx, 500, err)
	}

	if article.Author != email {
		return server.Error(ctx, 403, domain.ErrUnauthorized)
	}

	var data types.ArticleUpdate
	if err := ctx.BodyParser(&data); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed request body: %w", err))
	}

	if err := service.UpdateArticle(ctx.Context(), uint(id), &data); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return server.Error(ctx, 404, domain.ErrArticleNotFound)
		}
		return server.Error(ctx, 500, err)
	}

	return server.Success[any](ctx, nil)
}

func deleteArticle(ctx *fiber.Ctx) error {
	// Get authenticated user email
	email, ok := server.GetUserEmail(ctx.Context())
	if !ok {
		return server.Error(ctx, 401, fmt.Errorf("authentication required"))
	}

	id, err := strconv.ParseUint(ctx.Params("id"), 10, 32)
	if err != nil {
		return server.Error(ctx, 400, fmt.Errorf("invalid article ID: %w", err))
	}

	// Check if user is the author
	article, err := service.GetArticle(ctx.Context(), uint(id))
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return server.Error(ctx, 404, domain.ErrArticleNotFound)
	} else if err != nil {
		return server.Error(ctx, 500, err)
	}

	if article.Author != email {
		return server.Error(ctx, 403, domain.ErrUnauthorized)
	}

	if err := service.DeleteArticle(ctx.Context(), uint(id)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return server.Error(ctx, 404, domain.ErrArticleNotFound)
		}
		return server.Error(ctx, 500, err)
	}

	return server.Success[any](ctx, nil)
}

func likeArticle(ctx *fiber.Ctx) error {
	id, err := strconv.ParseUint(ctx.Params("id"), 10, 32)
	if err != nil {
		return server.Error(ctx, 400, fmt.Errorf("invalid article ID: %w", err))
	}

	var data types.ArticleLikeAction
	if err := ctx.BodyParser(&data); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed request body: %w", err))
	}

	if err := service.LikeArticle(ctx.Context(), uint(id), data.Action); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return server.Error(ctx, 404, domain.ErrArticleNotFound)
		}
		return server.Error(ctx, 500, err)
	}

	return server.Success[any](ctx, nil)
}
