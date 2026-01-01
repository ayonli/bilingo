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
	ArticleApi.Post("/", createArticle)
	ArticleApi.Get("/", listArticles)
	ArticleApi.Get("/:id", getArticle)
	ArticleApi.Patch("/:id", updateArticle)
	ArticleApi.Delete("/:id", deleteArticle)
	ArticleApi.Post("/:id/like", likeArticle)
}

func createArticle(ctx *fiber.Ctx) error {
	var data types.ArticleCreate
	if err := ctx.BodyParser(&data); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed request body: %w", err))
	}

	article, err := service.CreateArticle(ctx.Context(), &data)
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
	id, err := strconv.ParseUint(ctx.Params("id"), 10, 32)
	if err != nil {
		return server.Error(ctx, 400, fmt.Errorf("invalid article ID: %w", err))
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
	id, err := strconv.ParseUint(ctx.Params("id"), 10, 32)
	if err != nil {
		return server.Error(ctx, 400, fmt.Errorf("invalid article ID: %w", err))
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
