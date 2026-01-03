export interface SuccessResult<T> {
    success: true
    code: 200
    data: T
    message: string | null
}

export interface ErrorResult {
    success: false
    code: number /* int */
    data: null
    message: string
}

export type ApiResult<T> = SuccessResult<T> | ErrorResult

export type ApiResponse<T> = Promise<ApiResult<T>>

export interface Range<T extends unknown> {
    start?: T
    end?: T
}

export interface PaginatedQuery {
    page: number /* int */
    page_size: number /* int */
}
export interface PaginatedResult<T extends unknown> {
    total: number /* int */
    list: T[]
}
