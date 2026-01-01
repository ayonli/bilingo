package common

type DateRange struct {
	Start *string `json:"start" query:"start" form:"start"`
	End   *string `json:"end" query:"end" form:"end"`
}
