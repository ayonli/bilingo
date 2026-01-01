import type { JSX, ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"

interface LayoutProps {
    readonly children: ReactNode
}

export function Layout({ children }: LayoutProps): JSX.Element {
    const location = useLocation()
    const currentYear = new Date().getFullYear()

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
                    <div className="flex items-center h-16 gap-2">
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
        </div>
    )
}
