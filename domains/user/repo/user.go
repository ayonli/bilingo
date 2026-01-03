package repo

import (
	"context"

	"github.com/ayonli/bilingo/common"
	"github.com/ayonli/bilingo/domains/user/models"
	impl "github.com/ayonli/bilingo/domains/user/repo/db"
	"github.com/ayonli/bilingo/domains/user/types"
)

var UserRepo IUserRepo = &impl.UserRepo{}

type IUserRepo interface {
	Get(ctx context.Context, email string) (*models.User, error)
	List(ctx context.Context, query types.UserListQuery) (*common.PaginatedResult[models.User], error)
	Create(ctx context.Context, data *types.UserCreate) (*models.User, error)
	Update(ctx context.Context, email string, data *types.UserUpdate) (*models.User, error)
	Delete(ctx context.Context, email string) error
}
