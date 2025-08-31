# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed by Yarn workspaces (`package.json`).
- Apps live in `apps/`:
  - `apps/web` (Next.js), `apps/mobile-queue` (Expo), `apps/nest` (NestJS), `apps/langchain` (LangChain/LangGraph), `apps/mastra` (Mastra).
- Shared assets/configs are colocated within each app (e.g., `apps/web/lib`, `apps/mobile-queue/components`).

## Build, Test, and Development Commands
- Use Yarn. Run per-workspace via `yarn workspace <name> <script>` or `cd` into the app.
- Web (Next.js): `yarn workspace @tkhwang-pico/web dev|build|start|lint`
- Mobile (Expo): `yarn workspace @tkhwang-pico/mobile-queue dev|ios|android|web`
- Nest (API): `cd apps/nest && yarn start:dev | yarn build | yarn test`
- LangChain: `yarn workspace @tkhwang-pico/langchain dev|build|test|test:int|lint|format`
- Mastra: `yarn workspace @tkhwang-pico/mastra dev|build|start`

## Coding Style & Naming Conventions
- Language: TypeScript (TS/TSX). Indentation: 2 spaces.
- Lint/Format: ESLint + Prettier across apps; Next.js and Nest configs already included.
- Styling: Tailwind in `apps/web` and `apps/mobile-queue` (with `prettier-plugin-tailwindcss`).
- Naming: kebab-case for folders and packages; PascalCase for React components; `*.spec.ts`/`*.test.ts` for unit tests.

## Testing Guidelines
- Nest: Jest unit tests in `apps/nest/src` (`*.spec.ts`), e2e in `apps/nest/test`.
- LangChain: Jest unit tests in `apps/langchain/src/**/tests` (`.test.ts`), integration tests use `.int.test.ts`.
- Run: `yarn workspace @tkhwang-pico/langchain test` or `cd apps/nest && yarn test`.
- Aim for meaningful coverage on core logic (agents, tools, controllers). Add tests beside code.

## Commit & Pull Request Guidelines
- Commit style follows emoji + type(scope): e.g., `✨ feat(mobile/queue): add Content component`.
- Prefer: `feat|fix|refactor|chore|docs|style` with concise, imperative summaries.
- PRs: include description, steps to run, screenshots (UI), and linked issues. Keep changes scoped per app.

## Security & Configuration
- Environment: copy and adapt examples (e.g., `apps/web/.env.example`). Keep secrets out of VCS.
- Node: match engines where specified (LangChain ≥ Node 18, Mastra ≥ Node 20).
- Services: Web uses Clerk + Supabase; Mastra may target Mastra Cloud; ensure keys are set before local runs.

