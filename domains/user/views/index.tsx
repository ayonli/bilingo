import type { JSX } from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { listUsers } from "../api/user"
import type { User } from "../models"
import type { UserListQuery } from "../types"
import { ProtectedRoute } from "@/client/components"

export default function UserIndexPage(): JSX.Element {
    const [users, setUsers] = useState<User[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)
    const [error, setError] = useState("")
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

    // Filter states
    const [searchTerm, setSearchTerm] = useState("")
    const [emailsText, setEmailsText] = useState("")
    const [birthdateStart, setBirthdateStart] = useState("")
    const [birthdateEnd, setBirthdateEnd] = useState("")

    async function loadUsers(): Promise<void> {
        setLoading(true)
        setError("")

        // Parse emails from textarea (one per line)
        const emailList = emailsText
            .split("\n")
            .map((email) => email.trim())
            .filter((email) => email.length > 0)

        const query: UserListQuery = {
            page: currentPage,
            page_size: pageSize,
            search: searchTerm || undefined,
            emails: emailList.length > 0 ? emailList : undefined,
            birthdate: birthdateStart || birthdateEnd
                ? {
                    start: birthdateStart || undefined,
                    end: birthdateEnd || undefined,
                }
                : undefined,
        }

        const { success, data, message } = await listUsers(query)

        if (success) {
            setUsers(data.list)
            setTotal(data.total)
        } else {
            setError(message)
        }

        setLoading(false)
    }

    useEffect(() => {
        loadUsers()
    }, [currentPage, pageSize])

    function handleSearch(e: React.FormEvent): void {
        e.preventDefault()
        setCurrentPage(1)
        loadUsers()
    }

    function handleClearFilters(): void {
        setSearchTerm("")
        setEmailsText("")
        setBirthdateStart("")
        setBirthdateEnd("")
        setCurrentPage(1)
        setTimeout(loadUsers, 0)
    }

    const hasFilters = searchTerm || emailsText || birthdateStart || birthdateEnd

    const totalPages = Math.ceil(total / pageSize)

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">用户管理</h1>
                        <Link
                            to="/users/new"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            + 新建用户
                        </Link>
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    id="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="搜索邮箱或姓名..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    title="搜索"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className={`p-2 border rounded-lg transition-colors ${
                                        showAdvancedFilters
                                            ? "bg-blue-50 border-blue-300 hover:bg-blue-100"
                                            : "border-gray-300 hover:bg-gray-50"
                                    }`}
                                    title={showAdvancedFilters ? "隐藏高级筛选" : "显示高级筛选"}
                                >
                                    <svg
                                        className={`w-6 h-6 ${
                                            showAdvancedFilters ? "text-blue-600" : "text-gray-600"
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                        />
                                    </svg>
                                </button>
                                {hasFilters && (
                                    <button
                                        type="button"
                                        onClick={handleClearFilters}
                                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        title="清除所有筛选"
                                    >
                                        <svg
                                            className="w-6 h-6 text-gray-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {showAdvancedFilters && (
                                <>
                                    <div>
                                        <label
                                            htmlFor="emails"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            按指定邮箱筛选（每行一个）
                                        </label>
                                        <textarea
                                            id="emails"
                                            value={emailsText}
                                            onChange={(e) => setEmailsText(e.target.value)}
                                            placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            每行输入一个邮箱地址
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                htmlFor="birthdateStart"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                生日起始日期
                                            </label>
                                            <input
                                                type="date"
                                                id="birthdateStart"
                                                value={birthdateStart}
                                                onChange={(e) => setBirthdateStart(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="birthdateEnd"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                生日结束日期
                                            </label>
                                            <input
                                                type="date"
                                                id="birthdateEnd"
                                                value={birthdateEnd}
                                                onChange={(e) => setBirthdateEnd(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        {loading
                            ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">加载中...</p>
                                </div>
                            )
                            : users.length === 0
                            ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">未找到用户</p>
                                </div>
                            )
                            : (
                                <>
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    邮箱
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    姓名
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    生日
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    创建时间
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    更新时间
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.map((user) => (
                                                <tr key={user.email} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <Link
                                                            to={`/users/${
                                                                encodeURIComponent(user.email)
                                                            }`}
                                                            className="text-blue-600 hover:text-blue-900 hover:underline"
                                                        >
                                                            {user.email}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {user.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {user.birthdate || "-"}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(user.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(user.updated_at).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>{" "}
                                    {totalPages > 1 && (
                                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                            <div className="text-sm text-gray-700">
                                                显示 {(currentPage - 1) * pageSize + 1} 到{" "}
                                                {Math.min(currentPage * pageSize, total)} 条，共
                                                {" "}
                                                {total} 条结果
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setCurrentPage((p) => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    上一页
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    {Array.from(
                                                        { length: totalPages },
                                                        (_, i) => i + 1,
                                                    )
                                                        .filter((page) => {
                                                            return page === 1 ||
                                                                page === totalPages ||
                                                                Math.abs(page - currentPage) <= 2
                                                        })
                                                        .map((page, idx, arr) => {
                                                            const showEllipsis = idx > 0 &&
                                                                page - arr[idx - 1] > 1
                                                            return (
                                                                <span key={page}>
                                                                    {showEllipsis && (
                                                                        <span className="px-2">
                                                                            ...
                                                                        </span>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setCurrentPage(page)}
                                                                        className={`px-4 py-2 rounded-lg transition-colors ${
                                                                            currentPage === page
                                                                                ? "bg-blue-600 text-white"
                                                                                : "border border-gray-300 hover:bg-white"
                                                                        }`}
                                                                    >
                                                                        {page}
                                                                    </button>
                                                                </span>
                                                            )
                                                        })}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setCurrentPage((p) =>
                                                            Math.min(totalPages, p + 1)
                                                        )}
                                                    disabled={currentPage === totalPages}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    下一页
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
