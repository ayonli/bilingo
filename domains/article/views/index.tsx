import type { JSX } from "react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import type { Article } from "../models"
import type { ArticleListQuery } from "../types"
import { listArticles } from "../api/article.ts"
import { alert } from "@ayonli/jsext/dialog"

export default function ArticleIndex(): JSX.Element {
    const navigate = useNavigate()
    const [articles, setArticles] = useState<Article[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [author, setAuthor] = useState("")
    const [category, setCategory] = useState("")
    const [loading, setLoading] = useState(false)

    const pageSize = 12

    async function loadArticles(): Promise<void> {
        setLoading(true)
        try {
            const query: Partial<ArticleListQuery> = {
                page,
                page_size: pageSize,
            }

            if (searchTerm.trim()) {
                query.search = searchTerm.trim()
            }
            if (author.trim()) {
                query.author = author.trim()
            }
            if (category.trim()) {
                query.category = category.trim()
            }

            const result = await listArticles(query)
            if (result.success) {
                setArticles(result.data.list)
                setTotal(result.data.total)
            } else {
                await alert("加载文章失败: " + result.message)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadArticles()
    }, [page])

    function handleSearch(e: React.FormEvent): void {
        e.preventDefault()
        setPage(1)
        loadArticles()
    }

    function handleClearFilters(): void {
        setSearchTerm("")
        setAuthor("")
        setCategory("")
        setPage(1)
        setTimeout(() => loadArticles(), 0)
    }

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr)
        return date.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
    }

    function getExcerpt(content: string, length = 100): string {
        // Remove markdown syntax for plain text preview
        const plainText = content
            .replace(/^#{1,6}\s+/gm, "") // Remove headers
            .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
            .replace(/\*(.+?)\*/g, "$1") // Remove italic
            .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Remove links, keep text
            .replace(/`(.+?)`/g, "$1") // Remove code
            .replace(/^\s*[-*+]\s+/gm, "") // Remove list markers
            .replace(/^\s*\d+\.\s+/gm, "") // Remove numbered list markers
            .trim()

        if (plainText.length <= length) {
            return plainText
        }
        return plainText.slice(0, length) + "..."
    }

    function parseTags(tags?: string): string[] {
        if (!tags) { return [] }
        return tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    }

    const totalPages = Math.ceil(total / pageSize)
    const hasFilters = searchTerm || author || category

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">文章列表</h1>
                <Link
                    to="/articles/new"
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                    + 添加文章
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="搜索标题或内容..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            className="px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            搜索
                        </button>
                        {hasFilters && (
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                清除
                            </button>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="作者..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="分类..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </form>
            </div>

            {loading
                ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-gray-500">加载中...</div>
                    </div>
                )
                : articles.length === 0
                ? (
                    <div className="bg-white shadow rounded-lg p-12 text-center">
                        <p className="text-gray-500 text-lg">暂无文章</p>
                    </div>
                )
                : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article) => (
                                <div
                                    key={article.id}
                                    onClick={() => navigate("/articles/" + article.id)}
                                    className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                >
                                    <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                                        {article.title}
                                    </h2>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {getExcerpt(article.content)}
                                    </p>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span>作者:</span>
                                            <span className="font-medium text-gray-700">
                                                {article.author}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>
                                                发布: {formatDate(article.created_at)}
                                            </span>
                                            <span>
                                                更新: {formatDate(article.updated_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {article.category && (
                                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                {article.category}
                                            </span>
                                        )}
                                        {parseTags(article.tags).map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
                                        <span className="flex items-center gap-1">
                                            <svg
                                                className="w-5 h-5 text-red-500"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                            </svg>
                                            {article.likes}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    上一页
                                </button>
                                <span className="px-4 py-2 text-gray-700">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    下一页
                                </button>
                            </div>
                        )}
                    </>
                )}
        </div>
    )
}
