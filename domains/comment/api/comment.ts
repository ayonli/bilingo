import type { ApiResult, PaginatedResult } from "@/common"
import { ApiEntry } from "@/client"
import type { Comment } from "../models"
import type { CommentCreate, CommentListQuery, CommentUpdate } from "../types"

const commentApi = new ApiEntry("/comments")

export async function getComment(id: number): ApiResult<Comment> {
    return await commentApi.get("/" + id)
}

export async function listComments(
    query: Partial<CommentListQuery>,
): ApiResult<PaginatedResult<Comment>> {
    return await commentApi.get("/", query)
}

export async function createComment(data: CommentCreate): ApiResult<Comment> {
    return await commentApi.post("/", null, data)
}

export async function updateComment(id: number, data: CommentUpdate): ApiResult<Comment> {
    return await commentApi.patch("/" + id, null, data)
}

export async function deleteComment(id: number): ApiResult<null> {
    return await commentApi.delete("/" + id)
}
