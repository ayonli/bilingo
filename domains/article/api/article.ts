import type { ApiResult, PaginatedResult } from "../../../common"
import { ApiEntry } from "../../../client"
import type { Article } from "../models"
import type { ArticleCreate, ArticleListQuery, ArticleUpdate } from "../types"

const articleApi = new ApiEntry("/articles")

export async function getArticle(id: number): ApiResult<Article> {
    return await articleApi.get("/" + id)
}

export async function listArticles(
    query: Partial<ArticleListQuery>,
): ApiResult<PaginatedResult<Article>> {
    return await articleApi.get("/", query)
}

export async function createArticle(data: ArticleCreate): ApiResult<Article> {
    return await articleApi.post("/", null, data)
}

export async function updateArticle(id: number, data: ArticleUpdate): ApiResult<Article> {
    return await articleApi.patch("/" + id, null, data)
}

export async function deleteArticle(id: number): ApiResult<null> {
    return await articleApi.delete("/" + id)
}

export async function likeArticle(
    id: number,
    action: "like" | "unlike" | "dislike" | "undislike",
): ApiResult<Article> {
    return await articleApi.post(`/${id}/like`, null, { action })
}
