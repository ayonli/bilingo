package common

type PaginatedQuery struct {
	Page     int `json:"page" query:"page" form:"page" validate:"gte=1"`
	PageSize int `json:"page_size" query:"page_size" form:"page_size" validate:"gte=1,lte=100"`
}

type PaginatedResult[T any] struct {
	Total int `json:"total"`
	List  []T `json:"list"`
}
