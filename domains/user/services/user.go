package services

import (
	"context"

	"github.com/ayonli/bilingo/common"
	domain "github.com/ayonli/bilingo/domains/user"
	"github.com/ayonli/bilingo/domains/user/models"
	repo "github.com/ayonli/bilingo/domains/user/repo/impl"
	"github.com/ayonli/bilingo/domains/user/types"
)

func GetUser(ctx context.Context, email string) (*models.User, error) {
	user, err := repo.UserRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	} else if user == nil {
		return nil, domain.ErrUserNotFound
	}

	return user, nil
}

func ListUsers(ctx context.Context, query types.UserListQuery) (*common.PaginatedResult[models.User], error) {
	return repo.UserRepo.GetList(ctx, query)
}

func CreateUser(ctx context.Context, user *types.UserCreate) (*models.User, error) {
	return repo.UserRepo.Create(ctx, user)
}

func UpdateUser(ctx context.Context, email string, user *types.UserUpdate) (*models.User, error) {
	return repo.UserRepo.Update(ctx, email, user)
}

func DeleteUser(ctx context.Context, email string) error {
	return repo.UserRepo.Delete(ctx, email)
}
