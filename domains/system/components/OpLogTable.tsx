import type { JSX } from "react"
import { useEffect, useState } from "react"
import { alert } from "@ayonli/jsext/dialog"
import type { OpLog } from "../models/index.ts"
import { listOpLogs } from "../api/oplog.ts"
import OpLogDetailDrawer from "./OpLogDetailDrawer.tsx"

interface OpLogTableProps {
    objectType: string
    objectId: number | string
}

export default function OpLogTable(
    { objectType, objectId }: Readonly<OpLogTableProps>,
): JSX.Element {
    const [opLogs, setOpLogs] = useState<OpLog[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOpLog, setSelectedOpLog] = useState<OpLog | null>(null)

    async function loadOpLogs(): Promise<void> {
        setLoading(true)
        try {
            const result = await listOpLogs({
                object_type: objectType,
                object_id: String(objectId),
                page: 1,
                page_size: 100,
            })
            if (result.success) {
                setOpLogs(result.data.list)
            } else {
                await alert("加载操作日志失败: " + result.message)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadOpLogs()
    }, [objectType, objectId])

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr)
        return date.toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    if (loading) {
        return (
            <div className="text-center py-8 text-gray-500">
                加载操作日志中...
            </div>
        )
    }

    if (opLogs.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                暂无操作日志
            </div>
        )
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                时间
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                操作
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                描述
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                结果
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                用户
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                IP
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                详情
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {opLogs.map((opLog) => (
                            <tr key={opLog.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(opLog.timestamp)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {opLog.operation}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                    {opLog.description || "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                                            opLog.result === "success"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {opLog.result === "success" ? "成功" : "失败"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {opLog.user || "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {opLog.ip || "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedOpLog(opLog)}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="查看详情"
                                    >
                                        🔍
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <OpLogDetailDrawer
                opLog={selectedOpLog}
                onClose={() => setSelectedOpLog(null)}
            />
        </>
    )
}
