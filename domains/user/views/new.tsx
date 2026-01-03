import type { JSX } from "react"
import { useNavigate } from "react-router-dom"
import { createUser } from "../api/user"
import type { UserCreate } from "../types"
import UserForm from "../components/UserForm"

export default function NewUserPage(): JSX.Element {
    const navigate = useNavigate()

    async function handleCreate(data: UserCreate): Promise<void> {
        const { success, data: user, message } = await createUser(data)

        if (success) {
            navigate(`/users/${encodeURIComponent(user.email)}`)
        } else {
            throw new Error(message)
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
