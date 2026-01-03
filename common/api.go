package common

type ApiResult[T any] struct {
	Success bool    `json:"success"`
	Code    int     `json:"code"`
	Data    T       `json:"data" tstype:"T | null"`
	Message *string `json:"message" tstype:"string | null"`
}
