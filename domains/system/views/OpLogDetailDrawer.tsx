import type { JSX } from "react"
import { useEffect } from "react"
import type { OpLog } from "../models"

interface OpLogDetailDrawerProps {
    opLog: OpLog | null
    onClose: () => void
}

export default function OpLogDetailDrawer(
    { opLog, onClose }: Readonly<OpLogDetailDrawerProps>,
): JSX.Element | null {
    useEffect(() => {
        function handleEscape(e: KeyboardEvent): void {
            if (e.key === "Escape") {
                onClose()
            }
        }

        if (opLog) {
            document.addEventListener("keydown", handleEscape)
        }

        return () => {
            document.removeEventListener("keydown", handleEscape)
        }
    }, [opLog, onClose])

    if (!opLog) {
        return null
    }

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr)
        return date.toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })
    }

    function formatJSON(jsonStr: string | undefined): string {
        if (!jsonStr) {
            return ""
        }
        try {
            const obj = JSON.parse(jsonStr)
            return JSON.stringify(obj, null, 2)
        } catch {
            return jsonStr
        }
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">操作日志详情</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
                        >
                            ×
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="border-b pb-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        时间
                                    </label>
                                    <p className="text-gray-900 mt-1">
                                        {formatDate(opLog.timestamp)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        操作
                                    </label>
                                    <p className="text-gray-900 mt-1">{opLog.operation}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        结果
                                    </label>
                                    <p className="mt-1">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                                                opLog.result === "success"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {opLog.result === "success" ? "成功" : "失败"}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        用户
                                    </label>
                                    <p className="text-gray-900 mt-1">{opLog.user || "-"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">IP</label>
                                    <p className="text-gray-900 mt-1">{opLog.ip || "-"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        次数
                                    </label>
                                    <p className="text-gray-900 mt-1">{opLog.times}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {opLog.description && (
                            <div className="border-b pb-4">
                                <label className="text-sm font-medium text-gray-500">描述</label>
                                <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                                    {opLog.description}
                                </p>
                            </div>
                        )}

                        {/* New Data */}
                        {opLog.new_data && (
                            <div className="border-b pb-4">
                                <label className="text-sm font-medium text-gray-500 mb-2 block">
                                    新数据
                                </label>
                                <pre className="bg-gray-50 border border-gray-200 rounded p-4 overflow-x-auto text-sm text-gray-900">
                                    {formatJSON(opLog.new_data)}
                                </pre>
                            </div>
                        )}

                        {/* Old Data */}
                        {opLog.old_data && (
                            <div className="pb-4">
                                <label className="text-sm font-medium text-gray-500 mb-2 block">
                                    旧数据
                                </label>
                                <pre className="bg-gray-50 border border-gray-200 rounded p-4 overflow-x-auto text-sm text-gray-900">
                                    {formatJSON(opLog.old_data)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
