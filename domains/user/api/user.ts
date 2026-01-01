import type { AsyncResult, PaginatedResult } from "../../../common"
import { ApiEndpoint } from "../../../client"
import type { User } from "../models"
import type { UserListQuery } from "../types"

const userApi = new ApiEndpoint("/users")

export async function getUser(email: string): AsyncResult<User> {
    return await userApi.get(`/${email}`)
}

export async function listUsers(query: UserListQuery): AsyncResult<PaginatedResult<User>> {
    return await userApi.get("/", query)
}

export async function createUser(data: Partial<User>): AsyncResult<User> {
    return await userApi.post("/", null, data)
}

export async function updateUser(
    email: string,
    data: Partial<User>,
): AsyncResult<User> {
    return await userApi.patch(`/${email}`, null, data)
}

export async function deleteUser(email: string): AsyncResult<null> {
    return await userApi.delete(`/${email}`)
}
