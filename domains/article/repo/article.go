package repo

import (
	"context"

	"github.com/ayonli/bilingo/common"
	"github.com/ayonli/bilingo/domains/article/models"
	impl "github.com/ayonli/bilingo/domains/article/repo/db"
	"github.com/ayonli/bilingo/domains/article/types"
)

var ArticleRepo IArticleRepo = &impl.ArticleRepo{}

type IArticleRepo interface {
	Create(ctx context.Context, data *types.ArticleCreate) (*models.Article, error)
	FindByID(ctx context.Context, id uint) (*models.Article, error)
	List(ctx context.Context, query *types.ArticleListQuery) (*common.PaginatedResult[models.Article], error)
	Update(ctx context.Context, id uint, updates *types.ArticleUpdate) error
	Delete(ctx context.Context, id uint) error
	UpdateLikes(ctx context.Context, id uint, likes int) error
	UpdateDislikes(ctx context.Context, id uint, dislikes int) error
}
