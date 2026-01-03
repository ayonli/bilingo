package service

import (
	"context"
	"errors"
	"strconv"

	"github.com/ayonli/bilingo/common"
	"github.com/ayonli/bilingo/domains/article/models"
	"github.com/ayonli/bilingo/domains/article/repo"
	"github.com/ayonli/bilingo/domains/article/types"
	"github.com/ayonli/bilingo/server/oplog"
)

var logger = oplog.NewOpLogger("article")

func GetArticle(ctx context.Context, id uint) (*models.Article, error) {
	return repo.ArticleRepo.Get(ctx, id)
}

func ListArticles(ctx context.Context, query types.ArticleListQuery) (*common.PaginatedResult[models.Article], error) {
	return repo.ArticleRepo.List(ctx, &query)
}

func CreateArticle(ctx context.Context, data *types.ArticleCreate, author string) (*models.Article, error) {
	article, err := repo.ArticleRepo.Create(ctx, data, author)
	if err != nil {
		return nil, err
	}

	_ = logger.Success(ctx, oplog.LogData{
		ObjectId:  strconv.FormatUint(uint64(article.ID), 10),
		Operation: "create",
		NewData:   &article,
	})

	return article, nil
}

func UpdateArticle(ctx context.Context, id uint, updates *types.ArticleUpdate) (*models.Article, error) {
	oldData, err := repo.ArticleRepo.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	newData, err := repo.ArticleRepo.Update(ctx, id, updates)
	if err != nil {
		return nil, err
	}

	_ = logger.Success(ctx, oplog.LogData{
		ObjectId:  strconv.FormatUint(uint64(oldData.ID), 10),
		Operation: "update",
		OldData:   &oldData,
		NewData:   &newData,
	})

	return newData, nil
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
