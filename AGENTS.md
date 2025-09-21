# Repository Guidelines

Contributors work inside a Yarn-managed monorepo. Apps live under `apps/`, with Next.js in `apps/web`, Expo in `apps/mobile-queue`, NestJS in `apps/nest`, LangGraph tools in `apps/langchain`, and Mastra workflows in `apps/mastra`. App-specific utilities stay alongside each app (`apps/web/lib`, `apps/mobile-queue/components`). Nest unit tests sit beside sources in `apps/nest/src`, e2e specs in `apps/nest/test`, while LangChain tests live under `apps/langchain/src/**/tests` with `.test.ts` for unit and `.int.test.ts` for integration.

## Build, Test, and Development Commands
Run everything with Yarn. Typical flows:
- `yarn workspace @tkhwang-pico/web dev|build|start|lint` for the Next.js web app.
- `yarn workspace @tkhwang-pico/mobile-queue dev|ios|android|web` for Expo targets.
- `cd apps/nest && yarn start:dev` for API dev, `yarn build` for production bundles, `yarn test` for Jest suites.
- `yarn workspace @tkhwang-pico/langchain dev|build|test|test:int|lint|format` for agent pipelines.
- `yarn workspace @tkhwang-pico/mastra dev|build|start` for Mastra services.

## Coding Style & Naming Conventions
TypeScript/TSX across the repo with 2-space indentation. Follow ESLint + Prettier defaults (Tailwind plugin enabled for web/mobile). Use kebab-case for directories and packages, PascalCase for React components, and match existing naming for utilities. Keep tests named `*.spec.ts` or `*.test.ts` depending on framework guidance.

## Testing Guidelines
Jest powers both Nest and LangChain suites. Add focused, deterministic unit tests near the code under test; prefer integration coverage via `*.int.test.ts` when verifying cross-tool behavior. Execute `yarn test` from `apps/nest` or `yarn workspace @tkhwang-pico/langchain test` for unit passes, and `yarn workspace @tkhwang-pico/langchain test:int` for broader flows.

## Commit & Pull Request Guidelines
Commits follow `emoji type(scope): summary`, e.g. `✨ feat(mobile/queue): add Content component`. Keep scope App/area-specific and summaries imperative. PRs should explain motivation, list manual/automated test steps, attach UI screenshots when relevant, and link tracking issues.

## Security & Configuration Tips
Never commit secrets—copy from `.env.example` files and inject locally. Confirm Node ≥18 for LangChain workspaces and ≥20 for Mastra. Web integrations rely on Clerk and Supabase credentials; Mastra targets Mastra Cloud—ensure keys exist before running related commands.
