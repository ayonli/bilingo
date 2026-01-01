import type { JSX } from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import type { ArticleCreate } from "../types"
import { createArticle } from "../api/article.ts"
import { alert } from "@ayonli/jsext/dialog"

export default function ArticleNew(): JSX.Element {
    const navigate = useNavigate()
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [category, setCategory] = useState("")
    const [tags, setTags] = useState("")
    const [saving, setSaving] = useState(false)

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault()

        setSaving(true)
        try {
            const data: ArticleCreate = {
                title: title.trim(),
                content: content.trim(),
                category: category.trim() || undefined,
                tags: tags.trim() || undefined,
            }

            const result = await createArticle(data)
            if (result.ok) {
                await alert("创建成功")
                navigate("/articles/" + result.value.id)
            } else {
                await alert("创建失败: " + result.error)
            }
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">添加文章</h1>
                <Link
                    to="/articles"
                    className="text-gray-600 hover:text-gray-900"
                >
                    返回列表
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
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
                            {saving ? "创建中..." : "创建"}
                        </button>
                        <Link
                            to="/articles"
                            className="inline-block bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                        >
                            取消
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
