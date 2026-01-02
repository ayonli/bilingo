package service

import (
	"context"
	"errors"

	"github.com/ayonli/bilingo/common"
	"github.com/ayonli/bilingo/domains/article/models"
	"github.com/ayonli/bilingo/domains/article/repo"
	"github.com/ayonli/bilingo/domains/article/types"
)

func GetArticle(ctx context.Context, id uint) (*models.Article, error) {
	return repo.ArticleRepo.Get(ctx, id)
}

func ListArticles(ctx context.Context, query types.ArticleListQuery) (*common.PaginatedResult[models.Article], error) {
	return repo.ArticleRepo.List(ctx, &query)
}

func CreateArticle(ctx context.Context, data *types.ArticleCreate, author string) (*models.Article, error) {
	return repo.ArticleRepo.Create(ctx, data, author)
}

func UpdateArticle(ctx context.Context, id uint, updates *types.ArticleUpdate) (*models.Article, error) {
	return repo.ArticleRepo.Update(ctx, id, updates)
}

func DeleteArticle(ctx context.Context, id uint) error {
	return repo.ArticleRepo.Delete(ctx, id)
}

func LikeArticle(ctx context.Context, id uint, action string) (*models.Article, error) {
	article, err := repo.ArticleRepo.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	switch action {
	case "like":
		return repo.ArticleRepo.UpdateLikes(ctx, id, article.Likes+1)
	case "unlike":
		if article.Likes > 0 {
			return repo.ArticleRepo.UpdateLikes(ctx, id, article.Likes-1)
		}
		return article, nil
	case "dislike":
		return repo.ArticleRepo.UpdateDislikes(ctx, id, article.Dislikes+1)
	case "undislike":
		if article.Dislikes > 0 {
			return repo.ArticleRepo.UpdateDislikes(ctx, id, article.Dislikes-1)
		}
		return article, nil
	default:
		return nil, errors.New("invalid action")
	}
}
