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

## Code Conventions

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
import { Button } from "~/components/ui/button";
```

### Environment Variables

Prefix with `VITE_` for client-side access:

```tsx
import.meta.env.DEV; // true in development
import.meta.env.PROD; // true in production
import.meta.env.VITE_POSTHOG_KEY;
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
