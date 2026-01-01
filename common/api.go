package common

//tygo:emit
var _ = `
import type { Result } from "@ayonli/jsext/result";
export type AsyncResult<T> = Promise<Result<T>>;
`

type ApiResult[T any] struct {
	Success bool   `json:"success"`
	Code    int    `json:"code"`
	Data    T      `json:"data,omitempty"`
	Message string `json:"message,omitempty"`
}
