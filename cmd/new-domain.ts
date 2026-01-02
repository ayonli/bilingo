import process from "node:process"
import { exists, mkdir, writeFile } from "@ayonli/jsext/fs"
import { dedent } from "@ayonli/jsext/string"
import { getGoModName } from "../utils/mod"
import pluralize from "pluralize"
import { run } from "@ayonli/jsext/cli"

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

const name = process.argv[2]
if (!name) {
    console.error("Please provide a domain name.")
    process.exit(1)
}

if (await exists("domains/" + name)) {
    console.error(`Domain "${name}" already exists.`)
    process.exit(1)
}

await mkdir("domains/" + name)
await mkdir("domains/" + name + "/api")
await mkdir("domains/" + name + "/models")
await mkdir("domains/" + name + "/repo")
await mkdir("domains/" + name + "/service")
await mkdir("domains/" + name + "/types")
await mkdir("domains/" + name + "/views")

const modName = await getGoModName()
const pluralName = pluralize(name)
const PascalName = toPascalCase(name)
const PascalPluralName = toPascalCase(pluralName)
const camelName = toCamelCase(name)
const camelPluralName = toCamelCase(pluralName)

// API in Go
await writeFile(
    `domains/${name}/api/${name}.go`,
    dedent`
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
`,
)

// API in TS
await writeFile(
    `domains/${name}/api/${name}.ts`,
    dedent`
import type { ApiResult, PaginatedResult } from "@/common"
import { ApiEntry } from "@/client"
import type { ${PascalName} } from "../models"
import type { ${PascalName}Create, ${PascalName}ListQuery, ${PascalName}Update } from "../types"

const ${camelName}Api = new ApiEntry("/${pluralName}")

export async function get${PascalName}(id: number): ApiResult<${PascalName}> {
    return await ${camelName}Api.get("/" + id)
}

export async function list${PascalPluralName}(
    query: Partial<${PascalName}ListQuery>,
): ApiResult<PaginatedResult<${PascalName}>> {
    return await ${camelName}Api.get("/", query)
}

export async function create${PascalName}(data: ${PascalName}Create): ApiResult<${PascalName}> {
    return await ${camelName}Api.post("/", null, data)
}

export async function update${PascalName}(id: number, data: ${PascalName}Update): ApiResult<${PascalName}> {
    return await ${camelName}Api.patch("/" + id, null, data)
}

export async function delete${PascalName}(id: number): ApiResult<null> {
    return await ${camelName}Api.delete("/" + id)
}
`,
)

// Models in Go
await writeFile(
    `domains/${name}/models/${name}.go`,
    dedent`
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
`,
)

// Models in TS
{
    const { code, stderr, stdout } = await run("deno", [
        "run",
        "-A",
        "go2ts.ts",
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
    dedent`
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
`,
)

// Service in Go
await writeFile(
    `domains/${name}/service/${name}.go`,
    dedent`
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
`,
)

// Types in Go
await writeFile(
    `domains/${name}/types/${name}.go`,
    dedent`
package types

import "${modName}/common"

//tygo:emit import type * as common from "../../../common"
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
`,
)

// Types in TS
{
    const { code, stderr, stdout } = await run("deno", [
        "run",
        "-A",
        "go2ts.ts",
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
    dedent`
package ${name}

import "errors"

var Err${PascalName}NotFound = errors.New("${name} not found")
`,
)

// repo/db directory and implementation
await mkdir(`domains/${name}/repo/db`)
await writeFile(
    `domains/${name}/repo/db/${name}.go`,
    dedent`
package db

import (
    "context"
    "errors"
    "fmt"

    "${modName}/common"
    domain "${modName}/domains/${name}"
    "${modName}/domains/${name}/models"
    "${modName}/domains/${name}/tables"
    "${modName}/domains/${name}/types"
    "${modName}/server"
    "gorm.io/gorm"
)

type ${PascalName}Repo struct{}

func (r *${PascalName}Repo) Get(ctx context.Context, id uint) (*models.${PascalName}, error) {
    conn, err := server.UseDefaultDb()
    if err != nil {
        return nil, fmt.Errorf("failed to connect database: %w", err)
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
    conn, err := server.UseDefaultDb()
    if err != nil {
        return nil, fmt.Errorf("failed to connect database: %w", err)
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
    conn, err := server.UseDefaultDb()
    if err != nil {
        return nil, fmt.Errorf("failed to connect database: %w", err)
    }

    ${camelName} := &models.${PascalName}{
        // Map fields from data
    }

    if err := gorm.G[models.${PascalName}](conn).Create(${camelName}).Error(ctx); err != nil {
        return nil, fmt.Errorf("failed to create ${name}: %w", err)
    }

    return ${camelName}, nil
}

func (r *${PascalName}Repo) Update(ctx context.Context, id uint, updates *types.${PascalName}Update) (*models.${PascalName}, error) {
    ${camelName}, err := r.Get(ctx, id)
    if err != nil {
        return nil, err
    }

    // Apply updates to ${camelName}
    // Example:
    // if updates.Field != nil {
    //     ${camelName}.Field = *updates.Field
    // }

    conn, err := server.UseDefaultDb()
    if err != nil {
        return nil, fmt.Errorf("failed to connect database: %w", err)
    }

    err = conn.Model(&models.${PascalName}{}).Where("id = ?", id).Updates(map[string]any{
        // Add your field mappings here
        // "field": ${camelName}.Field,
    }).Error
    if err != nil {
        return nil, fmt.Errorf("failed to update ${name}: %w", err)
    }

    return r.Get(ctx, id)
}

func (r *${PascalName}Repo) Delete(ctx context.Context, id uint) error {
    conn, err := server.UseDefaultDb()
    if err != nil {
        return fmt.Errorf("failed to connect database: %w", err)
    }

    rowsAffected, err := gorm.G[models.${PascalName}](conn).Where(tables.${PascalName}.ID.Eq(id)).Delete(ctx)
	if err != nil {
		return fmt.Errorf("failed to delete ${name}: %w", err)
	}

	if rowsAffected == 0 {
		return domain.Err${PascalName}NotFound
	}

    return nil
}
`,
)

// Tables in Go
{
    const { code, stderr, stdout } = await run("gorm", [
        "gen",
        "-i",
        `domains/${name}/models`,
        "-o",
        `domains/${name}/tables`,
    ])
    if (code) {
        console.error(stderr)
    } else {
        console.log(stdout)
    }
}

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
   2. Run \`deno run -A go2ts.ts domains/${name}/models\` to generate TypeScript models
   3. Update types/${name}.go with DTO fields
   4. Run \`deno run -A go2ts.ts domains/${name}/types\` to generate TypeScript DTO types
   5. Create React views in views/
`)
