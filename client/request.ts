import qs from "qs"
import { Err, Ok } from "@ayonli/jsext/result"
import type { ApiResult, AsyncResult } from "../common"
import { stripStart } from "@ayonli/jsext/string"
import { startsWith } from "@ayonli/jsext/path"

export async function request<T>(
    method: string,
    path: string,
    query: unknown = null,
    data: unknown = null,
): AsyncResult<T> {
    if (query) {
        const queryString = qs.stringify(query)
        path += `?${queryString}`
    }

    const headers: HeadersInit = {}
    let body: BodyInit | null = null
    if (
        (data instanceof FormData) ||
        (data instanceof URLSearchParams) ||
        (data instanceof Blob) ||
        (data instanceof ArrayBuffer) ||
        (data instanceof ReadableStream)
    ) {
        body = data
    } else {
        body = JSON.stringify(data)
        headers["Content-Type"] = "application/json"
    }

    const response = await fetch(path, {
        method,
        headers,
        body,
    })

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}: ${response.statusText}`)
    }

    const result = await response.json() as ApiResult<T>
    if (result.success) {
        return Ok((result.data ?? null) as T)
    } else {
        return Err(result.message || "Unknown error")
    }
}

export async function apiRequest<T>(
    method: string,
    path: string,
    query: unknown = null,
    data: unknown = null,
): AsyncResult<T> {
    return await request<T>(method, `/api/${stripStart(path, "/")}`, query, data)
}

export class ApiEndpoint {
    private readonly basePath: string

    constructor(basePath: string = "/api") {
        if (!startsWith(basePath, "/api")) {
            basePath = "/api" + stripStart(basePath, "/")
        }

        this.basePath = basePath
    }

    async get<T>(path: string, query: unknown = null): AsyncResult<T> {
        return await apiRequest<T>("GET", `${this.basePath}/${stripStart(path, "/")}`, query)
    }

    async post<T>(path: string, query: unknown = null, data: unknown = null): AsyncResult<T> {
        return await apiRequest<T>("POST", `${this.basePath}/${stripStart(path, "/")}`, query, data)
    }

    async put<T>(path: string, query: unknown = null, data: unknown = null): AsyncResult<T> {
        return await apiRequest<T>("PUT", `${this.basePath}/${stripStart(path, "/")}`, query, data)
    }

    async patch<T>(path: string, query: unknown = null, data: unknown = null): AsyncResult<T> {
        return await apiRequest<T>(
            "PATCH",
            `${this.basePath}/${stripStart(path, "/")}`,
            query,
            data,
        )
    }

    async delete<T>(path: string, query: unknown = null, data: unknown = null): AsyncResult<T> {
        return await apiRequest<T>(
            "DELETE",
            `${this.basePath}/${stripStart(path, "/")}`,
            query,
            data,
        )
    }
}
