import { ControlKeys, ControlSequences, NavigationKeys, writeStdoutSync } from "@ayonli/jsext/cli"
import { readFileAsText } from "@ayonli/jsext/fs"
import { cwd, dirname } from "@ayonli/jsext/path"
import { try_ } from "@ayonli/jsext/result"
import { type FSWatcher, watch } from "chokidar"
import process from "node:process"

export interface WatchConfig {
    paths: string[]
}

export interface WatcherOptions {
    configKey: "go2ts" | "orm-gen"
    onFileChange: (path: string) => Promise<void>
    readyMessage?: string
    configChangedPrefix?: string
    restartMessage?: string
}

export async function getWatchPaths(key: "go2ts" | "orm-gen"): Promise<string[]> {
    const { ok, error, value: pkgText } = await try_(readFileAsText(cwd() + "/package.json"))
    if (!ok) {
        throw new Error("Failed to read package.json: " + error)
    }

    const pkg = JSON.parse(pkgText) as Record<string, unknown>
    const config = pkg[key] as WatchConfig | undefined
    if (!config) {
        throw new Error(`No ${key} configuration found in package.json`)
    }

    return config.paths
}

export function clearScreen(): void {
    writeStdoutSync(ControlSequences.CLR_SCREEN)
    writeStdoutSync(NavigationKeys.HOME)
    writeStdoutSync(ControlKeys.LF)
}

export async function handleFileChange(
    path: string,
    generate: (dir: string) => Promise<void>,
): Promise<void> {
    clearScreen()
    console.log(`Detected change in Go file: ${path}`)

    const dir = dirname(path)
    await generate(dir)
}

function createGoWatcher(
    paths: string[],
    onFileChange: (path: string) => Promise<void>,
    readyMessage: string,
): FSWatcher {
    return watch(paths, {
        persistent: true,
        awaitWriteFinish: true,
        ignored: (path, stat) => {
            return !!stat?.isFile() && !path.endsWith(".go")
        },
    }).on("add", onFileChange)
        .on("change", onFileChange)
        .on("unlink", onFileChange)
        .on("unlinkDir", onFileChange)
        .once("ready", () => {
            console.log(readyMessage)
        })
}

export async function startWatchMode(options: WatcherOptions): Promise<void> {
    const {
        configKey,
        onFileChange,
        readyMessage = "Watching Go files for changes...",
        configChangedPrefix = configKey,
        restartMessage = "Watcher restarted. Watching Go files for changes...",
    } = options

    let currentPaths = await getWatchPaths(configKey)
    let currentConfig = JSON.stringify(currentPaths)

    let goWatcher = createGoWatcher(currentPaths, onFileChange, readyMessage)

    // Watch package.json for configuration changes
    const packageJsonPath = cwd() + "/package.json"
    const configWatcher = watch(packageJsonPath, {
        persistent: true,
        awaitWriteFinish: true,
    }).on("change", async () => {
        console.log(
            `\nDetected change in package.json, checking ${configChangedPrefix} configuration...`,
        )

        const newPaths = await getWatchPaths(configKey)
        const newConfig = JSON.stringify(newPaths)

        if (newConfig !== currentConfig) {
            console.log(`${configChangedPrefix} configuration changed, restarting watcher...`)

            // Close the old watcher
            await goWatcher.close()

            // Update current config
            currentPaths = newPaths
            currentConfig = newConfig

            // Start new watcher with updated paths
            goWatcher = createGoWatcher(currentPaths, onFileChange, restartMessage)
        }
    })

    console.log("Starting in watch mode...")

    // Handle cleanup on exit
    process.on("SIGINT", async () => {
        console.log("\nShutting down watchers...")
        await goWatcher.close()
        await configWatcher.close()
        process.exit(0)
    })
}

export interface CliOptions {
    commandName: string
    description: string
    generate: (dir: string) => Promise<void>
    onFileChange: (path: string) => Promise<void>
}

export function printUsage(commandName: string, description: string): void {
    console.log("Usage:")
    console.log(`  ${commandName} <dir>         - ${description}`)
    console.log(`  ${commandName} --watch       - Start watch mode`)
}

export async function runCli(options: CliOptions): Promise<void> {
    const { commandName, description, generate } = options
    const args = process.argv.slice(2)
    const firstArg = args.at(0)

    if (!firstArg || firstArg === "--help" || firstArg === "-h") {
        printUsage(commandName, description)
    } else if (firstArg === "--watch" || firstArg === "-w") {
        await startWatchMode({
            configKey: commandName as "go2ts" | "orm-gen",
            onFileChange: options.onFileChange,
        })
    } else {
        await generate(firstArg)
    }
}
