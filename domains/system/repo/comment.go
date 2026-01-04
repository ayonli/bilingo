package repo

import (
	"context"

	"bilingo/common"
	"bilingo/domains/system/models"
	impl "bilingo/domains/system/repo/db"
	"bilingo/domains/system/types"
)

var CommentRepo ICommentRepo = &impl.CommentRepo{}

type ICommentRepo interface {
	Get(ctx context.Context, id uint) (*models.Comment, error)
	List(ctx context.Context, query *types.CommentListQuery) (*common.PaginatedResult[models.Comment], error)
	Create(ctx context.Context, data *types.CommentCreate) (*models.Comment, error)
	Update(ctx context.Context, id uint, updates *types.CommentUpdate) (*models.Comment, error)
	Delete(ctx context.Context, id uint) error
}
