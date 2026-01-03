import type { ApiResponse, PaginatedResult } from "../../../common"
import { ApiEntry } from "../../../client"
import type { User } from "../models"
import type {
    LoginCredentials,
    PasswordChange,
    UserCreate,
    UserListQuery,
    UserUpdate,
} from "../types"

const userApi = new ApiEntry("/users")

export async function login(credentials: LoginCredentials): ApiResponse<User> {
    return await userApi.post("/login", null, credentials)
}

export async function logout(): ApiResponse<null> {
    return await userApi.post("/logout")
}

export async function getMe(): ApiResponse<User> {
    return await userApi.get("/me")
}

export async function getUser(email: string): ApiResponse<User> {
    return await userApi.get(`/${email}`)
}

export async function listUsers(query: UserListQuery): ApiResponse<PaginatedResult<User>> {
    return await userApi.get("/", query)
}

export async function createUser(data: UserCreate): ApiResponse<User> {
    return await userApi.post("/", null, data)
}

export async function updateUser(email: string, data: UserUpdate): ApiResponse<User> {
    return await userApi.patch(`/${email}`, null, data)
}

export async function deleteUser(email: string): ApiResponse<null> {
    return await userApi.delete(`/${email}`)
}

export async function changePassword(email: string, data: PasswordChange): ApiResponse<null> {
    return await userApi.patch(`/${email}/password`, null, data)
}
