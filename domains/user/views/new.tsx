import type { JSX } from "react"
import { useNavigate } from "react-router-dom"
import { createUser } from "../api/user"
import type { UserCreate } from "../types"
import UserForm from "../components/UserForm"

export default function NewUserPage(): JSX.Element {
    const navigate = useNavigate()

    async function handleCreate(data: UserCreate): Promise<void> {
        const { ok, value, error } = await createUser(data)

        if (ok) {
            navigate(`/users/${encodeURIComponent(value.email)}`)
        } else {
            throw new Error(error)
        }
    }

    function handleCancel(): void {
        navigate("/users")
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
                    <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
                </div>

                <UserForm
                    onSubmit={handleCreate}
                    onCancel={handleCancel}
                    mode="create"
                />
            </div>
        </div>
    )
}
