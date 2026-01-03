import type { JSX } from "react"
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Article } from "../models"
import type { ArticleUpdate } from "../types"
import { deleteArticle, getArticle, likeArticle, updateArticle } from "../api/article.ts"
import { useAuth } from "../../../client/contexts/AuthContext.tsx"
import { alert, confirm } from "@ayonli/jsext/dialog"
import type { User } from "../../user/models"
import { getUser } from "../../user/api/user.ts"

export default function ArticleDetail(): JSX.Element {
    const { id } = useParams<{ id: string }>()
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const { currentUser } = useAuth()
    const [article, setArticle] = useState<Article | null>(null)
    const [authorUser, setAuthorUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(searchParams.get("edit") === "true")
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [category, setCategory] = useState("")
    const [tags, setTags] = useState("")
    const [saving, setSaving] = useState(false)

    // Check if current user is the author
    const isAuthor = currentUser && article && currentUser.email === article.author

    async function loadArticle(): Promise<void> {
        if (!id) { return }

        setLoading(true)
        try {
            const result = await getArticle(Number(id))
            if (result.success) {
                const article = result.data
                setArticle(article)
                setTitle(article.title)
                setContent(article.content)
                setCategory(article.category || "")
                setTags(article.tags || "")

                // Load author user info
                const authorResult = await getUser(article.author)
                if (authorResult.success) {
                    setAuthorUser(authorResult.data)
                }
            } else {
                await alert("加载文章失败: " + result.message)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadArticle()
    }, [id])

    useEffect(() => {
        setEditMode(searchParams.get("edit") === "true")
    }, [searchParams])

    async function handleSave(): Promise<void> {
        if (!id) { return }

        setSaving(true)
        try {
            const data: ArticleUpdate = {
                title: title.trim(),
                content: content.trim(),
                category: category.trim() || undefined,
                tags: tags.trim() || undefined,
            }

            const result = await updateArticle(Number(id), data)
            if (result.success) {
                await alert("保存成功")
                setEditMode(false)
                setSearchParams({})
                loadArticle()
            } else {
                await alert("保存失败: " + result.message)
            }
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(): Promise<void> {
        if (!id) { return }
        if (!await confirm("确定要删除这篇文章吗？")) { return }

        try {
            const result = await deleteArticle(Number(id))
            if (result.success) {
                await alert("删除成功")
                navigate("/articles")
            } else {
                await alert("删除失败: " + result.message)
            }
        } catch {
            await alert("删除失败")
        }
    }

    async function handleLike(action: "like" | "unlike"): Promise<void> {
        if (!id) { return }

        try {
            const result = await likeArticle(Number(id), action)
            if (result.success) {
                loadArticle()
            } else {
                await alert("操作失败: " + result.message)
            }
        } catch {
            await alert("操作失败")
        }
    }

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr)
        return date.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    function parseTags(tags?: string): string[] {
        if (!tags) { return [] }
        return tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="text-gray-500">加载中...</div>
            </div>
        )
    }

    if (!article) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow rounded-lg p-12 text-center">
                    <p className="text-gray-500 text-lg mb-4">文章不存在</p>
                    <Link
                        to="/articles"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        返回列表
                    </Link>
                </div>
            </div>
        )
    }

    if (editMode) {
        // Check if user is logged in and is the author
        if (!currentUser) {
            return (
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white shadow rounded-lg p-12 text-center">
                        <p className="text-gray-500 text-lg mb-4">请先登录</p>
                        <Link
                            to="/articles"
                            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            返回列表
                        </Link>
                    </div>
                </div>
            )
        }

        if (!isAuthor) {
            return (
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white shadow rounded-lg p-12 text-center">
                        <p className="text-gray-500 text-lg mb-4">您没有权限编辑此文章</p>
                        <Link
                            to={`/articles/${id}`}
                            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            返回文章
                        </Link>
                    </div>
                </div>
            )
        }

        return (
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">编辑文章</h1>
                    <Link
                        to="/articles"
                        className="text-gray-600 hover:text-gray-900"
                    >
                        返回列表
                    </Link>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSave()
                        }}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                标题 *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                内容 *
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                rows={15}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    分类
                                </label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    标签 (用逗号分隔)
                                </label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="tag1, tag2, tag3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? "保存中..." : "保存"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditMode(false)
                                    setSearchParams({})
                                }}
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                            >
                                取消
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Link
                    to="/articles"
                    className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                    ← 返回列表
                </Link>
            </div>

            <article className="bg-white shadow rounded-lg p-8">
                <header className="mb-8 border-b pb-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        {article.title}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>
                            作者: {authorUser
                                ? (
                                    <Link
                                        to={`/users/${encodeURIComponent(authorUser.email)}`}
                                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        {authorUser.name} &lt;{authorUser.email}&gt;
                                    </Link>
                                )
                                : <strong>{article.author}</strong>}
                        </span>
                        <span>发布: {formatDate(article.created_at)}</span>
                        <span>更新: {formatDate(article.updated_at)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {article.category && (
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                {article.category}
                            </span>
                        )}
                        {parseTags(article.tags).map((tag) => (
                            <span
                                key={tag}
                                className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </header>

                <article className="prose prose-slate prose-lg max-w-none mb-8">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {article.content}
                    </ReactMarkdown>
                </article>

                <footer className="border-t pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => handleLike("like")}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                </svg>
                                <span>{article.likes} 点赞</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            {isAuthor && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditMode(true)
                                            setSearchParams({ edit: "true" })
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        编辑
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        删除
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </footer>
            </article>
        </div>
    )
}
