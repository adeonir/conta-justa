# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Conta Justa is a fair expense division calculator for couples that considers income and housework. Built with TanStack Start (full-stack React framework) and Tailwind CSS v4.

## Commands

```bash
# Development
pnpm dev              # Start dev server on port 3000

# Testing
pnpm test             # Run unit tests in watch mode
pnpm test:run         # Single test run
pnpm test:coverage    # Run with coverage report
pnpm test:e2e         # Run Playwright E2E tests
pnpm test:e2e:ui      # E2E tests with UI
pnpm test:e2e:headed  # E2E tests in headed mode

# Code quality
pnpm lint             # Run Biome (lint + format with auto-fix)
pnpm typecheck        # TypeScript type checking

# Build
pnpm build            # Production build
pnpm preview          # Preview production build
```

## Architecture

### Tech Stack

- **Framework**: TanStack Start + TanStack Router (file-based routing)
- **Styling**: Tailwind CSS v4 (CSS-based config with `@theme` directive)
- **State**: nuqs for type-safe URL search params
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Linting**: Biome (replaces ESLint + Prettier)
- **Icons**: lucide-react
- **Analytics**: PostHog

### Key Directories

- `src/routes/` - File-based routing (TanStack Router auto-generates `routeTree.gen.ts`)
- `src/providers/` - React context providers
- `src/components/` - Reusable components (`ui/` for atoms, `layout/` for structure)
- `docs/` - Documentation, research, and design references
- `.specs/` - Feature specifications (spec-driven development workflow)

### Routing Pattern

Routes use `createFileRoute()` or `createRootRoute()`:

```tsx
// src/routes/example.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/example")({
  component: ExamplePage,
});

function ExamplePage() {
  return <div>Content</div>;
}
```

### Root Layout

`src/routes/__root.tsx` wraps all routes with providers. CSS is imported with `?url` suffix:

```tsx
import appCss from "../styles.css?url";
```

### Styling (Tailwind v4)

Configuration is in `src/styles.css` using `@theme` directive (no `tailwind.config.ts`):

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
@theme {
  --color-primary: var(--primary);
  /* ... */
}
```

### Tailwind v4 Best Practices

**IMPORTANT**: Always use Tailwind v4 syntax when writing code or generating plans/specs.

#### Canonical Classes (Prefer)

```tsx
// v4 canonical - USE THIS
className="z-100 max-w-300 backdrop-blur-md rounded-sm shadow-sm"

// v3 arbitrary - AVOID
className="z-[100] max-w-[1200px] backdrop-blur-[12px] rounded shadow"
```

#### Spacing Scale

The spacing scale uses `number * 4px`:

| Class | Value | Pixels |
|-------|-------|--------|
| `w-1` | 0.25rem | 4px |
| `w-4` | 1rem | 16px |
| `w-64` | 16rem | 256px |
| `w-300` | 75rem | 1200px |
| `max-w-275` | 68.75rem | 1100px |

#### Renamed Utilities (v3 -> v4)

| v3 (old) | v4 (new) |
|----------|----------|
| `rounded` | `rounded-sm` |
| `shadow` | `shadow-sm` |
| `blur` | `blur-sm` |
| `ring` | `ring-sm` |
| `inset-shadow` | `inset-shadow-sm` |

#### CSS Variables Syntax

```tsx
// v4 syntax - USE THIS
className="w-(--my-width) text-(--my-color)"

// v3 syntax - AVOID
className="w-[var(--my-width)] text-[var(--my-color)]"
```

#### When to Use Arbitrary Values

Only use `[value]` when no canonical class exists:

```tsx
// OK - no canonical class for 22px (closest: text-xl=20px, text-2xl=24px)
className="text-[22px]"

// OK - specific design value
className="tracking-[0.15em]"

// BAD - use canonical z-100 instead
className="z-[100]"

// BAD - use canonical max-w-300 instead
className="max-w-[1200px]"
```

#### Common Conversions

| Pixels | Canonical Class |
|--------|-----------------|
| 1200px | `w-300`, `max-w-300` |
| 1100px | `w-275`, `max-w-275` |
| 1024px | `w-256`, `max-w-256` |
| 768px | `w-192`, `max-w-192` |
| 12px blur | `backdrop-blur-md` |
| z-index 100 | `z-100` |

## React 19 Best Practices

**IMPORTANT**: This project uses React 19. Follow these patterns:

### Refs as Props (No forwardRef)

React 19 eliminates the need for `forwardRef`. Pass `ref` as a regular prop:

```tsx
// React 19 - USE THIS
function Button({ ref, children, ...props }: ComponentProps<'button'>) {
  return <button ref={ref} {...props}>{children}</button>
}

// React 18 (deprecated) - AVOID
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => (
    <button ref={ref} {...props}>{children}</button>
  )
)
```

### Form Actions with useActionState

Use `useActionState` for async form submissions:

```tsx
import { useActionState } from 'react'

function Form() {
  const [error, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const error = await updateData(formData.get('name'))
      if (error) return error
      return null
    },
    null
  )

  return (
    <form action={submitAction}>
      <input type="text" name="name" />
      <button type="submit" disabled={isPending}>Submit</button>
      {error && <p>{error}</p>}
    </form>
  )
}
```

### useFormStatus for Nested Components

Access parent form status without prop drilling:

```tsx
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button type="submit" disabled={pending}>Submit</button>
}
```

### useOptimistic for Optimistic Updates

```tsx
import { useOptimistic } from 'react'

function Component({ currentName, onUpdate }) {
  const [optimisticName, setOptimisticName] = useOptimistic(currentName)

  const submitAction = async (formData) => {
    const newName = formData.get('name')
    setOptimisticName(newName) // Immediate UI update
    const result = await updateName(newName)
    onUpdate(result)
  }

  return <form action={submitAction}>...</form>
}
```

## TanStack Start Best Practices

### Server Functions

Use `createServerFn` for server-side logic:

```tsx
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const fetchData = createServerFn()
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    // Server-only code - safe for secrets
    const response = await fetch(`${process.env.API_URL}/${data.id}`, {
      headers: { Authorization: `Bearer ${process.env.API_SECRET}` }
    })
    return response.json()
  })
```

### Server Routes

Define API endpoints in route files:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return new Response(JSON.stringify({ message: 'Hello' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
  }
})
```

## nuqs Best Practices

### Type-Safe Search Params with TanStack Router

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { createStandardSchemaV1, parseAsString, parseAsInteger, useQueryStates } from 'nuqs'

const searchParams = {
  query: parseAsString.withDefault(''),
  page: parseAsInteger.withDefault(1)
}

export const Route = createFileRoute('/search')({
  component: SearchPage,
  validateSearch: createStandardSchemaV1(searchParams, { partialOutput: true })
})

function SearchPage() {
  const [{ query, page }, setParams] = useQueryStates(searchParams)
  // ...
}
```

## Code Conventions

### Language

- **Code**: All in English (variable names, function names, comments, types)
- **User-facing text**: Portuguese with correct accents (labels, messages, UI copy)

```tsx
// CORRECT
const calculateContribution = (income: number) => { ... }
const errorMessage = 'Campo obrigatório'

// WRONG
const calcularContribuicao = (renda: number) => { ... }
const mensagemErro = 'Required field'
```

### Enforced by Biome

- **Filenames**: kebab-case only (enforced)
- **Imports**: Use `import type` for type-only imports
- **No barrel files**: Direct imports only
- **No forEach**: Use `for...of` loops
- **Semicolons**: As needed (omit when possible)
- **Quotes**: Single quotes for JS, double for JSX
- **Line width**: 120 characters

### Path Alias

Use `~/*` for imports from `src/`:

```tsx
import { Button } from '~/components/ui/button'
```

### Environment Variables

- **Server-only**: Use `process.env.SECRET` inside `createServerFn`
- **Client-side**: Prefix with `VITE_` for browser access

```tsx
// Server function - safe for secrets
createServerFn().handler(async () => {
  const secret = process.env.API_SECRET // OK
})

// Client code
import.meta.env.DEV // true in development
import.meta.env.PROD // true in production
import.meta.env.VITE_POSTHOG_KEY // Public key only
```

## Testing

### Unit Tests (Vitest)

Place tests next to source files as `*.test.tsx` or `*.spec.tsx`:

```tsx
// src/lib/calc.test.ts
import { describe, it, expect } from "vitest";
import { calculate } from "./calc";

describe("calculate", () => {
  it("should return correct value", () => {
    expect(calculate(100, 50)).toBe(150);
  });
});
```

### E2E Tests (Playwright)

Located in `tests/` directory.

## Feature Development

This project uses spec-driven development. Features are tracked in `.specs/`:

- `spec.md` - Requirements and acceptance criteria
- `plan.md` - Technical implementation plan
- `tasks.md` - Task breakdown

Design references are in `docs/foundation/`:

- `design.json` - Design tokens
- `index.html` - Visual reference (dark mode)
- `copy-*.yaml` - Content/copy guidelines
