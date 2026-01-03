import type { ApiResponse, PaginatedResult } from "../../../common"
import { ApiEntry } from "../../../client"
import type { Article } from "../models"
import type { ArticleCreate, ArticleListQuery, ArticleUpdate } from "../types"

const articleApi = new ApiEntry("/articles")

export async function getArticle(id: number): ApiResponse<Article> {
    return await articleApi.get("/" + id)
}

export async function listArticles(
    query: Partial<ArticleListQuery>,
): ApiResponse<PaginatedResult<Article>> {
    return await articleApi.get("/", query)
}

export async function createArticle(data: ArticleCreate): ApiResponse<Article> {
    return await articleApi.post("/", null, data)
}

export async function updateArticle(id: number, data: ArticleUpdate): ApiResponse<Article> {
    return await articleApi.patch("/" + id, null, data)
}

export async function deleteArticle(id: number): ApiResponse<null> {
    return await articleApi.delete("/" + id)
}

export async function likeArticle(
    id: number,
    action: "like" | "unlike" | "dislike" | "undislike",
): ApiResponse<Article> {
    return await articleApi.post(`/${id}/like`, null, { action })
}
