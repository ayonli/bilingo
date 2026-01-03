package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/ayonli/bilingo/common"
	"github.com/ayonli/bilingo/domains/system/models"
	"github.com/ayonli/bilingo/domains/system/tables"
	"github.com/ayonli/bilingo/domains/system/types"
	"github.com/ayonli/bilingo/server/db"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func structToJsonString(data any) (*string, error) {
	if data == nil {
		return nil, nil
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	if _, isMap := data.(map[string]any); isMap {
		jsonDataStr := string(jsonData)
		return &jsonDataStr, nil
	}

	var temp map[string]any
	if err := json.Unmarshal(jsonData, &temp); err != nil {
		return nil, errors.New("not a map or struct instance")
	}

	sortedData, err := json.Marshal(temp)
	if err != nil {
		return nil, err
	}

	jsonDataStr := string(sortedData)
	return &jsonDataStr, nil
}

func CreateOpLog(ctx context.Context, data *types.OpLogData) error {
	conn, err := db.Default()
	if err != nil {
		return db.ConnError(err)
	}

	q := gorm.G[models.OpLog](conn).
		Where(tables.OpLog.ObjectType.Eq(data.ObjectType)).
		Where(tables.OpLog.ObjectId.Eq(data.ObjectId)).
		Where(tables.OpLog.Operation.Eq(data.Operation)).
		Where(tables.OpLog.Result.Eq(data.Result))

	if data.Description != nil {
		q = q.Where(tables.OpLog.Description.Eq(*data.Description))
	} else {
		q = q.Where(tables.OpLog.Description.IsNull())
	}
	if data.User != nil {
		q = q.Where(tables.OpLog.User.Eq(*data.User))
	} else {
		q = q.Where(tables.OpLog.User.IsNull())
	}
	if data.Ip != nil {
		q = q.Where(tables.OpLog.Ip.Eq(*data.Ip))
	} else {
		q = q.Where(tables.OpLog.Ip.IsNull())
	}

	var newDataJson *string
	if data.NewData != nil {
		var err error
		newDataJson, err = structToJsonString(data.NewData)
		if err != nil {
			return err
		}
		q = q.Where(tables.OpLog.NewData.Eq(*newDataJson))
	} else {
		q = q.Where(tables.OpLog.NewData.IsNull())
	}

	var oldDataJson *string
	if data.OldData != nil {
		var err error
		oldDataJson, err = structToJsonString(data.OldData)
		if err != nil {
			return err
		}
		q = q.Where(tables.OpLog.OldData.Eq(*oldDataJson))
	} else {
		q = q.Where(tables.OpLog.OldData.IsNull())
	}

	var updates = []clause.Assigner{
		tables.OpLog.Timestamp.Set(time.Now()),
		tables.OpLog.Times.Incr(1),
	}

	rowsAffected, err := q.Set(updates...).Update(ctx)
	if err != nil {
		return fmt.Errorf("failed to update op log: %w", err)
	} else if rowsAffected == 0 {
		log := models.OpLog{
			ID:          uuid.NewString(),
			ObjectType:  data.ObjectType,
			ObjectId:    data.ObjectId,
			Operation:   data.Operation,
			Description: data.Description,
			Result:      data.Result,
			NewData:     newDataJson,
			OldData:     oldDataJson,
			Timestamp:   time.Now(),
			User:        data.User,
			Ip:          data.Ip,
			Times:       1,
		}

		if err := gorm.G[models.OpLog](conn).Create(ctx, &log); err != nil {
			return fmt.Errorf("failed to create op log: %w", err)
		}
	}

	return nil
}

func ListOpLogs(ctx context.Context, query types.OpLogListQuery) (*common.PaginatedResult[models.OpLog], error) {
	conn, err := db.Default()
	if err != nil {
		return nil, db.ConnError(err)
	}

	q := gorm.G[models.OpLog](conn).
		Where(tables.OpLog.ObjectType.Eq(query.ObjectType)).
		Where(tables.OpLog.ObjectId.Eq(query.ObjectId)).
		Order(tables.OpLog.Timestamp.Asc())

	// Count total before applying pagination
	total, err := q.Count(ctx, "*")
	if err != nil {
		return nil, fmt.Errorf("failed to count oplogs: %w", err)
	}

	q = q.Limit(query.PageSize)
	q = q.Offset(query.PageSize * (query.Page - 1))

	logs, err := q.Find(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get oplog list: %w", err)
	} else if len(logs) == 0 {
		return &common.PaginatedResult[models.OpLog]{Total: 0, List: []models.OpLog{}}, nil
	}

	return &common.PaginatedResult[models.OpLog]{Total: int(total), List: logs}, nil
}
