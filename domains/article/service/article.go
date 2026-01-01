package service

import (
	"context"
	"errors"

	"github.com/ayonli/bilingo/common"
	"github.com/ayonli/bilingo/domains/article/models"
	"github.com/ayonli/bilingo/domains/article/repo"
	"github.com/ayonli/bilingo/domains/article/types"
)

func CreateArticle(ctx context.Context, data *types.ArticleCreate, author string) (*models.Article, error) {
	return repo.ArticleRepo.Create(ctx, data, author)
}

func GetArticle(ctx context.Context, id uint) (*models.Article, error) {
	return repo.ArticleRepo.FindByID(ctx, id)
}

func ListArticles(ctx context.Context, query types.ArticleListQuery) (*common.PaginatedResult[models.Article], error) {
	if query.Page < 1 {
		query.Page = 1
	}
	if query.PageSize < 1 || query.PageSize > 100 {
		query.PageSize = 20
	}

	return repo.ArticleRepo.List(ctx, &query)
}

func UpdateArticle(ctx context.Context, id uint, updates *types.ArticleUpdate) error {
	return repo.ArticleRepo.Update(ctx, id, updates)
}

func DeleteArticle(ctx context.Context, id uint) error {
	return repo.ArticleRepo.Delete(ctx, id)
}

func LikeArticle(ctx context.Context, id uint, action string) error {
	article, err := repo.ArticleRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	switch action {
	case "like":
		return repo.ArticleRepo.UpdateLikes(ctx, id, article.Likes+1)
	case "unlike":
		if article.Likes > 0 {
			return repo.ArticleRepo.UpdateLikes(ctx, id, article.Likes-1)
		}
		return nil
	case "dislike":
		return repo.ArticleRepo.UpdateDislikes(ctx, id, article.Dislikes+1)
	case "undislike":
		if article.Dislikes > 0 {
			return repo.ArticleRepo.UpdateDislikes(ctx, id, article.Dislikes-1)
		}
		return nil
	default:
		return errors.New("invalid action")
	}
}
