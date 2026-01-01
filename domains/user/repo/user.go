package repo

import (
	"context"

	"github.com/ayonli/bilingo/common"
	"github.com/ayonli/bilingo/domains/user/models"
	"github.com/ayonli/bilingo/domains/user/types"
)

type UserRepo interface {
	FindByEmail(ctx context.Context, email string) (*models.User, error)
	GetList(ctx context.Context, query types.UserListQuery) (*common.PaginatedResult[models.User], error)
	Create(ctx context.Context, user *types.UserCreate) (*models.User, error)
	Update(ctx context.Context, email string, user *types.UserUpdate) (*models.User, error)
	Delete(ctx context.Context, email string) error
}
