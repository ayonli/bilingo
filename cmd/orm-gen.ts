import { run } from "@ayonli/jsext/cli"
import { dirname, join } from "@ayonli/jsext/path"
import { isMain } from "@ayonli/jsext/module"
import { Mutex } from "@ayonli/jsext/lock"
import { handleFileChange, runCli } from "./utils/watch.ts"

const genLock = new Mutex<void>(void 0)

export async function generate(inPath: string): Promise<void> {
    const lock = await genLock.lock()
    const parentDir = dirname(inPath)
    const outPath = join(parentDir, "tables")

    try {
        const { code, stderr } = await run("gorm", ["gen", "-i", inPath, "-o", outPath])
        if (code) {
            console.error("Error generating GORM tables:", stderr)
        } else {
            console.log("Successfully generated GORM tables to:", outPath)
        }
    } finally {
        lock.unlock()
    }
}

async function onFileChange(path: string): Promise<void> {
    await handleFileChange(path, generate)
}

async function main(): Promise<void> {
    await runCli({
        commandName: "orm-gen",
        description: "Generate GORM tables for the given directory",
        generate,
        onFileChange,
    })
}

if (isMain(import.meta)) {
    main().catch(console.error)
}
