package api

import (
	"errors"
	"fmt"
	"strconv"

	domain "github.com/ayonli/bilingo/domains/article"
	"github.com/ayonli/bilingo/domains/article/service"
	"github.com/ayonli/bilingo/domains/article/types"
	"github.com/ayonli/bilingo/server"
	"github.com/ayonli/bilingo/server/auth"
	"github.com/gofiber/fiber/v2"
)

var ArticleApi = server.NewApiEntry("/articles", auth.UseAuth)

func init() {
	ArticleApi.Get("/", listArticles)
	ArticleApi.Get("/:id", getArticle)
	ArticleApi.Post("/", auth.RequireAuth, createArticle)
	ArticleApi.Patch("/:id", auth.RequireAuth, updateArticle)
	ArticleApi.Delete("/:id", auth.RequireAuth, deleteArticle)
	ArticleApi.Post("/:id/like", auth.RequireAuth, likeArticle)
}

func getArticle(ctx *fiber.Ctx) error {
	id, err := strconv.ParseUint(ctx.Params("id"), 10, 32)
	if err != nil {
		return server.Error(ctx, 400, fmt.Errorf("invalid article ID: %w", err))
	}

	article, err := service.GetArticle(ctx.UserContext(), uint(id))
	if errors.Is(err, domain.ErrArticleNotFound) {
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

	result, err := service.ListArticles(ctx.UserContext(), query)
	if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, result)
}

func createArticle(ctx *fiber.Ctx) error {
	// Get authenticated user
	user, ok := auth.GetUser(ctx.UserContext())
	if !ok {
		return server.Error(ctx, 401, auth.ErrUnauthorized)
	}

	var data types.ArticleCreate
	if err := ctx.BodyParser(&data); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed request body: %w", err))
	}

	article, err := service.CreateArticle(ctx.UserContext(), &data, user.Email)
	if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, article)
}

func updateArticle(ctx *fiber.Ctx) error {
	// Get authenticated user
	user, ok := auth.GetUser(ctx.UserContext())
	if !ok {
		return server.Error(ctx, 401, auth.ErrUnauthorized)
	}

	id, err := strconv.ParseUint(ctx.Params("id"), 10, 32)
	if err != nil {
		return server.Error(ctx, 400, fmt.Errorf("invalid article ID: %w", err))
	}

	article, err := service.GetArticle(ctx.UserContext(), uint(id))
	if errors.Is(err, domain.ErrArticleNotFound) {
		return server.Error(ctx, 404, domain.ErrArticleNotFound)
	} else if err != nil {
		return server.Error(ctx, 500, err)
	}

	// Check if user is the author
	if article.Author != user.Email {
		return server.Error(ctx, 403, domain.ErrUnauthorized)
	}

	var data types.ArticleUpdate
	if err := ctx.BodyParser(&data); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed request body: %w", err))
	}

	article, err = service.UpdateArticle(ctx.UserContext(), uint(id), &data)
	if err != nil {
		if errors.Is(err, domain.ErrArticleNotFound) {
			return server.Error(ctx, 404, domain.ErrArticleNotFound)
		}
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, article)
}

func deleteArticle(ctx *fiber.Ctx) error {
	user, ok := auth.GetUser(ctx.UserContext())
	if !ok {
		return server.Error(ctx, 401, auth.ErrUnauthorized)
	}

	id, err := strconv.ParseUint(ctx.Params("id"), 10, 32)
	if err != nil {
		return server.Error(ctx, 400, fmt.Errorf("invalid article ID: %w", err))
	}

	article, err := service.GetArticle(ctx.UserContext(), uint(id))
	if errors.Is(err, domain.ErrArticleNotFound) {
		return server.Error(ctx, 404, domain.ErrArticleNotFound)
	} else if err != nil {
		return server.Error(ctx, 500, err)
	}

	// Check if user is the author
	if article.Author != user.Email {
		return server.Error(ctx, 403, domain.ErrUnauthorized)
	}

	if err := service.DeleteArticle(ctx.UserContext(), uint(id)); err != nil {
		if errors.Is(err, domain.ErrArticleNotFound) {
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

	article, err := service.LikeArticle(ctx.UserContext(), uint(id), data.Action)
	if err != nil {
		if errors.Is(err, domain.ErrArticleNotFound) {
			return server.Error(ctx, 404, domain.ErrArticleNotFound)
		}
		return server.Error(ctx, 500, err)
	}

	return server.Success[any](ctx, article)
}
