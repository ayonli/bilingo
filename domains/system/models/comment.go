package models

import (
	"time"

	"github.com/ayonli/bilingo/domains/system/types"
)

//tygo:emit import type * as types from "../types"
type Comment struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	types.ObjectInfo `tstype:",extends"`
	Content          string `json:"content"`
	Author           string `json:"author"`
	ParentId         *uint  `json:"parent_id"`
}

func (a *Comment) TableName() string {
	return "comment"
}
