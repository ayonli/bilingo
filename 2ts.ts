import { readFileAsText } from "@ayonli/jsext/fs"
import { cwd } from "@ayonli/jsext/path"
import { try_ } from "@ayonli/jsext/result"

interface Lang2TSConfig {
    paths: string[]
}

export async function getWatchPaths(key: "go2ts" | "py2ts"): Promise<string[]> {
    const { ok, error, value: pkgText } = await try_(readFileAsText(cwd() + "/package.json"))
    if (!ok) {
        throw new Error("Failed to read package.json: " + error)
    }

    const pkg = JSON.parse(pkgText) as Record<string, unknown>
    const config = pkg[key] as Lang2TSConfig | undefined
    if (!config) {
        throw new Error(`No ${key} configuration found in package.json`)
    }

    return config.paths
}

export function isReservedPath(path: string): boolean {
    const re = /(?:^|[\\/])(?:node_modules|dist|build|\.git|\.venv|__pycache__)(?:[\\/]|$)/
    return re.test(path)
}
