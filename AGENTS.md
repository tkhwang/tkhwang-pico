# Repository Guidelines

## Project Structure & Module Organization

- Monorepo managed by Yarn workspaces (`package.json`).
- Apps live in `apps/`:
  - `apps/web` (Next.js), `apps/mobile-queue` (Expo), `apps/nest` (NestJS), `apps/langchain` (LangChain/LangGraph), `apps/mastra` (Mastra).
- App-specific libs/configs are colocated (e.g., `apps/web/lib`, `apps/mobile-queue/components`).
- Tests:
  - Nest: unit in `apps/nest/src` (`*.spec.ts`), e2e in `apps/nest/test`.
  - LangChain: unit in `apps/langchain/src/**/tests` (`*.test.ts`), integration as `*.int.test.ts`.

## Build, Test, and Development Commands

Use Yarn. Run per workspace or `cd` into the app.

- Web (Next.js): `yarn workspace @tkhwang-pico/web dev|build|start|lint`
- Mobile (Expo): `yarn workspace @tkhwang-pico/mobile-queue dev|ios|android|web`
- Nest (API): `cd apps/nest && yarn start:dev` | `yarn build` | `yarn test`
- LangChain: `yarn workspace @tkhwang-pico/langchain dev|build|test|test:int|lint|format`
- Mastra: `yarn workspace @tkhwang-pico/mastra dev|build|start`
  Tip: prefix with `yarn` at repo root; avoid `npm`.

## Coding Style & Naming Conventions

- Language: TypeScript (TS/TSX). Indentation: 2 spaces.
- Lint/Format: ESLint + Prettier (Next/Nest configs included). Tailwind CSS in Web and Mobile with `prettier-plugin-tailwindcss`.
- Naming: kebab-case for folders/packages, PascalCase for React components, tests as `*.spec.ts` or `*.test.ts`.

## Testing Guidelines

- Framework: Jest (Nest, LangChain). Keep tests close to code.
- Run: `cd apps/nest && yarn test` or `yarn workspace @tkhwang-pico/langchain test`.
- Coverage: focus on core logic (agents, tools, controllers). Prefer small, deterministic unit tests; use `*.int.test.ts` for integration.

## Commit & Pull Request Guidelines

- Commit format: emoji + type(scope). Example: `✨ feat(mobile/queue): add Content component`.
- Types: `feat|fix|refactor|chore|docs|style` with concise, imperative summaries.
- PRs: include description, steps to run, screenshots (for UI), and linked issues. Keep changes scoped per app.

## Security & Configuration

- Env: copy examples (e.g., `apps/web/.env.example`) and keep secrets out of VCS.
- Node engines: LangChain ≥ Node 18; Mastra ≥ Node 20.
- Services: Web uses Clerk + Supabase; Mastra may target Mastra Cloud. Ensure keys are set before local runs.
