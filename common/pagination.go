package common

type PaginatedQuery struct {
	Page     int `json:"page" query:"page" form:"page"`
	PageSize int `json:"page_size" query:"page_size" form:"page_size"`
}

type PaginatedResult[T any] struct {
	Total int `json:"total"`
	List  []T `json:"list"`
}
