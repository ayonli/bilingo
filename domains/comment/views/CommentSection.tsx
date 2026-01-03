import type { JSX } from "react"
import { useEffect, useRef, useState } from "react"
import { alert, confirm } from "@ayonli/jsext/dialog"
import type { Comment } from "../models"
import type { CommentCreate, CommentUpdate } from "../types"
import { createComment, deleteComment, listComments, updateComment } from "../api/comment.ts"
import { useAuth } from "@/client/contexts/AuthContext.tsx"

interface CommentSectionProps {
    objectType: string
    objectId: number | string
}

export default function CommentSection({ objectType, objectId }: CommentSectionProps): JSX.Element {
    const { currentUser } = useAuth()
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [newComment, setNewComment] = useState("")
    const [authorEmail, setAuthorEmail] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editContent, setEditContent] = useState("")
    const [replyToId, setReplyToId] = useState<number | null>(null)
    const [replyToEmail, setReplyToEmail] = useState<string | null>(null)
    const commentTextareaRef = useRef<HTMLTextAreaElement>(null)

    async function loadComments(): Promise<void> {
        setLoading(true)
        try {
            const result = await listComments({
                object_type: objectType,
                object_id: String(objectId),
                page: 1,
                page_size: 100,
            })
            if (result.success) {
                setComments(result.data.list)
            } else {
                await alert("加载评论失败: " + result.message)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadComments()
    }, [objectType, objectId])

    useEffect(() => {
        if (currentUser) {
            setAuthorEmail(currentUser.email)
        }
    }, [currentUser])

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault()
        if (!newComment.trim() || !authorEmail.trim()) {
            return
        }

        setSubmitting(true)
        try {
            const data: CommentCreate = {
                object_type: objectType,
                object_id: String(objectId),
                content: newComment.trim(),
                author: authorEmail.trim(),
                parent_id: replyToId || undefined,
            }

            const result = await createComment(data)
            if (result.success) {
                setNewComment("")
                setReplyToId(null)
                setReplyToEmail(null)
                await loadComments()
            } else {
                await alert("发表评论失败: " + result.message)
            }
        } catch (error) {
            console.error("Failed to create comment:", error)
            await alert("发表评论失败: " + String(error))
        } finally {
            setSubmitting(false)
        }
    }

    async function handleEdit(commentId: number): Promise<void> {
        if (!editContent.trim()) {
            return
        }

        try {
            const data: CommentUpdate = {
                content: editContent.trim(),
            }

            const result = await updateComment(commentId, data)
            if (result.success) {
                setEditingId(null)
                setEditContent("")
                await loadComments()
            } else {
                await alert("修改评论失败: " + result.message)
            }
        } catch {
            await alert("修改评论失败")
        }
    }

    async function handleDelete(commentId: number): Promise<void> {
        if (!await confirm("确定要删除这条评论吗？")) {
            return
        }

        try {
            const result = await deleteComment(commentId)
            if (result.success) {
                await loadComments()
            } else {
                await alert("删除评论失败: " + result.message)
            }
        } catch {
            await alert("删除评论失败")
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

    function getCommentsByParent(parentId?: number): Comment[] {
        return comments.filter((c) => {
            if (parentId === undefined) {
                return !c.parent_id
            }
            return c.parent_id === parentId
        })
    }

    function renderComment(comment: Comment, level = 0): JSX.Element {
        const isEditing = editingId === comment.id
        const isAuthor = currentUser && currentUser.email === comment.author
        const replies = getCommentsByParent(comment.id)

        return (
            <div
                key={comment.id}
                className={level > 0 ? "ml-8 mt-4 border-l-2 border-gray-200 pl-4" : ""}
            >
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <span className="font-semibold text-gray-900">
                                {comment.author}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                                {formatDate(comment.created_at)}
                            </span>
                        </div>
                        {isAuthor && (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingId(comment.id)
                                        setEditContent(comment.content)
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    编辑
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(comment.id)}
                                    className="text-sm text-red-600 hover:text-red-700"
                                >
                                    删除
                                </button>
                            </div>
                        )}
                    </div>

                    {isEditing
                        ? (
                            <div className="mt-2">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(comment.id)}
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    >
                                        保存
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingId(null)
                                            setEditContent("")
                                        }}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                                    >
                                        取消
                                    </button>
                                </div>
                            </div>
                        )
                        : (
                            <>
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {comment.content}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setReplyToId(comment.id)
                                        setReplyToEmail(comment.author)
                                        commentTextareaRef.current?.focus()
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                                >
                                    回复
                                </button>
                            </>
                        )}
                </div>

                {replies.length > 0 && (
                    <div className="mt-2">
                        {replies.map((reply) => renderComment(reply, level + 1))}
                    </div>
                )}
            </div>
        )
    }

    const topLevelComments = getCommentsByParent()

    return (
        <div className="mt-8 border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                评论 ({comments.length})
            </h2>

            {/* New Comment Form */}
            <form onSubmit={handleSubmit} className="mb-8">
                {replyToId && (
                    <div className="mb-2 text-sm text-gray-600">
                        正在回复评论 #{replyToId}
                        <button
                            type="button"
                            onClick={() => {
                                setReplyToId(null)
                                setReplyToEmail(null)
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-700"
                        >
                            取消
                        </button>
                    </div>
                )}
                <textarea
                    ref={commentTextareaRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={replyToEmail ? `回复 ${replyToEmail}` : "写下你的评论..."}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                />
                <div className="flex justify-between items-center mt-2 gap-4">
                    <div className="flex items-center gap-2 flex-1">
                        <label
                            htmlFor="author-email"
                            className="text-sm font-medium text-gray-700 whitespace-nowrap"
                        >
                            您的邮箱:
                        </label>
                        <input
                            id="author-email"
                            type="email"
                            value={authorEmail}
                            onChange={(e) => setAuthorEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting || !newComment.trim() || !authorEmail.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? "发表中..." : "发表评论"}
                    </button>
                </div>
            </form>

            {/* Divider */}
            <div className="border-t border-gray-200 my-8"></div>

            {/* Comments List */}
            {loading
                ? (
                    <div className="text-center py-8 text-gray-500">
                        加载评论中...
                    </div>
                )
                : topLevelComments.length === 0
                ? (
                    <div className="text-center py-8 text-gray-500">
                        暂无评论，快来发表第一条评论吧！
                    </div>
                )
                : (
                    <div className="space-y-4">
                        {topLevelComments.map((comment) => renderComment(comment))}
                    </div>
                )}
        </div>
    )
}
