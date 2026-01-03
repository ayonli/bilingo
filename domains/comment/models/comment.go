package models

import "time"

type Comment struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	// Add your fields here
	BizType  string `json:"biz_type"`
	BizId    string `json:"biz_id"`
	Content  string `json:"content"`
	Author   string `json:"author"`
	ParentId *uint  `json:"parent_id"`
}

func (a *Comment) TableName() string {
	return "comment"
}
