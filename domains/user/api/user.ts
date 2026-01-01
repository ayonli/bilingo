import type { ApiResult, PaginatedResult } from "../../../common"
import { ApiEntry } from "../../../client"
import type { User } from "../models"
import type { LoginCredentials, PasswordChange, UserListQuery } from "../types"

const userApi = new ApiEntry("/users")

export async function login(credentials: LoginCredentials): ApiResult<User> {
    return await userApi.post("/login", null, credentials)
}

export async function logout(): ApiResult<null> {
    return await userApi.post("/logout")
}

export async function getMe(): ApiResult<User> {
    return await userApi.get("/me")
}

export async function getUser(email: string): ApiResult<User> {
    return await userApi.get(`/${email}`)
}

export async function listUsers(query: UserListQuery): ApiResult<PaginatedResult<User>> {
    return await userApi.get("/", query)
}

export async function createUser(data: Partial<User>): ApiResult<User> {
    return await userApi.post("/", null, data)
}

export async function updateUser(
    email: string,
    data: Partial<User>,
): ApiResult<User> {
    return await userApi.patch(`/${email}`, null, data)
}

export async function deleteUser(email: string): ApiResult<null> {
    return await userApi.delete(`/${email}`)
}

export async function changePassword(
    email: string,
    data: PasswordChange,
): ApiResult<null> {
    return await userApi.patch(`/${email}/password`, null, data)
}
