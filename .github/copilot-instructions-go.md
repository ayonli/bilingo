# Golang Coding Instructions

## Variables

- Use descriptive variable names that clearly indicate their purpose, but keep
  the name short
- Don't declare multiple variables on the same line, even if they have the same
  type, always declare each variable on its own line with its own type

## Functions

- Functions should not have more than 4 parameters, consider declaring an option
  type if more are needed
- Unused parameters should be prefixed with `_` to indicate intentional omission
  but still keep the parameter for function signature compatibility
- Don't declare multiple parameters with the same type via short syntax, always
  declare each parameter with its own type
- Avoid named returns in most cases, only use them when it improves readability
  (e.g., functions returning multiple values of the same type)
- Functions should not have more than 3 returned values (include error), consider
  declaring a return type if more are needed

## Types

- Use `any` instead of `interface{}`
- Prefer using generic types for function parameters instead of interfaces,
  the generic type should have bound constraints when necessary
- Define custom errors for libraries and utility functions

## Libraries

- Use `github.com/samber/lo` library to work with slices, maps, strings,
  channels, and functions

## Control Flows

- Prefer using early returns to reduce nesting and indentation
- Use error wrapping in business logic to populate errors for better debugging
  experience, don't re-return errors without wrapping or logging them or have
  some sort of handling logic
- Use `context` wisely in functions that need to support cancel-safe operations
- Check exhaustiveness in switch and conditional statements when possible

## Safety

- Avoid using deprecated or discouraged language features, APIs or libraries
- Prefer using `lo.Nth` to safely retrieve element from slices, only use
  direct indexing when the size of the slice is checked beforehand
- Always check the second return value in **comma-ok idiom** syntax, such as
  type assertions and retrieving items from maps
- Always check the returned error of function calls
- Always use `defer` to clean up resources

## Simplicity

- Try to use shorter identifier names, but still meaningful and descriptive
- Don't write too many comments, let the code speak for itself, only add comments
  for complex logic, important decisions, and public APIs

## Concurrency

- Keep mutex locking duration as short as possible, use an IIFE function and
  `defer` to prevent the lock being held across IO operations
- Use channels to collect results from multiple Goroutines, don't use mutex
  and/or mutating outer scope variables

## Performance

- Preallocate slices and maps if the size the known beforehand
- Use `strings.Builder` for string concatenation, use `strings.Cut` instead of
  `strings.Split` if only two portions are needed
- Use buffered IO to reduce system calls when applicable
- Prefer `sync.RWMutex` over `sync.Mutex` if applicable, use atomic operations
  whenever possible

## Abstraction

- Extract repeated code into reusable functions or packages when possible
- Avoid over-engineering and premature abstractions, keep things simple and
  straightforward
- Prefer composition over _inheritance_, favor higher-order functions and
  dependency injection over type embedding
- Prefer small and focused functions and packages over large monolithic ones,
  consider breaking down large functions into smaller and testable helpers, but
  avoid over-modularization and keep related logic together, also keep helper
  functions close to their callers
- Avoid deep nesting of functions and packages, keep the structure flat and
  modular
- Construct packages with top level stateless functions, avoid structs,
  especially singletons when possible
- Construct business logic like we're writing libraries, try to avoid framework
  or environment lock-in

## Workflow

- Ask for clarification when requirements are ambiguous or incomplete
- Write unit tests for critical and complex logic, but first try to break down
  complex logic into smaller, testable functions
- Follow the existing code style and conventions in the project, however override
  them with these instructions if existing code doesn't follow them
- Gradually refactor and modernize legacy code when touching them for other
  changes
- Run `golangci-lint run` if the project contains a `.golangci.yml` or other
  format of configurations
- Run `go build -o /dev/null ./...` (macOS/Linux) or `go build -o NUL ./...`
  (Windows) when you're done coding to verify all packages compile successfully
  without generating binary files
