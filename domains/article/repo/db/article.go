package impl

import (
	"context"
	"errors"
	"fmt"
	"time"

	"bilingo/common"
	domain "bilingo/domains/article"
	"bilingo/domains/article/models"
	"bilingo/domains/article/tables"
	"bilingo/domains/article/types"
	"bilingo/server/db"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type ArticleRepo struct{}

func (r *ArticleRepo) Get(ctx context.Context, id uint) (*models.Article, error) {
	conn, err := db.Default()
	if err != nil {
		return nil, db.ConnError(err)
	}

	article, err := gorm.G[models.Article](conn).Where(tables.Article.ID.Eq(id)).First(ctx)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, domain.ErrArticleNotFound
	} else if err != nil {
		return nil, fmt.Errorf("failed to find article: %w", err)
	}

	return &article, nil
}

func (r *ArticleRepo) List(ctx context.Context, query *types.ArticleListQuery) (*common.PaginatedResult[models.Article], error) {
	conn, err := db.Default()
	if err != nil {
		return nil, db.ConnError(err)
	}

	q := gorm.G[models.Article](conn).Where("1 = 1")

	if query.Search != nil && *query.Search != "" {
		likePattern := "%" + *query.Search + "%"
		q = q.Where(
			q.Or(
				tables.Article.Title.Like(likePattern),
				tables.Article.Content.Like(likePattern),
			),
		)
	}

	if query.Author != nil && *query.Author != "" {
		q = q.Where(tables.Article.Author.Eq(*query.Author))
	}

	if query.Category != nil && *query.Category != "" {
		q = q.Where(tables.Article.Category.Eq(*query.Category))
	}

	// Count total before applying pagination
	total, err := q.Count(ctx, "*")
	if err != nil {
		return nil, fmt.Errorf("failed to count articles: %w", err)
	}

	q = q.Order(tables.Article.CreatedAt.Desc())
	q = q.Limit(query.PageSize)
	q = q.Offset(query.PageSize * (query.Page - 1))

	articles, err := q.Find(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get article list: %w", err)
	} else if len(articles) == 0 {
		return &common.PaginatedResult[models.Article]{Total: 0, List: []models.Article{}}, nil
	}

	return &common.PaginatedResult[models.Article]{Total: int(total), List: articles}, nil
}

func (r *ArticleRepo) Create(ctx context.Context, data *types.ArticleCreate, author string) (*models.Article, error) {
	conn, err := db.Default()
	if err != nil {
		return nil, db.ConnError(err)
	}

	now := time.Now()
	article := &models.Article{
		CreatedAt: now,
		UpdatedAt: now,
		Title:     data.Title,
		Content:   data.Content,
		Author:    author,
		Category:  data.Category,
		Tags:      data.Tags,
		Likes:     0,
		Dislikes:  0,
	}

	if err := gorm.G[models.Article](conn).Create(ctx, article); err != nil {
		return nil, fmt.Errorf("failed to create article: %w", err)
	}

	return article, nil
}

func (r *ArticleRepo) Update(ctx context.Context, id uint, data *types.ArticleUpdate) (*models.Article, error) {
	article, err := r.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	var updates []clause.Assigner

	if data.Title != nil && *data.Title != "" && *data.Title != article.Title {
		updates = append(updates, tables.Article.Title.Set(*data.Title))
	}
	if data.Content != nil && *data.Content != "" && *data.Content != article.Content {
		updates = append(updates, tables.Article.Content.Set(*data.Content))
	}
	if data.Category != nil && *data.Category != "" && *data.Category != *article.Category {
		updates = append(updates, tables.Article.Category.Set(*data.Category))
	}
	if data.Tags != nil && *data.Tags != "" && *data.Tags != *article.Tags {
		updates = append(updates, tables.Article.Tags.Set(*data.Tags))
	}

	if len(updates) == 0 {
		return article, nil // No updates needed
	}

	updates = append(updates, tables.Article.UpdatedAt.Set(time.Now()))

	conn, err := db.Default()
	if err != nil {
		return nil, db.ConnError(err)
	}

	rowsAffected, err := gorm.G[models.Article](conn).Where(tables.Article.ID.Eq(id)).Set(updates...).Update(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to update article: %w", err)
	} else if rowsAffected == 0 {
		return nil, domain.ErrArticleNotFound
	}

	return r.Get(ctx, id)
}

func (r *ArticleRepo) Delete(ctx context.Context, id uint) error {
	conn, err := db.Default()
	if err != nil {
		return db.ConnError(err)
	}

	rowsAffected, err := gorm.G[models.Article](conn).Where(tables.Article.ID.Eq(id)).Delete(ctx)
	if err != nil {
		return fmt.Errorf("failed to delete article: %w", err)
	} else if rowsAffected == 0 {
		return domain.ErrArticleNotFound
	}

	return nil
}

func (r *ArticleRepo) UpdateLikes(ctx context.Context, id uint, likes int) (*models.Article, error) {
	conn, err := db.Default()
	if err != nil {
		return nil, db.ConnError(err)
	}

	err = conn.Model(&models.Article{}).Where("id = ?", id).Update("likes", likes).Error
	if err != nil {
		return nil, fmt.Errorf("failed to update likes: %w", err)
	}

	return r.Get(ctx, id)
}

func (r *ArticleRepo) UpdateDislikes(ctx context.Context, id uint, dislikes int) (*models.Article, error) {
	conn, err := db.Default()
	if err != nil {
		return nil, db.ConnError(err)
	}

	err = conn.Model(&models.Article{}).Where("id = ?", id).Update("dislikes", dislikes).Error
	if err != nil {
		return nil, fmt.Errorf("failed to update dislikes: %w", err)
	}

	return r.Get(ctx, id)
}
