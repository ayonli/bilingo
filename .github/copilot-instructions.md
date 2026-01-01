# TypeScript/JavaScript Coding Instructions

## Variables

- Use descriptive variable names that clearly indicate their purpose, but keep
  the name short
- Don't declare multiple variables on the same line, always declare each variable
  on a new line
- Use `const` and `let` when possible and prefer const, never use `var`
- Prefix the element name with `_` when destructuring unused tuple elements
  instead of leaving a blank slot
- Use `_0`, `_1`, etc. for unused prefixes in array destructuring when multiple
  consecutive elements are unused, e.g., `const [first, _1, _2, fourth] = myArray;`
- When using Drizzle ORM, define table fields with snake_case to match database
  naming conventions

## Functions

- Use `function` keyword to declare top-level function, avoid arrow functions
- Functions should have explicit return types except for those that can be easily inferred
  and are defined and used in another function
- Functions should not have more than 4 parameters, consider using an options
  object if more are needed
- Unused parameters should be prefixed with `_` to indicate intentional omission
  but still keep the parameter for function signature compatibility
- Function signatures should not take object literal types, always declare proper
  interfaces or types for object parameters, and export them if the function is
  exported; these type declarations should be colocated with the function

## Types

- Prefer using `interface` for object shapes, use `type` for unions, intersections,
  and utility types
- Avoid using `any` type, prefer more specific types or `unknown` if necessary
- Use type assertions (`as`) sparingly, only when you have more type information
  than TypeScript
- Use `satisfies` operator to validate types while preserving literal types
- Prefer type guards and narrowing over type assertions
- Prefer type inference over explicit types when obvious, but not for functions
  and module exports
- Prefer using generic types for function parameters instead of super-classes or
  interfaces, the generic type should have bound constraints when necessary
- Prefer using **zod** to define DTOs and infer types from zod schemas, the
  schema should share the same name as the inferred type and should be capitalized;
  the name shall not have suffixes like `Schema`, `Model`, `Type` or `Dto`, just
  a pure type name, e.g., `User`, `CreateUserData`, etc.
- Define extended error classes instead of using plain `Error` for better error
  handling and identification

## Modules

- Exported module members should have explicit types
- Prefer static imports, only use dynamic imports to load modules conditionally
  or avoid circular dependencies
- Prefer named exports over default exports
- Use `import type` for type-only imports
- Add `.ts` extension (or `.js` for JS files) for importing relative modules
- Always `import process from "node:process"` when using the `process` global,
  the same applies to other Node.js built-in globals
- Try to group imports by built-in modules, external modules, internal modules,
  and relative modules, with a blank line in between and order them
  alphabetically in each group

## Control Flows

- Prefer adding curly braces for switch cases
- Prefer using early returns to reduce nesting and indentation
- Prefer using ternary operator for simple conditional assignments
- Prefer using a IIFE (Immediately Invoked Function Expression) for initializing
  variables that require complex logic and still use `const`
- `Promise`s must be `await`ed or `.catch`ed to prevent unhandled rejections
- Use `.catch` for promises that could provide fallback values
- Use `.then` for promises to transform values when chaining is more readable
  and prevent temporary variables
- Don't rethrow errors without wrapping or logging them or have some sort of
  handling logic
- When rethrowing errors, wrap them both in the `message` and the `cause` property
  to preserve the original error context
- Don't throw or return in `finally` blocks
- Use `AbortSignal` to handle cancellations when possible, design APIs to accept
  `AbortSignal` when applicable
- Check exhaustiveness in switch and conditional statements when possible

## Safety

- Avoid using deprecated or discouraged language features, APIs or libraries
- Prefer using `Array.prototype.at` for safe array element access, only use
  direct indexing when the length is checked beforehand
- Prefer regular expression literals over `new RegExp` for both safety, simplicity
  and performance
- Prefer using optional chaining and nullish coalescing operators for safer property
  access and default values
- React component props should be wrapped with `Readonly` to prevent accidental
  mutations
- Use `strict` mode in TypeScript configuration
- Always try to write safe and secure code, learn and practice secure coding
  from Rust and other memory-safe languages

## Simplicity

- Naming conventions:
  - PascalCase for types
  - camelCase for functions, except for React components which should be PascalCase
  - camelCase for variables, except for Drizzle ORM table fields which should be
    snake_case, and keep snake_case if those fields are destructured from
    database rows
  - UPPER_SNAKE_CASE for constant values, IMPORTANT: constant value, not just any
    `const` variables
  - kebab-case for file names, except for React component files which should be
    PascalCase to match the exported component name
- Try to use shorter identifier names, but still meaningful and descriptive
- Don't write too many comments, let the code speak for itself, only add comments
  for complex logic, important decisions, and public APIs

## Abstraction

- Extract repeated code into reusable functions or modules when possible
- Avoid over-engineering and premature abstractions, keep things simple and
  straightforward
- Prefer composition over inheritance, favor higher-order functions and
  dependency injection over class hierarchies
- Prefer small and focused functions and modules over large monolithic ones,
  consider breaking down large functions into smaller and testable helpers, but
  avoid over-modularization and keep related logic together, also keep helper
  functions close to their callers
- Avoid deep nesting of functions and modules, keep the structure flat and
  modular
- Construct modules with top level stateless functions, avoid classes, especially
  singletons when possible
- Construct business logic like we're writing libraries, try to avoid framework
  or environment lock-in

## Modernization

- Prefer using built-in methods and language features over external libraries
- Prefer using modern ECMAScript standards and features, avoid host-specific APIs
  when possible
- Prefer using `Uint8Array` over Node.js `Buffer` for binary data
- If targeting Node.js v22+ or Deno, prefer iterator helper methods over array
  counterparts (e.g., `map`, `filter`, `reduce`, etc.)

## Workflow

- Ask for clarification when requirements are ambiguous or incomplete
- Write unit tests for critical and complex logic, but first try to break down
  complex logic into smaller, testable functions
- Use `Deno.test` for simple tests if `deno` is available, otherwise use `node:test`;
  use `vitest` for React components and browser-related tests
- Follow the existing code style and conventions in the project, however override
  them with these instructions if existing code doesn't follow them
- Gradually refactor and modernize legacy code when touching them for other
  changes
- Look for scripts or commands to format, lint and type-check changed files after
  done editing, if not found, try these commands:
  - `deno lint --fix <file>`
  - `deno fmt <file>`
  - `tsc --noEmit`
- Extract rapidly used commands into `package.json` scripts for future reuse
- Write meaningful but brief commit messages that describe the changes made
