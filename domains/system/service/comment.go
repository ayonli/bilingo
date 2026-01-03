package service

import (
	"context"

	"github.com/ayonli/bilingo/common"
	"github.com/ayonli/bilingo/domains/system/models"
	"github.com/ayonli/bilingo/domains/system/repo"
	"github.com/ayonli/bilingo/domains/system/types"
)

func GetComment(ctx context.Context, id uint) (*models.Comment, error) {
	return repo.CommentRepo.Get(ctx, id)
}

func ListComments(ctx context.Context, query types.CommentListQuery) (*common.PaginatedResult[models.Comment], error) {
	return repo.CommentRepo.List(ctx, &query)
}

func CreateComment(ctx context.Context, data *types.CommentCreate) (*models.Comment, error) {
	return repo.CommentRepo.Create(ctx, data)
}

func UpdateComment(ctx context.Context, id uint, updates *types.CommentUpdate) (*models.Comment, error) {
	return repo.CommentRepo.Update(ctx, id, updates)
}

func DeleteComment(ctx context.Context, id uint) error {
	return repo.CommentRepo.Delete(ctx, id)
}
