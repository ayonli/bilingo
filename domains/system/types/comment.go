package types

import "bilingo/common"

//tygo:emit import type * as common from "@/common"
type CommentCreate struct {
	ObjectInfo `tstype:",extends"`
	Content    string `json:"content" validate:"required,min=1"`
	Author     string `json:"author" validate:"required,min=1,max=100"`
	ParentId   *uint  `json:"parent_id" validate:"omitempty"`
}

type CommentUpdate struct {
	Content *string `json:"content" validate:"omitempty,min=1"`
}

type CommentListQuery struct {
	common.PaginatedQuery `tstype:",extends"`
	ObjectInfo            `tstype:",extends"`
	Author                *string `json:"author" query:"author"`
	ParentId              *uint   `json:"parent_id" query:"parent_id"`
}
