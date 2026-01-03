package oplog

import (
	"context"

	"github.com/ayonli/bilingo/domains/system/service"
	"github.com/ayonli/bilingo/domains/system/types"
	"github.com/ayonli/bilingo/server"
	"github.com/ayonli/bilingo/server/auth"
)

type OpLogger struct {
	objectType string
}

type LogData struct {
	ObjectId    string  `json:"object_id"`
	Operation   string  `json:"operation"`
	Description *string `json:"description"`
	OldData     any     `json:"old_data"`
	NewData     any     `json:"new_data"`
}

func NewOpLogger(objectType string) *OpLogger {
	return &OpLogger{
		objectType: objectType,
	}
}

func (l *OpLogger) log(ctx context.Context, data LogData, result string) error {
	var email *string
	if user := auth.GetUser(ctx); user != nil {
		email = &user.Email
	}

	var ip *string
	if _ip := server.GetClientIp(ctx); _ip != "" {
		ip = &_ip
	}

	logData := types.OpLogData{
		ObjectInfo: types.ObjectInfo{
			ObjectType: l.objectType,
			ObjectId:   data.ObjectId,
		},
		OpLogBase: types.OpLogBase{
			Operation:   data.Operation,
			Description: data.Description,
			Result:      result,
			User:        email,
			Ip:          ip,
		},
		NewData: data.NewData,
		OldData: data.OldData,
	}

	return service.CreateOpLog(ctx, &logData)
}

func (l *OpLogger) Success(ctx context.Context, data LogData) error {
	return l.log(ctx, data, "success")
}

func (l *OpLogger) Failure(ctx context.Context, data LogData) error {
	return l.log(ctx, data, "failure")
}
