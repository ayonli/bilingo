import type { JSX } from "react"
import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { changePassword, deleteUser, getUser, updateUser } from "../api/user"
import { PasswordChangeForm, UserForm } from "../components"
import type { User } from "../models"
import type { PasswordChange, UserUpdate } from "../types"

export default function UserDetailPage(): JSX.Element {
    const { email } = useParams<{ email: string }>()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const isEditMode = searchParams.get("edit") === "true"
    const isChangePasswordMode = searchParams.get("changePassword") === "true"

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
            alert("Password changed successfully!")
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

        if (!confirm(`Are you sure you want to delete user ${user.email}?`)) {
            return
        }

        const { ok, error: apiError } = await deleteUser(decodeURIComponent(email))

        if (ok) {
            alert("User deleted successfully!")
            navigate("/users")
        } else {
            alert(`Failed to delete user: ${apiError}`)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error || "User not found"}
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/users")}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                        ← Back to users
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <button
                    type="button"
                    onClick={() => navigate("/users")}
                    className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    ← Back to users
                </button>

                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isEditMode
                                ? "Edit User"
                                : isChangePasswordMode
                                ? "Change Password"
                                : "User Details"}
                        </h1>
                        {!isEditMode && !isChangePasswordMode && (
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleEdit}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={handleChangePasswordClick}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Change Password
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {isEditMode
                    ? (
                        <UserForm
                            user={user}
                            onSubmit={handleUpdate}
                            onCancel={handleCancel}
                            mode="edit"
                        />
                    )
                    : isChangePasswordMode
                    ? (
                        <PasswordChangeForm
                            onSubmit={handleChangePassword}
                            onCancel={handleCancel}
                        />
                    )
                    : (
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <dl className="grid grid-cols-1 gap-6">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                                    <dd className="mt-1 text-lg text-gray-900">{user.email}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                                    <dd className="mt-1 text-lg text-gray-900">{user.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Birthdate</dt>
                                    <dd className="mt-1 text-lg text-gray-900">
                                        {user.birthdate || "-"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Created At
                                    </dt>
                                    <dd className="mt-1 text-lg text-gray-900">
                                        {new Date(user.created_at).toLocaleString()}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Updated At
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
    )
}
