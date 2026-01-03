package common

type Range[T any] struct {
	Start T `json:"start" query:"start" form:"start"`
	End   T `json:"end" query:"end" form:"end"`
}
