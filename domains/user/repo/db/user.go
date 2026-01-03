package impl

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/ayonli/bilingo/common"
	domain "github.com/ayonli/bilingo/domains/user"
	"github.com/ayonli/bilingo/domains/user/models"
	"github.com/ayonli/bilingo/domains/user/tables"
	"github.com/ayonli/bilingo/domains/user/types"
	"github.com/ayonli/bilingo/server/db"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type UserRepo struct{}

func (r *UserRepo) Get(ctx context.Context, email string) (*models.User, error) {
	conn, err := db.Default()
	if err != nil {
		return nil, db.ConnError(err)
	}

	user, err := gorm.G[models.User](conn).Where(tables.User.Email.Eq(email)).First(ctx)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, domain.ErrUserNotFound
	} else if err != nil {
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	return &user, nil
}

func (r *UserRepo) List(ctx context.Context, query types.UserListQuery) (*common.PaginatedResult[models.User], error) {
	conn, err := db.Default()
	if err != nil {
		return nil, db.ConnError(err)
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

func (r *UserRepo) Create(ctx context.Context, data *types.UserCreate) (*models.User, error) {
	conn, err := db.Default()
	if err != nil {
		return nil, db.ConnError(err)
	}

	now := time.Now()
	user := models.User{
		CreatedAt: now,
		UpdatedAt: now,
		Email:     data.Email,
		Name:      data.Name,
		Password:  &data.Password,
		Birthdate: data.Birthdate,
	}

	if err := gorm.G[models.User](conn).Create(ctx, &user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return &user, nil
}

func (r *UserRepo) Update(ctx context.Context, email string, data *types.UserUpdate) (*models.User, error) {
	user, err := r.Get(ctx, email)
	if err != nil {
		return nil, err
	}

	var updates []clause.Assigner

	// Update only the fields that are provided
	if data.Name != nil && *data.Name != "" && *data.Name != user.Name {
		updates = append(updates, tables.User.Name.Set(*data.Name))
	}
	if data.Password != nil && *data.Password != "" && *data.Password != *user.Password {
		updates = append(updates, tables.User.Password.Set(*data.Password))
	}
	if data.Birthdate != nil && *data.Birthdate != "" && *data.Birthdate != *user.Birthdate {
		updates = append(updates, tables.User.Birthdate.Set(*data.Birthdate))
	}

	if len(updates) == 0 {
		return user, nil // No updates needed
	}

	updates = append(updates, tables.User.UpdatedAt.Set(time.Now()))

	conn, err := db.Default()
	if err != nil {
		return nil, db.ConnError(err)
	}

	rowsAffected, err := gorm.G[models.User](conn).Where(tables.User.Email.Eq(email)).Set(updates...).Update(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	} else if rowsAffected == 0 {
		return nil, domain.ErrUserNotFound
	}

	return r.Get(ctx, email)
}

func (r *UserRepo) Delete(ctx context.Context, email string) error {
	conn, err := db.Default()
	if err != nil {
		return db.ConnError(err)
	}

	rowsAffected, err := gorm.G[models.User](conn).Where(tables.User.Email.Eq(email)).Delete(ctx)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	} else if rowsAffected == 0 {
		return domain.ErrUserNotFound
	}

	return nil
}
