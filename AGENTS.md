# Repository Guidelines

This guide ensures consistent contributions across the Yarn-based monorepo.

**IMPORTANT:** Get my approval before implementing it.

## AI Reference Responses

**IMPORTANT:** Always respond in Korean

## Project Structure & Module Organization

The `apps/` directory hosts product surfaces: `web` (Next.js UI), `mobile-queue` (Expo client), `nest` (NestJS API), `langchain` (LangGraph tooling), and `mastra` (workflow runtimes). Shared utilities reside in `packages/` while feature-specific helpers stay near consumers (`apps/web/lib`, `apps/mobile-queue/components`). Documentation lives in `docs/`. Keep Nest unit specs under `apps/nest/src/**`, e2e specs in `apps/nest/test`, and LangChain specs within `apps/langchain/src/**/tests` using `.test.ts` or `.int.test.ts`.

## Build, Test, and Development Commands

Use workspace scripts through Yarn Plug'n'Play:

- `yarn workspace @tkhwang-pico/web dev|build|start|lint` — run, build, serve, or lint the web app.
- `yarn workspace @tkhwang-pico/mobile-queue dev|ios|android|web` — launch Expo in chosen target.
- `cd apps/nest && yarn start:dev|build|test` — develop or validate the Nest API.
- `yarn workspace @tkhwang-pico/langchain dev|build|test|test:int|lint|format` — iterate on agents and enforce quality.
- `yarn workspace @tkhwang-pico/mastra dev|build|start` — manage Mastra workflows.

## Coding Style & Naming Conventions

TypeScript/TSX with 2-space indentation is mandatory. Rely on the shared ESLint and Prettier configs (Tailwind plugins enabled) and avoid manual overrides. Name directories and packages in kebab case, React components in PascalCase, and colocate styles/hooks with their features unless shared.

## Testing Guidelines

Jest backs both Nest and LangChain suites. Keep unit tests deterministic and scoped; prefer targeted integration checks over broad e2e runs. Name LangChain unit specs `*.test.ts`, integration specs `*.int.test.ts`. Run `yarn test` inside `apps/nest` plus `yarn workspace @tkhwang-pico/langchain test` and `test:int` before submitting changes.

## Commit & Pull Request Guidelines

Follow `emoji type(scope): summary`, e.g., `✨ feat(mobile/queue): add Content component`. Pull requests must describe motivation, include manual or automated verification steps, add screenshots for UI changes, and link relevant issues. Note any configuration updates or migrations in the PR body.

## Security & Configuration Tips

Mirror `.env.example` locally and inject secrets via runtime tooling. Validate Node 18+ for LangChain, Node 20+ for Mastra, and ensure Yarn Plug'n'Play compatibility. Confirm Clerk, Supabase, and Mastra Cloud credentials in staging before promoting to production.
