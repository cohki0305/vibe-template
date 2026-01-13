# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # Start dev server (Turbopack)
pnpm build            # Production build
pnpm lint             # ESLint
pnpm format           # Prettier format
pnpm typecheck        # TypeScript check

# Testing
pnpm test             # Run all tests (uses Testcontainers for PostgreSQL)
pnpm test src/        # Run component tests only
pnpm test tests/      # Run integration tests only
pnpm test path/to/file.test.ts  # Run single test file

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema to database
docker compose up -d  # Start PostgreSQL (port 5437)
```

## Architecture

### Layer Structure

```
Actions → Services → Prisma
   ↓
 Views → Components
```

- **Actions** (`src/actions/`): Server Actions with Zod validation. Entry point for client.
- **Services** (`src/services/`): Business logic with dependency injection (receives PrismaClient).
- **Views** (`src/views/`): Container components - data fetching, state, Server Action calls.
- **Components** (`src/components/`): Presentational components - props only, no side effects.

### Test Structure

- **Unit/Component tests**: Co-located with source (`src/**/*.test.{ts,tsx}`)
- **Integration tests**: `tests/integration/` - uses Testcontainers PostgreSQL

Vitest projects:
- `components`: jsdom environment for React components
- `integration`: node environment for database tests

### Database

Prisma with PostgreSQL adapter (`@prisma/adapter-pg`). Generated client outputs to `src/generated/prisma/`.

## Key Patterns

### Server Actions

**Zodバリデーションは必ずServer Actionで行う**（サービス層ではなく）。

```typescript
// src/actions/*.ts
'use server'

const createUserSchema = z.object({
  email: z.string().min(1).email(),
  name: z.string().max(100),
})

export async function createUserAction(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  // 1. Zod validation (Server Actionの責務)
  const result = schema.safeParse(rawData)
  if (!result.success) return { success: false, fieldErrors: ... }

  // 2. Call service (バリデーション済みデータを渡す)
  await userService.create(result.data)

  // 3. Return { success: true } or { success: false, error }
}
```

### Services (DI Pattern)

```typescript
// src/services/*.ts
export function createUserService(prisma: PrismaClient) {
  return {
    async create(input: CreateUserInput): Promise<User> { ... }
  }
}
```

## Constitution

See `.specify/memory/constitution.md` for coding standards:
- TDD required (Red-Green-Refactor)
- Presentational/Container component separation
- Server Components by default, `'use client'` only when needed
- Zod validation in Server Actions (not in services)
