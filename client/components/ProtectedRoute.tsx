import type { JSX, ReactNode } from "react"
import { useState } from "react"
import { LoginDialog } from "../components/LoginDialog.tsx"
import { useAuth } from "../contexts/AuthContext.tsx"
import { login } from "../../domains/user/api/user.ts"

interface ProtectedRouteProps {
    readonly children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
    const { loading, user, setUser } = useAuth()
    const [showLoginDialog, setShowLoginDialog] = useState(false)

    async function handleLogin(email: string, password: string): Promise<void> {
        const result = await login({ email, password })
        if (result.success) {
            setUser(result.data)
            setShowLoginDialog(false)
        } else {
            throw new Error(result.message)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="text-gray-500">加载中...</div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white shadow rounded-lg p-12 text-center">
                    <svg
                        className="w-16 h-16 text-gray-400 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">需要登录</h2>
                    <p className="text-gray-600 mb-6">
                        您需要登录后才能查看此页面
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowLoginDialog(true)}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        立即登录
                    </button>
                </div>

                {showLoginDialog && (
                    <LoginDialog
                        onClose={() => setShowLoginDialog(false)}
                        onLogin={handleLogin}
                    />
                )}
            </div>
        )
    }

    return <>{children}</>
}
