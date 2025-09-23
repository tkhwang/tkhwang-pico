# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Essential Development Commands

### Monorepo Setup

- `yarn` - Install all dependencies (run from root)
- `yarn clean` - Clean all node_modules, build artifacts, caches, and TypeScript build info
- `yarn type-check` - Run TypeScript checks across all workspaces
- `yarn lint` - Run ESLint across all workspaces
- `yarn lint-staged` - Run lint-staged on staged files (used by pre-commit hooks)

### Starting Development Servers

```bash
# AI Agent Backend (start first)
cd apps/mastra && yarn dev          # Port 4000 - Mastra AI agents

# Web App
cd apps/web && yarn dev             # Port 3000 - Next.js with Turbopack

# Mobile App
cd apps/mobile-queue && yarn dev    # Expo development server
cd apps/mobile-queue && yarn ios    # iOS simulator
cd apps/mobile-queue && yarn android # Android emulator
cd apps/mobile-queue && yarn web    # Web version

# Other Services
cd apps/nest && yarn start:dev      # Nest.js backend
cd apps/langchain && yarn dev       # LangChain AI system
```

### Testing

```bash
# Nest.js
cd apps/nest && yarn test           # Unit tests
cd apps/nest && yarn test:e2e       # End-to-end tests

# LangChain
cd apps/langchain && yarn test      # Unit tests (*.test.ts)
cd apps/langchain && yarn test:int  # Integration tests (*.int.test.ts)
```

### Building

```bash
# Individual apps - note prebuild scripts
cd apps/web && yarn build           # Next.js production build (runs prebuild automatically)
cd apps/mastra && yarn build        # Mastra agent system (runs prebuild automatically)
cd apps/nest && yarn build          # NestJS backend (runs prebuild automatically)
cd apps/mobile-queue && yarn build:ios      # iOS production build
cd apps/mobile-queue && yarn build:android  # Android build

# Shared packages (auto-built via prebuild and postinstall hooks)
cd packages/supabase && yarn build  # Supabase client factory - required before apps
cd packages/supabase && yarn generate-types   # Generate TypeScript types from schema
```

## Architecture Overview

### AI-First Monorepo Structure

PICO (Personal Intelligent COpilot) is an AI playground built as a Yarn workspace monorepo with React 19 enforcement across all packages. The core intelligence layer uses Mastra agents with sophisticated routing capabilities.

### AI Agent System (Mastra)

**Central Intelligence**: `/apps/mastra/` contains the core AI routing system:

- **Routing Network**: Intelligent dispatcher that analyzes user intent and routes to specialized agents using OpenAI GPT-4o-mini
- **Specialized Agents**: Weather agent, fallback agent, and routing agent with multilingual support (Korean/English)
- **CopilotKit Integration**: Real-time AI chat through `/api/copilotkit` endpoint connecting web UI to Mastra agents
- **Vector Database**: LibSQL (`@mastra/libsql`) with in-memory storage for telemetry and evaluations
- **AG-UI Integration**: Advanced agent UI components via `@ag-ui` packages for enhanced agent interfaces

### Cross-Platform UI Strategy

**Dual UI Implementation**:

- **Mobile** (`apps/mobile-queue/components/ui/`): Built on `@rn-primitives` for React Native compatibility with `react-native-web` for web rendering
- **Web** (`apps/web/components/ui/`): Built on `@radix-ui` primitives for web-native accessibility
- **Shared Design System**: Both use shadcn/ui patterns with platform-specific implementations

### Authentication Architecture

**Unified Supabase Strategy with Platform-Specific Clients**:

- **Mobile**: Clerk Authentication with Supabase JWT integration for RLS via client factory
- **Web**: Direct Supabase authentication with SSR session management via client factory
- **Unified Client Factory**: `packages/supabase/src/clients/client-factory.ts` provides platform-aware Supabase clients
- **Platform Resolvers**: Automatic client selection based on environment (mobile/web/server)
- **Token Flow**: Clerk JWT synchronization through edge functions

## Key Development Patterns

### Workspace Commands

Use workspace-specific commands from root:

```bash
yarn workspace @tkhwang-pico/web dev
yarn workspace @tkhwang-pico/mobile-queue dev
yarn workspace @tkhwang-pico/mastra dev
```

### Environment Configuration

Each app requires specific environment variables:

- **Web**: `.env.local` with Supabase and Mastra URLs
- **Mobile**: `.env` with Clerk and Supabase keys
- **Mastra**: `.env` with OpenAI API key
- **Nest**: `.env` with Supabase keys and API configurations
- **Shared Types**: Auto-generated from Supabase schema via `packages/supabase`

### AI Development Workflow

1. **Start Mastra server first**: Required for web app's CopilotKit integration
2. **Agent routing**: Routing network intelligently dispatches to weather, fallback, or other agents
3. **Real-time integration**: Web chat interface connects via CopilotKit runtime to Mastra agents
4. **Prebuild automation**: All apps automatically build shared Supabase package before building
5. **Type safety**: Shared types via `@tkhwang-pico/supabase` workspace ensure consistency

### Cross-Platform Development

- **Mobile components render on web**: Via `react-native-web` compatibility
- **Platform-specific styling**: `web:` and `native:` prefixes in Tailwind
- **Shared types**: Use `@tkhwang-pico/supabase` workspace for cross-app types
- **Unified Supabase clients**: Platform-aware client factory handles mobile/web/server differences
- **Content management**: Shared content types and API interfaces across mobile/web apps

### Styling & Theming

- **Mobile**: NativeWind v4 (Tailwind for React Native) with platform variants
- **Web**: Tailwind CSS v3.4 with enhanced design tokens
- **Consistent theming**: HSL color definitions shared across platforms

## Common Troubleshooting

### Development Dependencies

- **Node Requirements**: Mastra requires Node ≥20, Nest/LangChain requires Node ≥18
- **React Version**: Enforced React 19.0.0 across all packages via root `resolutions`
- **Package Manager**: Yarn v1.22.22 with workspace support
- **Build Dependencies**: Supabase package builds automatically via postinstall hook
- **AI Integration**: Mastra server must be running before starting web app for CopilotKit

### Mobile Development Issues

- **Metro bundler**: Run `yarn clean` then `yarn dev` from mobile app directory
- **APK builds**: Generated files appear in root (e.g., `build-1755019814115.apk`)

### Monorepo Management

- **Dependencies**: Always run `yarn` from repository root after package changes
- **Type Safety**: Use workspace protocol for shared packages: `@tkhwang-pico/supabase`
- **Build Order**: Shared packages (like Supabase) build automatically via prebuild scripts
- **Clean Builds**: Enhanced `yarn clean` removes tsconfig.tsbuildinfo and all build artifacts
- **Git Hooks**: Husky pre-commit hooks run lint-staged for code quality

## Deployment Configuration

### EAS Build Profiles (Mobile)

- **development**: Local development with dev client (APK output)
- **preview**: Android release builds for testing
- **production**: Production builds with auto-increment versioning

### Platform Targets

- **Web**: Vercel deployment with automatic builds
- **Mobile**: Expo EAS Build for app stores
- **AI Backend**: Mastra Cloud for agent hosting
- **Database**: Supabase with real-time, auth, and storage
