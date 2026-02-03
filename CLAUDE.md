# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Conta Justa is a fair expense division calculator for couples that considers income and housework. Built with TanStack Start (full-stack React framework) and Tailwind CSS v4.

## Commands

```bash
# Development
pnpm dev              # Start dev server on port 3000

# Testing
pnpm test:unit           # Single test run
pnpm test:unit:watch     # Run unit tests in watch mode
pnpm test:unit:coverage  # Run with coverage report
pnpm test:e2e            # Run Playwright E2E tests
pnpm test:e2e:ui         # E2E tests with UI
pnpm test:e2e:headed     # E2E tests in headed mode

# Code quality
pnpm lint             # Run Biome (lint + format with auto-fix)
pnpm typecheck        # TypeScript type checking

# Build
pnpm build            # Production build
pnpm preview          # Preview production build

# Route generation
pnpm tsr generate     # Regenerate src/routeTree.gen.ts after adding/removing routes
```

### Tooling

- **Package manager**: pnpm 10 (enforced via `packageManager` field, exact version pinning via `.npmrc`)
- **Node**: v25 (pinned in `.node-version`)
- **Biome**: Enforces `useSortedClasses` for className attributes (supports `cn`, `clsx`, `cva` functions)

## Architecture

### Tech Stack

- **Framework**: TanStack Start + TanStack Router (file-based routing)
- **Styling**: Tailwind CSS v4 (CSS-based config with `@theme` directive)
- **State**: Zustand (sessionStorage persistence) + nuqs (URL search params)
- **Forms**: TanStack Form + Zod validation
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Linting**: Biome (replaces ESLint + Prettier)
- **Icons**: lucide-react
- **Analytics**: PostHog

### Key Directories

- `src/routes/` - File-based routing (TanStack Router auto-generates `routeTree.gen.ts`)
- `src/stores/` - Zustand stores with sessionStorage persistence
- `src/lib/` - Calculation engine and utility functions
- `src/schemas/` - Zod validation schemas (form data, env vars)
- `src/hooks/` - Custom hooks (form submission, results computation, analytics)
- `src/server/` - Server functions (`createServerFn`)
- `src/providers/` - React context providers (Theme, PostHog)
- `src/components/` - Reusable components (`ui/` for atoms, `layout/` for structure, `app/` for features)
- `docs/` - Documentation, research, and design references
- `.specs/` - Feature specifications (spec-driven development workflow)

### Data Flow

```
Form (/) -> Zustand store (sessionStorage) -> Results page (/results)
                                                 |
                                           useResults() hook
                                           computes all calculations
```

The form saves data to the Zustand store, which persists to `sessionStorage`. The results page reads from the store and computes calculations via `useResults()`. If no data exists in store, `/results` redirects to `/`.

The minimum wage is fetched server-side via `createServerFn` (from Brazil's Central Bank API with env var fallback) and stored in the Zustand store on first load.

### Monetary Values (Centavos)

**All monetary values are stored and calculated in centavos (integer cents).** This avoids floating-point precision issues.

- Form currency inputs display reais but store centavos: `onValueChange` returns cents
- Display converts back: `formatCurrency(value / 100)` with BRL locale
- Minimum wage from server is in reais, converted on store: `setMinimumWage(loaderWage * 100)`
- Brazilian formatting: thousands separator `.`, decimal separator `,`

### Calculation Engine

Two base division methods in `src/lib/calculations.ts`:

- **Proportional** (`calculateProportional`): divides expenses by income ratio
- **Equal** (`calculateEqual`): 50/50 split regardless of income

**Transform Pattern** for adjustments:
- `applyHouseworkAdjustment(baseResult, houseworkData, hourlyRate)`: transforms a proportional result by adding housework monetary value to income and recalculating contributions. Uses `minimumWage / 220` hourly rate, multiplied by weekly hours * 4 weeks

This separation allows for extensibility - other adjustments (e.g., dependents, transport) can be added as additional transformers.

Edge case: when both incomes are zero, all methods fall back to 50/50.

### Zustand Store Pattern

The store (`src/stores/expense-store.ts`) uses `persist` middleware with `sessionStorage`. It exports individual selector hooks (not the raw store):

```tsx
// USE selector hooks
const data = useData();
const setData = useSetData();

// NOT raw store access
const store = useExpenseStore();
```

Only `data` and `minimumWage` persist. Computed state (`selectedMethod`, `includeHousework`) resets on reload.

### Toast System

Custom toast notifications in `src/lib/toast.ts` using a singleton `ToastState` class with observer pattern. Usage:

```tsx
import { toast } from '~/lib/toast'

toast.success('Link copiado!')
toast.error('Erro ao compartilhar')
toast.info('Mensagem informativa')
```

Default durations: success 3s, error/info 5s. The `<Toaster />` component is rendered in root layout.

### Provider Stack

Root layout wraps routes with providers in this order:

```
ThemeProvider -> PostHogProvider -> NuqsAdapter -> Outlet -> Toaster
```

- **ThemeProvider**: localStorage-based dark/light/system theme with anti-FOUC inline script
- **PostHogProvider**: initializes only in production when API key exists

### Routing Pattern

Routes use `createFileRoute()` with optional `loader` for SSR data and `head()` for meta tags:

```tsx
export const Route = createFileRoute("/")({
  loader: async () => ({ minimumWage: await getMinimumWage() }),
  head: () => ({ meta: [{ title: "Conta Justa" }] }),
  component: HomePage,
});
```

CSS is imported in root with `?url` suffix: `import appCss from "../styles.css?url"`

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
className = "z-100 max-w-300 backdrop-blur-md rounded-sm shadow-sm";

// v3 arbitrary - AVOID
className = "z-[100] max-w-[1200px] backdrop-blur-[12px] rounded shadow";
```

#### Spacing Scale

The spacing scale uses `number * 4px`:

| Class       | Value    | Pixels |
| ----------- | -------- | ------ |
| `w-1`       | 0.25rem  | 4px    |
| `w-4`       | 1rem     | 16px   |
| `w-64`      | 16rem    | 256px  |
| `w-300`     | 75rem    | 1200px |
| `max-w-275` | 68.75rem | 1100px |

#### Renamed Utilities (v3 -> v4)

| v3 (old)       | v4 (new)          |
| -------------- | ----------------- |
| `rounded`      | `rounded-sm`      |
| `shadow`       | `shadow-sm`       |
| `blur`         | `blur-sm`         |
| `ring`         | `ring-sm`         |
| `inset-shadow` | `inset-shadow-sm` |

#### CSS Variables Syntax

```tsx
// v4 syntax - USE THIS
className = "w-(--my-width) text-(--my-color)";

// v3 syntax - AVOID
className = "w-[var(--my-width)] text-[var(--my-color)]";
```

#### When to Use Arbitrary Values

Only use `[value]` when no canonical class exists:

```tsx
// OK - no canonical class for 22px
className = "text-[22px]";

// BAD - use canonical z-100 instead
className = "z-[100]";
```

## React 19 Best Practices

**IMPORTANT**: This project uses React 19. Follow these patterns:

### Refs as Props (No forwardRef)

Pass `ref` as a regular prop using `ComponentProps<"element">`:

```tsx
function Button({ ref, children, ...props }: ComponentProps<"button">) {
  return (
    <button ref={ref} {...props}>
      {children}
    </button>
  );
}
```

### Server Functions

Use `createServerFn` for server-side logic (see `src/server/` for examples):

```tsx
import { createServerFn } from "@tanstack/react-start";

const fetchData = createServerFn()
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const secret = process.env.API_SECRET; // safe here
    return result;
  });
```

## Code Conventions

### Never Assume

Never assume any class, variable, pattern, or convention exists. Always check `styles.css`, existing components, and the codebase before using any CSS class, utility, or pattern. Verify first, then use.

This project does NOT use shadcn/ui. Components are custom, inspired by shadcn/ui patterns but with different implementations and CSS variables.

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
- **Barrel files**: Allowed with named exports only (`export { X } from './x'`), no `export * from`
- **No forEach**: Use `for...of` loops
- **Semicolons**: As needed (omit when possible)
- **Quotes**: Single quotes for JS, double for JSX
- **Line width**: 120 characters

### Path Alias

Use `~/*` for imports from `src/`:

```tsx
import { Button } from "~/components/ui/button";
```

### Environment Variables

- **Server-only**: Use `process.env.SECRET` inside `createServerFn`
- **Client-side**: Prefix with `VITE_` for browser access
- Server env vars validated with Zod in `src/schemas/env.ts`

Key variables (see `.env.example`):

- `VITE_APP_NAME`, `VITE_SITE_URL` - App identity and OG image generation
- `VITE_PUBLIC_POSTHOG_KEY`, `VITE_PUBLIC_POSTHOG_HOST` - Analytics (client)
- `MINIMUM_WAGE` - Fallback value in reais (server-only)

## Testing

### Unit Tests (Vitest)

Place tests next to source files as `*.test.ts` or `*.spec.ts`. Vitest globals are enabled (`describe`, `it`, `expect` available without import). Setup file at `src/test/setup.ts` configures `@testing-library/jest-dom`.

### E2E Tests (Playwright)

Located in `tests/e2e/`. Runs against Desktop Chrome and Mobile (Pixel 5). Use semantic locators: `page.getByRole()`, `page.getByText()`, `page.locator()`.

### Testing Monetary Values

Always use centavos in test assertions. Include calculation comments for clarity:

```tsx
// R$1621.00 = 162100 cents / 220 hours = 737 cents/hour
expect(calculateHourlyRate(162100)).toBe(737);
```

## Feature Development

This project uses spec-driven development. Features are tracked in `.specs/`:

- `spec.md` - Requirements and acceptance criteria
- `plan.md` - Technical implementation plan
- `tasks.md` - Task breakdown

Design references are in `docs/foundation/`:

- `design.json` - Design tokens
- `index.html` - Visual reference (dark mode)
- `copy-*.yaml` - Content/copy guidelines
