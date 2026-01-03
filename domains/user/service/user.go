package service

import (
	"context"
	"fmt"

	"github.com/ayonli/bilingo/common"
	domain "github.com/ayonli/bilingo/domains/user"
	"github.com/ayonli/bilingo/domains/user/models"
	repo "github.com/ayonli/bilingo/domains/user/repo"
	"github.com/ayonli/bilingo/domains/user/types"
	"golang.org/x/crypto/bcrypt"
)

func GetUser(ctx context.Context, email string) (*models.User, error) {
	user, err := repo.UserRepo.Get(ctx, email)
	if err != nil {
		return nil, err
	}

	// Clear password before returning
	user.Password = nil

	return user, nil
}

func ListUsers(ctx context.Context, query types.UserListQuery) (*common.PaginatedResult[models.User], error) {
	result, err := repo.UserRepo.List(ctx, query)
	if err != nil {
		return nil, err
	}

	// Clear passwords for all users in the list
	for i := range result.List {
		result.List[i].Password = nil
	}

	return result, nil
}

func CreateUser(ctx context.Context, user *types.UserCreate) (*models.User, error) {
	// Hash password before passing to repo
	hashedPassword, err := hashPassword(user.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create a copy with hashed password
	userWithHashedPassword := *user
	userWithHashedPassword.Password = hashedPassword

	createdUser, err := repo.UserRepo.Create(ctx, &userWithHashedPassword)
	if err != nil {
		return nil, err
	}

	// Clear password before returning
	createdUser.Password = nil

	return createdUser, nil
}

func UpdateUser(ctx context.Context, email string, user *types.UserUpdate) (*models.User, error) {
	// Hash password if provided
	if user.Password != nil {
		hashedPassword, err := hashPassword(*user.Password)
		if err != nil {
			return nil, fmt.Errorf("failed to hash password: %w", err)
		}
		user.Password = &hashedPassword
	}

	updatedUser, err := repo.UserRepo.Update(ctx, email, user)
	if err != nil {
		return nil, err
	}

	// Clear password before returning
	updatedUser.Password = nil

	return updatedUser, nil
}

func DeleteUser(ctx context.Context, email string) error {
	return repo.UserRepo.Delete(ctx, email)
}

func ChangePassword(ctx context.Context, email string, data *types.PasswordChange) error {
	// Find the user
	user, err := repo.UserRepo.Get(ctx, email)
	if err != nil {
		return err
	}

	// Verify old password
	if user.Password == nil {
		return domain.ErrInvalidPassword
	}
	if err := verifyPassword(*user.Password, data.OldPassword); err != nil {
		return domain.ErrInvalidPassword
	}

	// Hash new password
	hashedPassword, err := hashPassword(data.NewPassword)
	if err != nil {
		return fmt.Errorf("failed to hash new password: %w", err)
	}

	// Update password using repo's Update function
	updateData := &types.UserUpdate{
		Password: &hashedPassword,
	}
	_, err = repo.UserRepo.Update(ctx, email, updateData)
	return err
}

func Login(ctx context.Context, credentials *types.LoginCredentials) (*models.User, error) {
	user, err := repo.UserRepo.Get(ctx, credentials.Email)
	if err != nil {
		return nil, err
	}

	// Verify password
	if user.Password == nil {
		return nil, domain.ErrInvalidPassword
	}
	if err := verifyPassword(*user.Password, credentials.Password); err != nil {
		return nil, domain.ErrInvalidPassword
	}

	// Clear password before returning
	user.Password = nil

	return user, nil
}

// hashPassword hashes a plain text password using bcrypt
func hashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

// verifyPassword verifies if the provided password matches the stored hash
func verifyPassword(hashedPassword string, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
