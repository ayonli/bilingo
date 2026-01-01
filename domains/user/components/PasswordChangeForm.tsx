import type { JSX } from "react"
import { useState } from "react"
import type { PasswordChange } from "../types"

interface PasswordChangeFormProps {
    onSubmit: (data: PasswordChange) => Promise<void>
    onCancel?: () => void
}

export default function PasswordChangeForm({
    onSubmit,
    onCancel,
}: Readonly<PasswordChangeFormProps>): JSX.Element {
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
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

        if (formData.newPassword !== formData.confirmPassword) {
            setError("New passwords do not match")
            return
        }

        if (formData.oldPassword === formData.newPassword) {
            setError("New password must be different from old password")
            return
        }

        setLoading(true)

        try {
            const submitData: PasswordChange = {
                old_password: formData.oldPassword,
                new_password: formData.newPassword,
            }
            await onSubmit(submitData)
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
                <div>
                    <label
                        htmlFor="oldPassword"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Current Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        id="oldPassword"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                    />
                </div>

                <div>
                    <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
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
                        Confirm New Password <span className="text-red-500">*</span>
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
                        {loading ? "Changing..." : "Change Password"}
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
