import { ApiEntry } from "@/client"
import type { ApiResponse, PaginatedResult } from "@/common"
import type { OpLogListQuery } from "../types"
import type { OpLog } from "../models"

const opLogApi = new ApiEntry("/system/oplogs")

export async function listOpLogs(query: OpLogListQuery): ApiResponse<PaginatedResult<OpLog>> {
    return await opLogApi.get("/", query)
}
