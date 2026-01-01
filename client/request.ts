import qs from "qs"
import { startsWith } from "@ayonli/jsext/path"
import { stripStart } from "@ayonli/jsext/string"
import { Err, Ok, try_ } from "@ayonli/jsext/result"
import type { ApiResponse, ApiResult } from "../common"

export async function request<T>(
    method: string,
    path: string,
    query: unknown = null,
    data: unknown = null,
): ApiResult<T> {
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
    } else if (data !== null && typeof data === "object") {
        body = JSON.stringify(data)
        headers["Content-Type"] = "application/json"
    } else if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
        body = data.toString()
        headers["Content-Type"] = "text/plain"
    }

    const response = await fetch(path, {
        method,
        headers,
        body,
        credentials: "include", // Include cookies in requests
    })
    const contentType = response.headers.get("Content-Type") || ""

    if (contentType.includes("/json")) {
        const { ok, value: result, error } = await try_<ApiResponse<T>, Error>(response.json())

        if (ok) {
            if (result.success) {
                return Ok((result.data ?? null) as T)
            } else {
                return Err(result.message || "Unknown error")
            }
        } else if (!response.ok) {
            return Err(`HTTP ${response.status}: ${response.statusText}`)
        } else {
            return Err(error.message)
        }
    } else if (!response.ok) {
        return Err(`HTTP ${response.status}: ${response.statusText}`)
    } else {
        return Err("Unsupported response content type: " + contentType)
    }
}

export class ApiEntry {
    private readonly basePath: string

    constructor(basePath: string = "/api") {
        if (!startsWith(basePath, "/api")) {
            basePath = "/api/" + stripStart(basePath, "/")
        }

        this.basePath = basePath
    }

    async get<T>(path: string, query: unknown = null): ApiResult<T> {
        return await request<T>("GET", `${this.basePath}/${stripStart(path, "/")}`, query)
    }

    async post<T>(path: string, query: unknown = null, data: unknown = null): ApiResult<T> {
        return await request<T>("POST", `${this.basePath}/${stripStart(path, "/")}`, query, data)
    }

    async put<T>(path: string, query: unknown = null, data: unknown = null): ApiResult<T> {
        return await request<T>("PUT", `${this.basePath}/${stripStart(path, "/")}`, query, data)
    }

    async patch<T>(path: string, query: unknown = null, data: unknown = null): ApiResult<T> {
        return await request<T>(
            "PATCH",
            `${this.basePath}/${stripStart(path, "/")}`,
            query,
            data,
        )
    }

    async delete<T>(path: string, query: unknown = null, data: unknown = null): ApiResult<T> {
        return await request<T>(
            "DELETE",
            `${this.basePath}/${stripStart(path, "/")}`,
            query,
            data,
        )
    }
}
