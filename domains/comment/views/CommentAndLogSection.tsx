import type { JSX } from "react"
import { useState } from "react"
import CommentSection from "./CommentSection.tsx"
import OpLogTable from "@/domains/system/views/OpLogTable.tsx"

interface CommentAndLogSectionProps {
    objectType: string
    objectId: number | string
}

type TabType = "comments" | "logs"

export default function CommentAndLogSection({
    objectType,
    objectId,
}: Readonly<CommentAndLogSectionProps>): JSX.Element {
    const [activeTab, setActiveTab] = useState<TabType>("comments")

    return (
        <div className="mt-8 border-t pt-8">
            {/* Tabs Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    type="button"
                    onClick={() => setActiveTab("comments")}
                    className={`text-xl font-bold pb-2 transition-colors ${
                        activeTab === "comments"
                            ? "text-gray-900 border-b-2 border-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    评论
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("logs")}
                    className={`text-xl font-bold pb-2 transition-colors ${
                        activeTab === "logs"
                            ? "text-gray-900 border-b-2 border-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    日志
                </button>
            </div>

            {/* Comments Tab Content */}
            {activeTab === "comments" && (
                <CommentSection objectType={objectType} objectId={objectId} />
            )}

            {/* Logs Tab Content */}
            {activeTab === "logs" && <OpLogTable objectType={objectType} objectId={objectId} />}
        </div>
    )
}
