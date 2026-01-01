package models

import (
	"time"
)

type User struct {
	Email     string    `json:"email" gorm:"primaryKey;type:varchar(64)"`
	Name      string    `json:"name" gorm:"type:varchar(64);not null"`
	Password  *string   `json:"password" gorm:"type:varchar(64)"`
	Birthdate *string   `json:"birthdate" gorm:"type:varchar(10)"`
	CreatedAt time.Time `json:"created_at" gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP"`
	UpdatedAt time.Time `json:"updated_at" gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP"`
}

func (u *User) TableName() string {
	return "user"
}
