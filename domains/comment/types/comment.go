package types

import "github.com/ayonli/bilingo/common"

//tygo:emit import type * as common from "../../../common"
type CommentCreate struct {
	BizType  string `json:"biz_type" validate:"required,max=64"`
	BizId    string `json:"biz_id" validate:"required,max=255"`
	Content  string `json:"content" validate:"required,min=1"`
	Author   string `json:"author" validate:"required,min=1,max=100"`
	ParentId *uint  `json:"parent_id" validate:"omitempty"`
}

type CommentUpdate struct {
	Content *string `json:"content" validate:"omitempty,min=1"`
}

type CommentListQuery struct {
	common.PaginatedQuery `tstype:",extends"`
	BizType               string  `json:"biz_type" query:"biz_type" validate:"required"`
	BizId                 string  `json:"biz_id" query:"biz_id" validate:"required,max=255"`
	Author                *string `json:"author" query:"author"`
	ParentId              *uint   `json:"parent_id" query:"parent_id"`
}
