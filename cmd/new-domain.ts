import process from "node:process"
import { exists, mkdir, readFileAsText, writeFile } from "@ayonli/jsext/fs"
import { getGoModName } from "../utils/mod"
import pluralize from "pluralize"
import { run } from "@ayonli/jsext/cli"

const name = process.argv[2]
if (!name) {
    console.error("Please provide a domain name.")
    process.exit(1)
}

if (await exists("domains/" + name)) {
    console.error(`Domain "${name}" already exists.`)
    process.exit(1)
}

const modName = await getGoModName()
const pluralName = pluralize(name)
const PascalName = toPascalCase(name)
const PascalPluralName = toPascalCase(pluralName)
const camelName = toCamelCase(name)
const camelPluralName = toCamelCase(pluralName)

function toPascalCase(str: string): string {
    return str
        .split(/[_-]/g)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("")
}

function toCamelCase(str: string): string {
    const pascal = toPascalCase(str)
    return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

async function updateGoMainImports(domain: string): Promise<void> {
    const mainGoPath = process.cwd() + "/server/main/main.go"
    const content = await readFileAsText(mainGoPath)

    // Split content into lines
    const lines = content.split("\n")

    // Find the closing parenthesis of the import block
    let importEndIndex = -1
    let inImportBlock = false

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line.startsWith("import (")) {
            inImportBlock = true
        } else if (inImportBlock && line === ")") {
            importEndIndex = i
            break
        }
    }

    if (importEndIndex === -1) {
        throw new Error("Could not find import block closing parenthesis in server/main/main.go")
    }

    // Create the new import line
    const newImport = `\t_ "${modName}/domains/${domain}/api"`

    // Insert the new import before the closing parenthesis
    const newLines = [
        ...lines.slice(0, importEndIndex),
        newImport,
        ...lines.slice(importEndIndex),
    ]

    await writeFile(mainGoPath, newLines.join("\n"))
}

async function updateGo2TsWatchPaths(domain: string): Promise<void> {
    const packageJsonPath = process.cwd() + "/package.json"
    const content = await readFileAsText(packageJsonPath)
    const packageJson = JSON.parse(content)

    if (!packageJson.go2ts || !Array.isArray(packageJson.go2ts.paths)) {
        throw new Error("Could not find go2ts.paths in package.json")
    }

    // Add the new domain's models and types paths
    const modelsPath = `./domains/${domain}/models`
    const typesPath = `./domains/${domain}/types`

    if (!packageJson.go2ts.paths.includes(modelsPath)) {
        packageJson.go2ts.paths.push(modelsPath)
    }

    if (!packageJson.go2ts.paths.includes(typesPath)) {
        packageJson.go2ts.paths.push(typesPath)
    }

    // Write back with proper formatting
    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 4) + "\n")
}

async function updateOrmGenWatchPaths(domain: string): Promise<void> {
    const packageJsonPath = process.cwd() + "/package.json"
    const content = await readFileAsText(packageJsonPath)
    const packageJson = JSON.parse(content)

    if (!packageJson["orm-gen"] || !Array.isArray(packageJson["orm-gen"].paths)) {
        throw new Error("Could not find orm-gen.paths in package.json")
    }

    // Add the new domain's models and types paths
    const modelsPath = `./domains/${domain}/models`

    if (!packageJson["orm-gen"].paths.includes(modelsPath)) {
        packageJson["orm-gen"].paths.push(modelsPath)
    }

    // Write back with proper formatting
    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 4) + "\n")
}

await mkdir("domains/" + name)
await mkdir("domains/" + name + "/api")
await mkdir("domains/" + name + "/models")
await mkdir("domains/" + name + "/repo")
await mkdir("domains/" + name + "/service")
await mkdir("domains/" + name + "/types")
await mkdir("domains/" + name + "/views")

// API in Go
await writeFile(
    `domains/${name}/api/${name}.go`,
    `
package api

import (
    "errors"
    "fmt"
    "strconv"

    domain "${modName}/domains/${name}"
    "${modName}/domains/${name}/service"
    "${modName}/domains/${name}/types"
    "${modName}/server"
    "${modName}/server/auth"
    "github.com/gofiber/fiber/v2"
)

var ${PascalName}Api = server.NewApiEntry("/${pluralName}", auth.UseAuth)

func init() {
	${PascalName}Api.Get("/", list${PascalPluralName})
	${PascalName}Api.Get("/:id", get${PascalName})
    ${PascalName}Api.Post("/", auth.RequireAuth, create${PascalName})
    ${PascalName}Api.Patch("/:id", auth.RequireAuth, update${PascalName})
	${PascalName}Api.Delete("/:id", auth.RequireAuth, delete${PascalName})
}

func get${PascalName}(ctx *fiber.Ctx) error {
	id, err := strconv.ParseUint(ctx.Params("id"), 10, 32)
	if err != nil {
		return server.Error(ctx, 400, fmt.Errorf("invalid ${name} ID: %w", err))
	}

	${camelName}, err := service.Get${PascalName}(ctx.UserContext(), uint(id))
	if errors.Is(err, domain.Err${PascalName}NotFound) {
		return server.Error(ctx, 404, domain.Err${PascalName}NotFound)
	} else if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, ${camelName})
}

func list${PascalPluralName}(ctx *fiber.Ctx) error {
	var query types.${PascalName}ListQuery
	if err := ctx.QueryParser(&query); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed query: %w", err))
	}

	result, err := service.List${PascalPluralName}(ctx.UserContext(), query)
	if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, result)
}

func create${PascalName}(ctx *fiber.Ctx) error {
	var data types.${PascalName}Create
	if err := ctx.BodyParser(&data); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed request body: %w", err))
	}

	${camelName}, err := service.Create${PascalName}(ctx.UserContext(), &data)
	if err != nil {
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, ${camelName})
}

func update${PascalName}(ctx *fiber.Ctx) error {
	id, err := strconv.ParseUint(ctx.Params("id"), 10, 32)
	if err != nil {
		return server.Error(ctx, 400, fmt.Errorf("invalid ${name} ID: %w", err))
	}

	var data types.${PascalName}Update
	if err := ctx.BodyParser(&data); err != nil {
		return server.Error(ctx, 400, fmt.Errorf("malformed request body: %w", err))
	}

    ${camelName}, err := service.Update${PascalName}(ctx.UserContext(), uint(id), &data)
	if err != nil {
		if errors.Is(err, domain.Err${PascalName}NotFound) {
			return server.Error(ctx, 404, domain.Err${PascalName}NotFound)
		}
		return server.Error(ctx, 500, err)
	}

	return server.Success(ctx, ${camelName})
}

func delete${PascalName}(ctx *fiber.Ctx) error {
	id, err := strconv.ParseUint(ctx.Params("id"), 10, 32)
	if err != nil {
		return server.Error(ctx, 400, fmt.Errorf("invalid ${name} ID: %w", err))
	}

	if err := service.Delete${PascalName}(ctx.UserContext(), uint(id)); err != nil {
		if errors.Is(err, domain.Err${PascalName}NotFound) {
			return server.Error(ctx, 404, domain.Err${PascalName}NotFound)
		}
		return server.Error(ctx, 500, err)
	}

	return server.Success[any](ctx, nil)
}
`.trimStart(),
)

// API in TS
await writeFile(
    `domains/${name}/api/${name}.ts`,
    `
import type { ApiResponse, PaginatedResult } from "@/common"
import { ApiEntry } from "@/client"
import type { ${PascalName} } from "../models"
import type { ${PascalName}Create, ${PascalName}ListQuery, ${PascalName}Update } from "../types"

const ${camelName}Api = new ApiEntry("/${pluralName}")

export async function get${PascalName}(id: number): ApiResponse<${PascalName}> {
    return await ${camelName}Api.get("/" + id)
}

export async function list${PascalPluralName}(
    query: Partial<${PascalName}ListQuery>,
): ApiResponse<PaginatedResult<${PascalName}>> {
    return await ${camelName}Api.get("/", query)
}

export async function create${PascalName}(data: ${PascalName}Create): ApiResponse<${PascalName}> {
    return await ${camelName}Api.post("/", null, data)
}

export async function update${PascalName}(id: number, data: ${PascalName}Update): ApiResponse<${PascalName}> {
    return await ${camelName}Api.patch("/" + id, null, data)
}

export async function delete${PascalName}(id: number): ApiResponse<null> {
    return await ${camelName}Api.delete("/" + id)
}
`.trimStart(),
)

// Models in Go
await writeFile(
    `domains/${name}/models/${name}.go`,
    `
package models

import "time"

type ${PascalName} struct {
    ID        uint      \`json:"id" gorm:"primaryKey"\`
    CreatedAt time.Time \`json:"created_at"\`
    UpdatedAt time.Time \`json:"updated_at"\`
    // Add your fields here
}

func (a *${PascalName}) TableName() string {
    return "${camelName}"
}
`.trimStart(),
)

// Models in TS
{
    const { code, stderr, stdout } = await run("tsx", [
        "cmd/go2ts.ts",
        `domains/${name}/models`,
    ])
    if (code) {
        console.error(stderr)
    } else {
        console.log(stdout)
    }
}

// Repo in Go
await writeFile(
    `domains/${name}/repo/${name}.go`,
    `
package repo

import (
    "context"

    "${modName}/common"
    "${modName}/domains/${name}/models"
    impl "${modName}/domains/${name}/repo/db"
    "${modName}/domains/${name}/types"
)

var ${PascalName}Repo I${PascalName}Repo = &impl.${PascalName}Repo{}

type I${PascalName}Repo interface {
    Get(ctx context.Context, id uint) (*models.${PascalName}, error)
    List(ctx context.Context, query *types.${PascalName}ListQuery) (*common.PaginatedResult[models.${PascalName}], error)
    Create(ctx context.Context, data *types.${PascalName}Create) (*models.${PascalName}, error)
    Update(ctx context.Context, id uint, updates *types.${PascalName}Update) (*models.${PascalName}, error)
    Delete(ctx context.Context, id uint) error
}
`.trimStart(),
)

// Service in Go
await writeFile(
    `domains/${name}/service/${name}.go`,
    `
package service

import (
    "context"

    "${modName}/common"
    "${modName}/domains/${name}/models"
    "${modName}/domains/${name}/repo"
    "${modName}/domains/${name}/types"
)

func Get${PascalName}(ctx context.Context, id uint) (*models.${PascalName}, error) {
    return repo.${PascalName}Repo.Get(ctx, id)
}

func List${PascalPluralName}(ctx context.Context, query types.${PascalName}ListQuery) (*common.PaginatedResult[models.${PascalName}], error) {
    return repo.${PascalName}Repo.List(ctx, &query)
}

func Create${PascalName}(ctx context.Context, data *types.${PascalName}Create) (*models.${PascalName}, error) {
    return repo.${PascalName}Repo.Create(ctx, data)
}

func Update${PascalName}(ctx context.Context, id uint, updates *types.${PascalName}Update) (*models.${PascalName}, error) {
    return repo.${PascalName}Repo.Update(ctx, id, updates)
}

func Delete${PascalName}(ctx context.Context, id uint) error {
    return repo.${PascalName}Repo.Delete(ctx, id)
}
`.trimStart(),
)

// Types in Go
await writeFile(
    `domains/${name}/types/${name}.go`,
    `
package types

import "${modName}/common"

//tygo:emit import type * as common from "@/common"
type ${PascalName}Create struct {
    // Add your fields here
}

type ${PascalName}Update struct {
    // Add your fields here
}

type ${PascalName}ListQuery struct {
    common.PaginatedQuery \`tstype:",extends"\`
    // Add your fields here
}
`.trimStart(),
)

// Types in TS
{
    const { code, stderr, stdout } = await run("tsx", [
        "cmd/go2ts.ts",
        `domains/${name}/types`,
    ])
    if (code) {
        console.error(stderr)
    } else {
        console.log(stdout)
    }
}

// errors.go
await writeFile(
    `domains/${name}/errors.go`,
    `
package ${name}

import "errors"

var Err${PascalName}NotFound = errors.New("${name} not found")
`.trimStart(),
)

// repo/db directory and implementation
await mkdir(`domains/${name}/repo/db`)
await writeFile(
    `domains/${name}/repo/db/${name}.go`,
    `
package impl

import (
    "context"
    "errors"
    "fmt"
    "time"

    "${modName}/common"
    domain "${modName}/domains/${name}"
    "${modName}/domains/${name}/models"
    "${modName}/domains/${name}/tables"
    "${modName}/domains/${name}/types"
    "${modName}/server/db"
    "gorm.io/gorm"
    "gorm.io/gorm/clause"
)

type ${PascalName}Repo struct{}

func (r *${PascalName}Repo) Get(ctx context.Context, id uint) (*models.${PascalName}, error) {
    conn, err := db.Default()
    if err != nil {
        return nil, db.ConnError(err)
    }

    ${camelName}, err := gorm.G[models.${PascalName}](conn).Where(tables.${PascalName}.ID.Eq(id)).First(ctx)
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, domain.Err${PascalName}NotFound
    } else if err != nil {
        return nil, fmt.Errorf("failed to find ${name}: %w", err)
    }

    return &${camelName}, nil
}

func (r *${PascalName}Repo) List(ctx context.Context, query *types.${PascalName}ListQuery) (*common.PaginatedResult[models.${PascalName}], error) {
    conn, err := db.Default()
    if err != nil {
        return nil, db.ConnError(err)
    }

    q := gorm.G[models.${PascalName}](conn).Where("1 = 1")

    // Add your query filters here

    // Count total before applying pagination
	total, err := q.Count(ctx, "*")
	if err != nil {
		return nil, fmt.Errorf("failed to count ${name}s: %w", err)
	}

    q = q.Order(tables.${PascalName}.CreatedAt.Desc())
	q = q.Limit(query.PageSize)
	q = q.Offset(query.PageSize * (query.Page - 1))

    ${camelPluralName}, err := q.Find(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get ${name} list: %w", err)
	} else if len(${camelPluralName}) == 0 {
		return &common.PaginatedResult[models.${PascalName}]{Total: 0, List: []models.${PascalName}{}}, nil
	}

	return &common.PaginatedResult[models.${PascalName}]{Total: int(total), List: ${camelPluralName}}, nil
}

func (r *${PascalName}Repo) Create(ctx context.Context, data *types.${PascalName}Create) (*models.${PascalName}, error) {
    conn, err := db.Default()
    if err != nil {
        return nil, db.ConnError(err)
    }

    now := time.Now()
    ${camelName} := &models.${PascalName}{
        CreatedAt: now,
        UpdatedAt: now,
        // Map fields from data
    }

    if err := gorm.G[models.${PascalName}](conn).Create(ctx, ${camelName}); err != nil {
		return nil, fmt.Errorf("failed to create ${name}: %w", err)
	}

    return ${camelName}, nil
}

func (r *${PascalName}Repo) Update(ctx context.Context, id uint, data *types.${PascalName}Update) (*models.${PascalName}, error) {
    ${camelName}, err := r.Get(ctx, id)
    if err != nil {
        return nil, err
    }

    var updates []clause.Assigner

    // Append updates based on non-nil fields in data

    if len(updates) == 0 {
        return ${camelName}, nil // No updates needed
    }

    updates = append(updates, tables.${PascalName}.UpdatedAt.Set(time.Now()))

    conn, err := db.Default()
    if err != nil {
        return nil, db.ConnError(err)
    }

    rowsAffected, err := gorm.G[models.${PascalName}](conn).Where(tables.${PascalName}.ID.Eq(id)).Set(updates...).Update(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to update ${name}: %w", err)
	} else if rowsAffected == 0 {
		return nil, domain.Err${PascalName}NotFound
	}

    return r.Get(ctx, id)
}

func (r *${PascalName}Repo) Delete(ctx context.Context, id uint) error {
    conn, err := db.Default()
    if err != nil {
        return db.ConnError(err)
    }

    rowsAffected, err := gorm.G[models.${PascalName}](conn).Where(tables.${PascalName}.ID.Eq(id)).Delete(ctx)
	if err != nil {
		return fmt.Errorf("failed to delete ${name}: %w", err)
	} else if rowsAffected == 0 {
		return domain.Err${PascalName}NotFound
	}

    return nil
}
`.trimStart(),
)

// Tables in Go
{
    const { code, stderr, stdout } = await run("tsx", [
        "cmd/orm-gen.ts",
        `domains/${name}/models`,
    ])
    if (code) {
        console.error(stderr)
    } else {
        console.log(stdout)
    }
}

// Update server/main/main.go to import the new domain API
await updateGoMainImports(name)

// Update package.json to add new domain paths to go2ts watch
await updateGo2TsWatchPaths(name)

// Update package.json to add new domain paths to orm-gen watch
await updateOrmGenWatchPaths(name)

console.log(`
✅ Domain "${name}" has been successfully created!

📁 Generated structure:
   domains/${name}/
   ├── api/${name}.go (Go API handlers)
   ├── api/${name}.ts (TypeScript API client)
   ├── models/${name}.go (data models in Go)
   ├── models/index.ts (data models in TypeScript)
   ├── repo/${name}.go (repository interface)
   ├── repo/db/${name}.go (database implementation)
   ├── service/${name}.go (business logic)
   ├── tables/${name}.go (GORM query helpers)
   ├── types/${name}.go (DTOs in Go)
   ├── types/index.ts (DTOs in TypeScript)
   ├── views/ (React views - empty)
   └── errors.go (domain errors)

📝 Next steps:
   1. Add fields to models/${name}.go
   2. Run \`npm run gen:ts domains/${name}/models\` to generate TypeScript models
   3. Run \`npm run gen:orm domains/${name}/models\` to generate table helpers
   4. Update types/${name}.go with DTO fields
   5. Run \`npm run gen:ts domains/${name}/types\` to generate TypeScript DTO types
   6. Refine repository methods in repo/db/${name}.go
   7. Refine service methods in service/${name}.go
   8. Create React views in views/
`)
