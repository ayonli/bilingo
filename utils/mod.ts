import { readFileAsText } from "@ayonli/jsext/fs"
import once from "@ayonli/jsext/once"

export const getGoModName: () => Promise<string> = once(async () => {
    const content = await readFileAsText("go.mod")
    const match = content.match(/^module\s+([^\s]+)/m)
    if (!match) {
        throw new Error("Could not find module name in go.mod")
    }
    return match[1]
})
