package service

import (
	"context"
	"errors"

	"github.com/ayonli/bilingo/common"
	"github.com/ayonli/bilingo/domains/comment/models"
	"github.com/ayonli/bilingo/domains/comment/repo"
	"github.com/ayonli/bilingo/domains/comment/types"
	"github.com/ayonli/bilingo/server/auth"
)

var ErrUnauthorized = errors.New("unauthorized")

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
	// Verify the user is the author
	comment, err := repo.CommentRepo.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	user, ok := auth.GetUser(ctx)
	if !ok {
		return nil, ErrUnauthorized
	}

	if comment.Author != user.Email {
		return nil, errors.New("permission denied")
	}

	return repo.CommentRepo.Update(ctx, id, updates)
}

func DeleteComment(ctx context.Context, id uint) error {
	// Verify the user is the author
	comment, err := repo.CommentRepo.Get(ctx, id)
	if err != nil {
		return err
	}

	user, ok := auth.GetUser(ctx)
	if !ok {
		return ErrUnauthorized
	}

	if comment.Author != user.Email {
		return errors.New("permission denied")
	}

	return repo.CommentRepo.Delete(ctx, id)
}
