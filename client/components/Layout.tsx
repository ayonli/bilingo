import type { JSX, ReactNode } from "react"
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { login, logout } from "../../domains/user/api/user.ts"
import { useAuth } from "../contexts/AuthContext.tsx"
import { LoginDialog } from "./LoginDialog.tsx"
import { alert } from "@ayonli/jsext/dialog"

interface LayoutProps {
    readonly children: ReactNode
}

export function Layout({ children }: LayoutProps): JSX.Element {
    const location = useLocation()
    const navigate = useNavigate()
    const currentYear = new Date().getFullYear()
    const { currentUser, loading, setCurrentUser } = useAuth()
    const [showLoginDialog, setShowLoginDialog] = useState(false)

    async function handleLogout(): Promise<void> {
        const result = await logout()
        if (result.ok) {
            setCurrentUser(null)
            navigate("/")
        } else {
            await alert("登出失败: " + result.error)
        }
    }

    async function handleLogin(email: string, password: string): Promise<void> {
        const result = await login({ email, password })
        if (result.ok) {
            setCurrentUser(result.value)
            setShowLoginDialog(false)
        } else {
            throw new Error(result.error)
        }
    }

    const isActive = (path: string): boolean => {
        if (path === "/") {
            return location.pathname === "/"
        }
        return location.pathname.startsWith(path)
    }

    const linkClass = (path: string): string => {
        const base = "px-4 py-2 rounded-lg transition-colors font-medium"
        if (isActive(path)) {
            return `${base} bg-blue-600 text-white`
        }
        return `${base} text-gray-700 hover:bg-gray-100`
    }

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="bg-white shadow-md">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <Link to="/" className={linkClass("/")}>
                                首页
                            </Link>
                            <Link to="/articles" className={linkClass("/articles")}>
                                文章
                            </Link>
                            <Link to="/users" className={linkClass("/users")}>
                                用户
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            {loading
                                ? (
                                    <span className="text-gray-500 text-sm">
                                        加载中...
                                    </span>
                                )
                                : currentUser
                                ? (
                                    <>
                                        <span className="text-gray-700 text-sm">
                                            欢迎, {currentUser.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                        >
                                            登出
                                        </button>
                                    </>
                                )
                                : (
                                    <button
                                        type="button"
                                        onClick={() => setShowLoginDialog(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        登录
                                    </button>
                                )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 container mx-auto px-4 py-6">
                {children}
            </main>

            <footer className="bg-gray-50 border-t border-gray-200 py-4">
                <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
                    © {currentYear} A-yon Lee
                </div>
            </footer>

            {showLoginDialog && (
                <LoginDialog
                    onClose={() => setShowLoginDialog(false)}
                    onLogin={handleLogin}
                />
            )}
        </div>
    )
}
