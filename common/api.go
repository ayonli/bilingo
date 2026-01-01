package common

//tygo:emit
var _ = `
import type { Result } from "@ayonli/jsext/result";
export type ApiResult<T> = Promise<Result<T, string>>;
`

type ApiResponse[T any] struct {
	Success bool   `json:"success"`
	Code    int    `json:"code"`
	Data    T      `json:"data,omitempty"`
	Message string `json:"message,omitempty"`
}
