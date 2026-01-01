package models

import "time"

type Article struct {
	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	Title     string    `json:"title" gorm:"type:varchar(200);not null"`
	Content   string    `json:"content" gorm:"type:text;not null"`
	Author    string    `json:"author" gorm:"type:varchar(64);not null"`
	Category  *string   `json:"category" gorm:"type:varchar(64)"`
	Tags      *string   `json:"tags" gorm:"type:text"`
	Likes     int       `json:"likes" gorm:"not null;default:0"`
	Dislikes  int       `json:"dislikes" gorm:"not null;default:0"`
	CreatedAt time.Time `json:"created_at" gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP"`
	UpdatedAt time.Time `json:"updated_at" gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP"`
}

func (a *Article) TableName() string {
	return "article"
}
