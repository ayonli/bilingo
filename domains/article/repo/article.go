package repo

import (
	"context"

	"bilingo/common"
	"bilingo/domains/article/models"
	impl "bilingo/domains/article/repo/db"
	"bilingo/domains/article/types"
)

var ArticleRepo IArticleRepo = &impl.ArticleRepo{}

type IArticleRepo interface {
	Get(ctx context.Context, id uint) (*models.Article, error)
	List(ctx context.Context, query *types.ArticleListQuery) (*common.PaginatedResult[models.Article], error)
	Create(ctx context.Context, data *types.ArticleCreate, author string) (*models.Article, error)
	Update(ctx context.Context, id uint, updates *types.ArticleUpdate) (*models.Article, error)
	Delete(ctx context.Context, id uint) error
	UpdateLikes(ctx context.Context, id uint, likes int) (*models.Article, error)
	UpdateDislikes(ctx context.Context, id uint, dislikes int) (*models.Article, error)
}
