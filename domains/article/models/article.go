package models

import "time"

type Article struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Author    string    `json:"author"`
	Category  *string   `json:"category"`
	Tags      *string   `json:"tags"`
	Likes     int       `json:"likes"`
	Dislikes  int       `json:"dislikes"`
}

func (a *Article) TableName() string {
	return "article"
}
