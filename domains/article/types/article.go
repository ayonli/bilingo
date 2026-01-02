package types

import "github.com/ayonli/bilingo/common"

//tygo:emit import type * as common from "../../../common"
type ArticleCreate struct {
	Title    string  `json:"title" validate:"required,min=1,max=200"`
	Content  string  `json:"content" validate:"required,min=1"`
	Category *string `json:"category" validate:"omitempty,max=64"`
	Tags     *string `json:"tags" validate:"omitempty"`
}

type ArticleUpdate struct {
	Title    *string `json:"title" validate:"omitempty,min=1,max=200"`
	Content  *string `json:"content" validate:"omitempty,min=1"`
	Category *string `json:"category" validate:"omitempty,max=64"`
	Tags     *string `json:"tags" validate:"omitempty"`
}

type ArticleListQuery struct {
	common.PaginatedQuery `tstype:",extends"`
	Search                *string `json:"search" query:"search"`
	Author                *string `json:"author" query:"author"`
	Category              *string `json:"category" query:"category"`
}

type ArticleLikeAction struct {
	Action string `json:"action" validate:"required,oneof=like dislike unlike undislike"`
}
