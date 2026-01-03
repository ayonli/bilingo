package types

import (
	"time"

	"github.com/ayonli/bilingo/common"
)

type OpLogBase struct {
	Operation   string  `json:"operation"`
	Description *string `json:"description"`
	Result      string  `json:"result" validate:"oneof=success failure"`
	User        *string `json:"user"`
	Ip          *string `json:"ip"`
}

type OpLogData struct {
	ObjectInfo `tstype:",extends"`
	OpLogBase  `tstype:",extends"`
	NewData    any        `json:"new_data" tstype:"object"`
	OldData    any        `json:"old_data" tstype:"object"`
	Timestamp  *time.Time `json:"timestamp" gorm:"-"` // Manually set timestamp if needed
}

type OpLogListQuery struct {
	common.PaginatedQuery `tstype:",extends"`
	ObjectInfo            `tstype:",extends"`
}
