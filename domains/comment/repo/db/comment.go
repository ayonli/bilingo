package impl

import (
	"context"
	"errors"
	"fmt"

	"github.com/ayonli/bilingo/common"
	domain "github.com/ayonli/bilingo/domains/comment"
	"github.com/ayonli/bilingo/domains/comment/models"
	"github.com/ayonli/bilingo/domains/comment/tables"
	"github.com/ayonli/bilingo/domains/comment/types"
	"github.com/ayonli/bilingo/server/db"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type CommentRepo struct{}

func (r *CommentRepo) Get(ctx context.Context, id uint) (*models.Comment, error) {
	conn, err := db.Default()
	if err != nil {
		return nil, db.ConnError(err)
	}

	comment, err := gorm.G[models.Comment](conn).Where(tables.Comment.ID.Eq(id)).First(ctx)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, domain.ErrCommentNotFound
	} else if err != nil {
		return nil, fmt.Errorf("failed to find comment: %w", err)
	}

	return &comment, nil
}

func (r *CommentRepo) List(ctx context.Context, query *types.CommentListQuery) (*common.PaginatedResult[models.Comment], error) {
	conn, err := db.Default()
	if err != nil {
		return nil, db.ConnError(err)
	}

	q := gorm.G[models.Comment](conn).
		Where(tables.Comment.BizType.Eq(query.BizType)).
		Where(tables.Comment.BizId.Eq(query.BizId))

	if query.Author != nil && *query.Author != "" {
		q = q.Where(tables.Comment.Author.Eq(*query.Author))
	}

	if query.ParentId != nil {
		q = q.Where(tables.Comment.ParentId.Eq(*query.ParentId))
	}

	// Count total before applying pagination
	total, err := q.Count(ctx, "*")
	if err != nil {
		return nil, fmt.Errorf("failed to count comments: %w", err)
	}

	q = q.Order(tables.Comment.CreatedAt.Desc())
	q = q.Limit(query.PageSize)
	q = q.Offset(query.PageSize * (query.Page - 1))

	comments, err := q.Find(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get comment list: %w", err)
	} else if len(comments) == 0 {
		return &common.PaginatedResult[models.Comment]{Total: 0, List: []models.Comment{}}, nil
	}

	return &common.PaginatedResult[models.Comment]{Total: int(total), List: comments}, nil
}

func (r *CommentRepo) Create(ctx context.Context, data *types.CommentCreate) (*models.Comment, error) {
	conn, err := db.Default()
	if err != nil {
		return nil, db.ConnError(err)
	}

	comment := &models.Comment{
		BizType:  data.BizType,
		BizId:    data.BizId,
		Content:  data.Content,
		Author:   data.Author,
		ParentId: data.ParentId,
	}

	if err := gorm.G[models.Comment](conn).Create(ctx, comment); err != nil {
		return nil, fmt.Errorf("failed to create comment: %w", err)
	}

	return comment, nil
}

func (r *CommentRepo) Update(ctx context.Context, id uint, data *types.CommentUpdate) (*models.Comment, error) {
	comment, err := r.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	var updates []clause.Assigner

	if data.Content != nil && *data.Content != "" && *data.Content != comment.Content {
		updates = append(updates, tables.Comment.Content.Set(*data.Content))
	}

	if len(updates) == 0 {
		return comment, nil // No updates needed
	}

	conn, err := db.Default()
	if err != nil {
		return nil, db.ConnError(err)
	}

	rowsAffected, err := gorm.G[models.Comment](conn).Where(tables.Comment.ID.Eq(id)).Set(updates...).Update(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to update comment: %w", err)
	} else if rowsAffected == 0 {
		return nil, domain.ErrCommentNotFound
	}

	return r.Get(ctx, id)
}

func (r *CommentRepo) Delete(ctx context.Context, id uint) error {
	conn, err := db.Default()
	if err != nil {
		return db.ConnError(err)
	}

	rowsAffected, err := gorm.G[models.Comment](conn).Where(tables.Comment.ID.Eq(id)).Delete(ctx)
	if err != nil {
		return fmt.Errorf("failed to delete comment: %w", err)
	} else if rowsAffected == 0 {
		return domain.ErrCommentNotFound
	}

	return nil
}
