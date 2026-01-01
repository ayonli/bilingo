package models

import (
	"time"
)

type User struct {
	Email     string    `json:"email" gorm:"primaryKey"`
	Name      string    `json:"name"`
	Password  *string   `json:"password"`
	Birthdate *string   `json:"birthdate"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}
