# Repository Guidelines

## Project Structure & Module Organization
- Yarn-based monorepo with core apps in `apps/`: `web` (Next.js), `mobile-queue` (Expo), `nest` (NestJS API), `langchain` (LangGraph tools), and `mastra` (Mastra workflows).
- Shared code lives in `packages/`; app-specific utilities stay near their consumers (for example, `apps/web/lib`, `apps/mobile-queue/components`).
- Documentation resides in `docs/`. Follow each framework's testing layout: Nest unit specs under `apps/nest/src/**`, e2e in `apps/nest/test`; LangChain tests inside `apps/langchain/src/**/tests` with `.test.ts` or `.int.test.ts` suffixes.

## Build, Test, and Development Commands
- `yarn workspace @tkhwang-pico/web dev|build|start|lint` — run, build, serve, or lint the Next.js web app.
- `yarn workspace @tkhwang-pico/mobile-queue dev|ios|android|web` — launch Expo targets for the mobile queue experience.
- `cd apps/nest && yarn start:dev|build|test` — develop, compile, or test the Nest API.
- `yarn workspace @tkhwang-pico/langchain dev|build|test|test:int|lint|format` — develop agents, build bundles, or execute unit/integration checks.
- `yarn workspace @tkhwang-pico/mastra dev|build|start` — control Mastra workflow runtimes.

## Coding Style & Naming Conventions
- TypeScript/TSX everywhere with 2-space indentation; rely on the repo ESLint + Prettier config (includes Tailwind plugins for web/mobile).
- Use kebab case for directories and packages, PascalCase for React components, and contextual utility names scoped to their app.
- Co-locate styles and hooks with their feature unless shared across apps.

## Testing Guidelines
- Jest powers Nest and LangChain suites; add deterministic unit tests and targeted integration coverage for new work.
- Name LangChain tests with `.test.ts` (unit) or `.int.test.ts` (integration); keep fixtures alongside specs.
- Run `yarn test` inside `apps/nest` and `yarn workspace @tkhwang-pico/langchain test|test:int` before pushing.

## Commit & Pull Request Guidelines
- Commit messages follow `emoji type(scope): summary`, e.g., `✨ feat(mobile/queue): add Content component`.
- PRs should detail motivation, manual/automated verification steps, attach UI screenshots when relevant, and link associated issues.

## Security & Configuration Tips
- Mirror `.env.example` locally for secrets; load values through runtime injection tools instead of hardcoding.
- Confirm Node 18+ for LangChain and Node 20+ for Mastra along with Yarn Plug'n'Play support.
- Validate Clerk, Supabase, and Mastra Cloud credentials before deployment.
