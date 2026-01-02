import once from "@ayonli/jsext/once"
import {
    ControlKeys,
    ControlSequences,
    NavigationKeys,
    run,
    writeStdoutSync,
} from "@ayonli/jsext/cli"
import { readFileAsText, remove, writeFile } from "@ayonli/jsext/fs"
import { cwd, dirname } from "@ayonli/jsext/path"
import { watch } from "chokidar"
import process from "node:process"
import { isMain } from "@ayonli/jsext/module"
import { try_ } from "@ayonli/jsext/result"

const getGoModName: () => Promise<string> = once(async () => {
    const content = await readFileAsText("go.mod")
    const match = content.match(/^module\s+([^\s]+)/m)
    if (!match) {
        throw new Error("Could not find module name in go.mod")
    }
    return match[1]
})

interface Lang2TSConfig {
    paths: string[]
}

export async function getWatchPaths(): Promise<string[]> {
    const { ok, error, value: pkgText } = await try_(readFileAsText(cwd() + "/package.json"))
    if (!ok) {
        throw new Error("Failed to read package.json: " + error)
    }

    const pkg = JSON.parse(pkgText) as Record<string, unknown>
    const config = pkg["go2ts"] as Lang2TSConfig | undefined
    if (!config) {
        throw new Error(`No go2ts configuration found in package.json`)
    }

    return config.paths
}

export async function generate(dir: string): Promise<void> {
    const modName = await getGoModName()
    const tempYaml = `
type_mappings:
  time.Time: "string /* RFC3339 */"
packages:
    - path: "${modName}/${dir}"
      indent: "    "
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
    }
}

async function handleFileChange(path: string): Promise<void> {
    writeStdoutSync(ControlSequences.CLR_SCREEN)
    writeStdoutSync(NavigationKeys.HOME)
    writeStdoutSync(ControlKeys.LF)
    console.log(`Detected change in Go file: ${path}`)

    const dir = dirname(path)
    await generate(dir)
}

async function startWatchMode(): Promise<void> {
    const paths = await getWatchPaths()
    const _watcher = watch(paths, {
        persistent: true,
        awaitWriteFinish: true,
        ignored: (path, stat) => {
            return !!stat?.isFile() && !path.endsWith(".go")
        },
    }).on("add", handleFileChange)
        .on("change", handleFileChange)
        .on("unlink", handleFileChange)
        .on("unlinkDir", handleFileChange)
        .once("ready", () => {
            console.log("Watching Go model files for changes...")
        })

    console.log("Starting in watch mode...")
}

function printUsage(): void {
    console.log("Usage:")
    console.log("  go2ts <dir>         - Generate TypeScript definitions for the given directory")
    console.log("  go2ts --watch       - Start watch mode")
}

async function main(): Promise<void> {
    const args = process.argv.slice(2)
    const firstArg = args.at(0)

    if (!firstArg || firstArg === "--help" || firstArg === "-h") {
        printUsage()
    } else if (firstArg === "--watch" || firstArg === "-w") {
        startWatchMode()
    } else {
        await generate(firstArg)
    }
}

if (isMain(import.meta)) {
    main().catch(console.error)
}
