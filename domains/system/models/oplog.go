package models

import (
	"time"

	"bilingo/domains/system/types"
)

type OpLog struct {
	ID               string `json:"id" gorm:"primaryKey"`
	types.ObjectInfo `tstype:",extends"`
	types.OpLogBase  `tstype:",extends"`
	NewData          *string   `json:"new_data"`
	OldData          *string   `json:"old_data"`
	Timestamp        time.Time `json:"timestamp"`
	Times            uint32    `json:"times"`
}

func (o *OpLog) TableName() string {
	return "op_log"
}
