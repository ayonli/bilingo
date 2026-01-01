import type { JSX } from "react"
import { useState } from "react"
import type { User } from "../models"
import type { UserCreate, UserUpdate } from "../types"

type UserFormProps =
    & {
        user?: User
        onCancel?: () => void
    }
    & (
        | { mode: "create"; onSubmit: (data: UserCreate) => Promise<void> }
        | { mode: "edit"; onSubmit: (data: UserUpdate) => Promise<void> }
    )

export default function UserForm(props: Readonly<UserFormProps>): JSX.Element {
    const { user, onSubmit, onCancel, mode } = props

    const [formData, setFormData] = useState({
        email: user?.email || "",
        name: user?.name || "",
        password: "",
        confirmPassword: "",
        birthdate: user?.birthdate || "",
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        setError("")

        if (mode === "create" && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setLoading(true)

        try {
            if (mode === "create") {
                const submitData: UserCreate = {
                    email: formData.email,
                    name: formData.name,
                    password: formData.password,
                    birthdate: formData.birthdate || undefined,
                }
                await onSubmit(submitData)
            } else {
                const submitData: UserUpdate = {
                    name: formData.name || undefined,
                    birthdate: formData.birthdate || undefined,
                }
                await onSubmit(submitData)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6"
        >
            <div className="space-y-6">
                {mode === "create" && (
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="user@example.com"
                        />
                    </div>
                )}

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                    />
                </div>

                {mode === "create" && (
                    <>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>
                    </>
                )}

                <div>
                    <label
                        htmlFor="birthdate"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Birthdate
                    </label>
                    <input
                        type="date"
                        id="birthdate"
                        name="birthdate"
                        value={formData.birthdate}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? "Saving..." : mode === "create" ? "Create User" : "Save Changes"}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </form>
    )
}
