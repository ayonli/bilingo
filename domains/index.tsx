import type { JSX } from "react"
import { Link } from "react-router-dom"

export default function Index(): JSX.Element {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    欢迎来到 Bilingo
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                    一个示例的内容管理系统
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                    <Link
                        to="/articles"
                        className="p-6 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer block"
                    >
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                            📝 文章管理
                        </h2>
                        <p className="text-gray-600">
                            创建、编辑和管理您的文章内容
                        </p>
                    </Link>
                    <Link
                        to="/users"
                        className="p-6 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer block"
                    >
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                            👥 用户管理
                        </h2>
                        <p className="text-gray-600">
                            管理系统用户和权限设置
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    )
}
