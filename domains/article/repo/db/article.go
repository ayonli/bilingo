package db

import (
	"context"
	"errors"
	"fmt"

	"github.com/ayonli/bilingo/common"
	domain "github.com/ayonli/bilingo/domains/article"
	"github.com/ayonli/bilingo/domains/article/models"
	"github.com/ayonli/bilingo/domains/article/tables"
	"github.com/ayonli/bilingo/domains/article/types"
	"github.com/ayonli/bilingo/server"
	"gorm.io/gorm"
)

type ArticleRepo struct{}

func (r *ArticleRepo) Get(ctx context.Context, id uint) (*models.Article, error) {
	conn, err := server.UseDefaultDb()
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
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
	conn, err := server.UseDefaultDb()
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
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
	conn, err := server.UseDefaultDb()
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
	}

	article := &models.Article{
		Title:    data.Title,
		Content:  data.Content,
		Author:   author,
		Category: data.Category,
		Tags:     data.Tags,
		Likes:    0,
		Dislikes: 0,
	}

	if err := gorm.G[models.Article](conn).Create(ctx, article); err != nil {
		return nil, fmt.Errorf("failed to create article: %w", err)
	}

	return article, nil
}

func (r *ArticleRepo) Update(ctx context.Context, id uint, updates *types.ArticleUpdate) (*models.Article, error) {
	article, err := r.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	if updates.Title != nil {
		article.Title = *updates.Title
	}
	if updates.Content != nil {
		article.Content = *updates.Content
	}
	if updates.Category != nil {
		article.Category = updates.Category
	}
	if updates.Tags != nil {
		article.Tags = updates.Tags
	}

	conn, err := server.UseDefaultDb()
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
	}

	err = conn.Model(&models.Article{}).Where("id = ?", id).Updates(map[string]any{
		"title":    article.Title,
		"content":  article.Content,
		"category": article.Category,
		"tags":     article.Tags,
	}).Error
	if err != nil {
		return nil, fmt.Errorf("failed to update article: %w", err)
	}

	return r.Get(ctx, id)
}

func (r *ArticleRepo) Delete(ctx context.Context, id uint) error {
	conn, err := server.UseDefaultDb()
	if err != nil {
		return fmt.Errorf("failed to connect database: %w", err)
	}

	rowsAffected, err := gorm.G[models.Article](conn).Where(tables.Article.ID.Eq(id)).Delete(ctx)
	if err != nil {
		return fmt.Errorf("failed to delete article: %w", err)
	}

	if rowsAffected == 0 {
		return domain.ErrArticleNotFound
	}

	return nil
}

func (r *ArticleRepo) UpdateLikes(ctx context.Context, id uint, likes int) (*models.Article, error) {
	conn, err := server.UseDefaultDb()
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
	}

	err = conn.Model(&models.Article{}).Where("id = ?", id).Update("likes", likes).Error
	if err != nil {
		return nil, fmt.Errorf("failed to update likes: %w", err)
	}

	return r.Get(ctx, id)
}

func (r *ArticleRepo) UpdateDislikes(ctx context.Context, id uint, dislikes int) (*models.Article, error) {
	conn, err := server.UseDefaultDb()
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
	}

	err = conn.Model(&models.Article{}).Where("id = ?", id).Update("dislikes", dislikes).Error
	if err != nil {
		return nil, fmt.Errorf("failed to update dislikes: %w", err)
	}

	return r.Get(ctx, id)
}
