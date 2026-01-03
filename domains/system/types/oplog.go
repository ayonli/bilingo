package types

import (
	"time"

	"github.com/ayonli/bilingo/common"
)

type OpLogData struct {
	ObjectType  string     `json:"object_type"`
	ObjectId    string     `json:"object_id"`
	Operation   string     `json:"operation"`
	Description *string    `json:"description"`
	Result      string     `json:"result" validate:"oneof=success failure"`
	NewData     any        `json:"new_data" tstype:"object"`
	OldData     any        `json:"old_data" tstype:"object"`
	Timestamp   *time.Time `json:"timestamp" gorm:"-"` // Manually set timestamp if needed
	User        *string    `json:"user"`
	Ip          *string    `json:"ip"`
}

type OpLogListQuery struct {
	common.PaginatedQuery `tstype:",extends"`
	ObjectType            string `json:"object_type" query:"object_type" validate:"required"`
	ObjectId              string `json:"object_id" query:"object_id" validate:"required,max=64"`
}
