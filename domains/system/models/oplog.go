package models

import "time"

type OpLog struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	ObjectType  string    `json:"object_type"`
	ObjectId    string    `json:"object_id"`
	Operation   string    `json:"operation"`
	Result      string    `json:"result" validate:"oneof=success failure"`
	Description *string   `json:"description"`
	NewData     *string   `json:"new_data"`
	OldData     *string   `json:"old_data"`
	Timestamp   time.Time `json:"timestamp"`
	User        *string   `json:"user"`
	Ip          *string   `json:"ip"`
	Times       uint32    `json:"times"`
}

func (o *OpLog) TableName() string {
	return "op_log"
}
