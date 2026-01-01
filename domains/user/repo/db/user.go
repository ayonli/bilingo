package db

import (
	"context"
	"errors"
	"fmt"

	"github.com/ayonli/bilingo/common"
	domain "github.com/ayonli/bilingo/domains/user"
	"github.com/ayonli/bilingo/domains/user/models"
	"github.com/ayonli/bilingo/domains/user/repo/db/tables"
	"github.com/ayonli/bilingo/domains/user/types"
	"github.com/ayonli/bilingo/server"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserRepo struct{}

func (r *UserRepo) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	conn, err := server.UseDefaultDb()
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
	}

	user, err := gorm.G[models.User](conn).Where(tables.User.Email.Eq(email)).First(ctx)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	} else if err != nil {
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	return &user, nil
}

func (r *UserRepo) GetList(ctx context.Context, query types.UserListQuery) (*common.PaginatedResult[models.User], error) {
	conn, err := server.UseDefaultDb()
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
	}

	q := gorm.G[models.User](conn).Where("1 = 1")

	if query.Search != nil && *query.Search != "" {
		likePattern := "%" + *query.Search + "%"
		q = q.Where(
			q.Or(
				tables.User.Name.Like(likePattern),
				tables.User.Email.Like(likePattern),
			),
		)
	}

	if query.Emails != nil && len(*query.Emails) > 0 {
		q = q.Where(tables.User.Email.In(*query.Emails...))
	}

	if query.Birthdate != nil {
		if query.Birthdate.Start != nil {
			q = q.Where(tables.User.Birthdate.Gte(*query.Birthdate.Start))
		}
		if query.Birthdate.End != nil {
			q = q.Where(tables.User.Birthdate.Lte(*query.Birthdate.End))
		}
	}

	// Count total before applying pagination
	total, err := q.Count(ctx, "*")
	if err != nil {
		return nil, fmt.Errorf("failed to count users: %w", err)
	}

	q = q.Limit(query.PageSize)
	q = q.Offset(query.PageSize * (query.Page - 1))
	users, err := q.Find(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get user list: %w", err)
	} else if len(users) == 0 {
		return &common.PaginatedResult[models.User]{Total: 0, List: []models.User{}}, nil
	}

	return &common.PaginatedResult[models.User]{Total: int(total), List: users}, nil
}

func (r *UserRepo) Create(ctx context.Context, user *types.UserCreate) (*models.User, error) {
	conn, err := server.UseDefaultDb()
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
	}

	hashedPasswordStr, err := HashPassword(user.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	newUser := models.User{
		Email:     user.Email,
		Name:      user.Name,
		Password:  &hashedPasswordStr,
		Birthdate: user.Birthdate,
	}

	if err := gorm.G[models.User](conn).Create(ctx, &newUser); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return &newUser, nil
}

func (r *UserRepo) Update(ctx context.Context, email string, user *types.UserUpdate) (*models.User, error) {
	// First, find the existing user using FindByEmail
	existingUser, err := r.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	} else if existingUser == nil {
		return nil, domain.ErrUserNotFound
	}

	// Update only the fields that are provided
	if user.Name != nil {
		existingUser.Name = *user.Name
	}
	if user.Password != nil {
		hashedPasswordStr, err := HashPassword(*user.Password)
		if err != nil {
			return nil, fmt.Errorf("failed to hash password: %w", err)
		}
		existingUser.Password = &hashedPasswordStr
	}
	if user.Birthdate != nil {
		existingUser.Birthdate = user.Birthdate
	}

	// Open database connection for update
	conn, err := server.UseDefaultDb()
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
	}

	// Update the user in database
	err = conn.Model(&models.User{}).Where("email = ?", email).Updates(map[string]any{
		"name":      existingUser.Name,
		"password":  existingUser.Password,
		"birthdate": existingUser.Birthdate,
	}).Error
	if err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return existingUser, nil
}

func (r *UserRepo) Delete(ctx context.Context, email string) error {
	conn, err := server.UseDefaultDb()
	if err != nil {
		return fmt.Errorf("failed to connect database: %w", err)
	}

	rowsAffected, err := gorm.G[models.User](conn).Where(tables.User.Email.Eq(email)).Delete(ctx)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	if rowsAffected == 0 {
		return domain.ErrUserNotFound
	}

	return nil
}

// VerifyPassword verifies if the provided password matches the stored hash
func VerifyPassword(hashedPassword string, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// HashPassword hashes a plain text password using bcrypt
func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}
