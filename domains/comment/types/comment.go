package types

import "github.com/ayonli/bilingo/common"

//tygo:emit import type * as common from "../../../common"
type CommentCreate struct {
	ObjectType string `json:"object_type" validate:"required,max=64"`
	ObjectId   string `json:"object_id" validate:"required,max=255"`
	Content    string `json:"content" validate:"required,min=1"`
	Author     string `json:"author" validate:"required,min=1,max=100"`
	ParentId   *uint  `json:"parent_id" validate:"omitempty"`
}

type CommentUpdate struct {
	Content *string `json:"content" validate:"omitempty,min=1"`
}

type CommentListQuery struct {
	common.PaginatedQuery `tstype:",extends"`
	ObjectType            string  `json:"object_type" query:"object_type" validate:"required"`
	ObjectId              string  `json:"object_id" query:"object_id" validate:"required,max=255"`
	Author                *string `json:"author" query:"author"`
	ParentId              *uint   `json:"parent_id" query:"parent_id"`
}
