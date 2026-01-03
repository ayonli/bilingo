import { run } from "@ayonli/jsext/cli"
import { remove, writeFile } from "@ayonli/jsext/fs"
import { isMain } from "@ayonli/jsext/module"
import { Mutex } from "@ayonli/jsext/lock"
import { getGoModName } from "../utils/mod.ts"
import { handleFileChange, runCli } from "./utils/watch.ts"

const genLock = new Mutex<void>(void 0)

export async function generate(dir: string): Promise<void> {
    const lock = await genLock.lock()
    const modName = await getGoModName()
    const tempYaml = `
type_mappings:
  time.Time: "string /* RFC3339 */"
packages:
    - path: "${modName}/${dir}"
      indent: "    "
      enum_style: "enum"
`
    const cfgFile = "/tmp/tygo_temp.yaml"
    await writeFile(cfgFile, tempYaml)

    try {
        const { code, stderr } = await run("tygo", ["generate", "--config", cfgFile])
        if (code) {
            console.error("Error generating TypeScript definitions from Go models:", stderr)
        } else {
            const dest = dir + "/index.ts"
            console.log("Successfully generated TypeScript to:", dest)
        }
    } finally {
        await remove(cfgFile)
        lock.unlock()
    }
}

async function onFileChange(path: string): Promise<void> {
    await handleFileChange(path, generate)
}

async function main(): Promise<void> {
    await runCli({
        commandName: "go2ts",
        description: "Generate TypeScript definitions for the given directory",
        generate,
        onFileChange,
    })
}

if (isMain(import.meta)) {
    main().catch(console.error)
}
