# MUX Control Panel - Agent Guidelines

## Commands

- **Build**: `yarn build`
- **Dev**: `yarn dev` (Next.js dev server on port 3000)
- **Test**: `yarn test` (Vitest), `yarn test:ui` (Vitest UI), `yarn test:coverage` (coverage)
- **E2E**: `yarn test:e2e` (Playwright), `yarn test:e2e:ui` (Playwright UI)
- **Single test**: `yarn test path/to/test.spec.ts` or `yarn test:e2e tests/specific.spec.ts`
- **Lint**: `yarn lint` (ESLint), `yarn lint:fix` (auto-fix)
- **Type check**: `yarn type-check` (TypeScript without emitting)
- **Format**: `yarn format` (Prettier)
- **Database**: `yarn db:migrate` (dev), `yarn db:generate`, `yarn db:studio`

## Architecture

- **Stack**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, Prisma + Neon Postgres
- **Auth**: Iron Session + Argon2 password hashing
- **State**: TanStack Query v5 for server state management
- **Video**: Mux SDK + Mux Player React
- **UI**: shadcn/ui + Radix UI components, strict TypeScript config
- **Structure**: App router (`app/`), components (`components/`), hooks (`hooks/`), lib utilities (`lib/`)
- **Database**: Prisma schema with Libraries, Assets, Upload Tokens, Usage tracking

## Code Style

- **Imports**: Use `@/` path mapping, import React components with named imports
- **Components**: Functional components with TypeScript interfaces, use `'use client'` for client components
- **Naming**: kebab-case files, PascalCase components, camelCase variables/functions
- **Types**: Strict TypeScript, exact optional properties, no unchecked indexed access
- **Styling**: Tailwind classes, responsive design, dark mode support
- **Error Handling**: Zod validation, proper error boundaries, consistent error responses
