import type { JSX } from "react"
import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { changePassword, deleteUser, getUser, updateUser } from "../api/user"
import { PasswordChangeForm, UserForm } from "../components"
import type { User } from "../models"
import type { PasswordChange, UserUpdate } from "../types"
import { ProtectedRoute } from "../../../client/components"
import { alert, confirm } from "@ayonli/jsext/dialog"
import { useAuth } from "../../../client/contexts/AuthContext.tsx"

export default function UserDetailPage(): JSX.Element {
    const { email } = useParams<{ email: string }>()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const { currentUser } = useAuth()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const isEditMode = searchParams.get("edit") === "true"
    const isChangePasswordMode = searchParams.get("changePassword") === "true"

    // Check if current user is viewing their own profile
    const isOwnProfile = currentUser && user && currentUser.email === user.email

    useEffect(() => {
        if (!email) {
            return
        }

        loadUser()
    }, [email])

    async function loadUser(): Promise<void> {
        if (!email) {
            return
        }

        setLoading(true)
        setError("")

        const { ok, value, error: apiError } = await getUser(decodeURIComponent(email))

        if (ok) {
            setUser(value)
        } else {
            setError(apiError)
        }

        setLoading(false)
    }

    async function handleUpdate(data: UserUpdate): Promise<void> {
        if (!email) {
            return
        }

        const { ok, value, error: apiError } = await updateUser(decodeURIComponent(email), data)

        if (ok) {
            setUser(value)
            setSearchParams({})
        } else {
            throw new Error(apiError)
        }
    }

    async function handleChangePassword(data: PasswordChange): Promise<void> {
        if (!email) {
            return
        }

        const { ok, error: apiError } = await changePassword(decodeURIComponent(email), data)

        if (ok) {
            setSearchParams({})
            await alert("密码修改成功！")
        } else {
            throw new Error(apiError)
        }
    }

    function handleCancel(): void {
        setSearchParams({})
    }

    function handleEdit(): void {
        setSearchParams({ edit: "true" })
    }

    function handleChangePasswordClick(): void {
        setSearchParams({ changePassword: "true" })
    }

    async function handleDelete(): Promise<void> {
        if (!email || !user) {
            return
        }

        if (!await confirm(`确定要删除用户 ${user.email} 吗？`)) {
            return
        }

        const { ok, error: apiError } = await deleteUser(decodeURIComponent(email))

        if (ok) {
            await alert("用户删除成功！")
            navigate("/users")
        } else {
            await alert(`删除用户失败: ${apiError}`)
        }
    }

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 py-8 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <p className="text-gray-500">加载中...</p>
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    if (error || !user) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 py-8 px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error || "未找到用户"}
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/users")}
                            className="mt-4 text-blue-600 hover:text-blue-800"
                        >
                            ← 返回用户列表
                        </button>
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        type="button"
                        onClick={() => navigate("/users")}
                        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
                    >
                        ← 返回用户列表
                    </button>

                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {isEditMode
                                    ? "编辑用户"
                                    : isChangePasswordMode
                                    ? "修改密码"
                                    : "用户详情"}
                            </h1>
                            {!isEditMode && !isChangePasswordMode && isOwnProfile && (
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleEdit}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        编辑
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleChangePasswordClick}
                                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        修改密码
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        删除
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {isEditMode
                        ? isOwnProfile
                            ? (
                                <UserForm
                                    user={user}
                                    onSubmit={handleUpdate}
                                    onCancel={handleCancel}
                                    mode="edit"
                                />
                            )
                            : (
                                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg">
                                    <p className="font-medium">权限不足</p>
                                    <p className="mt-2">您只能编辑自己的个人资料</p>
                                </div>
                            )
                        : isChangePasswordMode
                        ? isOwnProfile
                            ? (
                                <PasswordChangeForm
                                    onSubmit={handleChangePassword}
                                    onCancel={handleCancel}
                                />
                            )
                            : (
                                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg">
                                    <p className="font-medium">权限不足</p>
                                    <p className="mt-2">您只能修改自己的密码</p>
                                </div>
                            )
                        : (
                            <div className="bg-white shadow-md rounded-lg p-6">
                                <dl className="grid grid-cols-1 gap-6">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">邮箱</dt>
                                        <dd className="mt-1 text-lg text-gray-900">{user.email}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">姓名</dt>
                                        <dd className="mt-1 text-lg text-gray-900">{user.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">生日</dt>
                                        <dd className="mt-1 text-lg text-gray-900">
                                            {user.birthdate || "-"}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            创建时间
                                        </dt>
                                        <dd className="mt-1 text-lg text-gray-900">
                                            {new Date(user.created_at).toLocaleString()}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            更新时间
                                        </dt>
                                        <dd className="mt-1 text-lg text-gray-900">
                                            {new Date(user.updated_at).toLocaleString()}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        )}
                </div>
            </div>
        </ProtectedRoute>
    )
}
