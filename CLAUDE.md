# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PICO (Personal Intelligent Companion Operator) is a cross-platform monorepo with AI agent system architecture using Yarn workspaces. The project includes:

- **Mobile app** (`apps/mobile-queue/`) - React Native + Expo with cross-platform support (iOS/Android/Web)
- **Web app** (`apps/web/`) - Next.js 15.4.0 with React 19 patterns, Supabase auth, and CopilotKit integration
- **Mastra AI agent system** (`apps/mastra/`) - Intelligent routing and specialized AI agents (weather, fallback)
- **Nest.js backend** (`apps/nest/`) - Node.js backend service
- **LangChain system** (`apps/langchain/`) - Alternative AI agent implementation using LangChain.js
- **Common package** (`packages/common/`) - Shared types and utilities across apps
- **Shared UI components** using shadcn/ui patterns adapted for each platform

## Development Commands

### Root Level (Monorepo)

```bash
yarn                    # Install all dependencies
yarn clean              # Clean all node_modules, build artifacts, and caches
yarn type-check         # Type check all workspaces
yarn lint               # Lint all workspaces
```

### Mobile App (`apps/mobile-queue/`)

```bash
yarn dev               # Start Expo development server with cache clear
yarn android           # Start with Android emulator
yarn ios               # Start with iOS simulator
yarn web               # Start web version

# Production builds (requires EAS CLI)
yarn build:ios                # Production iOS build
yarn build:android            # Android preview build

yarn lint              # Run ESLint
yarn lint:fix          # Run ESLint with auto-fix
yarn type-check        # Run TypeScript type checking
yarn clean             # Clean Expo cache and node_modules
```

### Web App (`apps/web/`)

```bash
yarn dev               # Start Next.js dev server with Turbopack
yarn build             # Build for production
yarn start             # Start production server
yarn lint              # Run ESLint
yarn type-check        # Run TypeScript type checking
```

### Mastra AI System (`apps/mastra/`)

```bash
yarn dev               # Start Mastra development server with hot reload
yarn build             # Build Mastra agent system
yarn start             # Start production Mastra server
yarn lint              # Run ESLint
yarn lint:fix          # Run ESLint with auto-fix
yarn type-check        # Run TypeScript type checking
```

### Nest.js Backend (`apps/nest/`)

```bash
yarn dev               # Start Nest.js development server
yarn build             # Build for production
yarn start             # Start production server
yarn lint              # Run ESLint
yarn type-check        # Run TypeScript type checking
```

### LangChain System (`apps/langchain/`)

```bash
yarn dev               # Start LangChain development server
yarn build             # Build LangChain agent system
yarn start             # Start production server
yarn lint              # Run ESLint
yarn type-check        # Run TypeScript type checking
```

## Architecture & Patterns

### AI Agent System Architecture

The project features a sophisticated AI agent system using Mastra framework:

**Routing Network** (`apps/mastra/src/mastra/network/routing-network.ts`):

- Intelligent routing system that analyzes user intent and routes to appropriate agents
- Supports multiple languages (Korean/English) with language detection
- Uses OpenAI GPT-4o-mini for routing decisions

**Specialized Agents**:

- **Weather Agent**: Provides weather information and forecasts
- **Fallback Agent**: Handles general queries and provides fallback responses
- **Routing Agent**: Central dispatcher that determines which agent should handle each request

**Vector Database Integration**:

- Uses LibSQL with in-memory storage for telemetry and evaluations
- Configurable to use persistent file storage (file:../mastra.db) when needed

**CopilotKit Integration**:

- Web app integrates with Mastra agents via CopilotKit runtime
- Real-time agent communication through `/api/copilotkit` endpoint
- Dynamic agent loading with runtime initialization

### Cross-Platform Component Strategy

The project implements a unique cross-platform UI approach:

**Mobile Components** (`apps/mobile-queue/components/ui/`):

- Built on `@rn-primitives` for React Native compatibility
- Uses `react-native-web` for web rendering
- Platform-specific styling with `web:` and `native:` prefixes in Tailwind
- Components wrap React Native `Pressable` and other native primitives

**Web Components** (`apps/web/components/ui/`):

- Built on `@radix-ui` primitives for web-native accessibility
- Standard HTML elements with enhanced focus/interaction states
- Uses `@radix-ui/react-slot` for component composition

### Authentication & Data Management

- **Supabase Integration**: Authentication, database, and real-time features
- **TanStack Query**: Client-side data fetching and caching with React Query
- **Type Safety**: Automatic TypeScript type generation from Supabase schema
- **Chat Persistence**: Thread-based chat history with user-specific data storage

### Theming & Styling

- **Mobile**: NativeWind v4 (Tailwind for React Native) with platform-specific variants
- **Web**: Tailwind CSS v3.4 with enhanced design tokens
- **Shared Colors**: Both platforms use HSL color definitions for consistency
- **Theme Toggle**: Cross-platform dark/light mode with system preference detection

### Navigation & Routing

- **Mobile**: Expo Router (file-based routing) with React Navigation integration
- **Web**: Next.js App Router with file-based routing
- Both use similar layout patterns and component organization

### Key Architectural Decisions

1. **AI-First Architecture**: Mastra agents as core intelligence layer with routing network
2. **Monorepo Structure**: Yarn workspaces for dependency management and code sharing
3. **Platform-Specific UI Libraries**: @rn-primitives for mobile, @radix-ui for web
4. **Vector RAG System**: LibSQL vector database for document search and retrieval
5. **Real-Time AI Integration**: CopilotKit runtime connecting web UI to Mastra agents
6. **Cross-Platform Compatibility**: Mobile components render on web via react-native-web

## Shared Configuration Packages

The project uses two shared configuration packages to maintain consistency across all apps:

### TypeScript Configuration (`packages/config-typescript/`)

Provides platform-specific TypeScript configurations that extend a common base:

- **Base Config**: `tsconfig.base.json` - Common TypeScript settings (ES2020, strict mode, etc.)
- **Platform Configs**:
  - `tsconfig.next.json` - Next.js-specific settings with App Router support
  - `tsconfig.expo.json` - Expo/React Native configuration
  - `tsconfig.nest.json` - Nest.js backend configuration
  - `tsconfig.node.json` - Node.js applications
  - `tsconfig.react.json` - General React applications
  - `tsconfig.react-native.json` - React Native specifics
  - `tsconfig.build.json` - Build-time configurations

**Usage Pattern**: Apps extend the appropriate config via `"extends": "@tkhwang-pico/config-typescript/next"`

### ESLint/Prettier Configuration (`packages/config-eslint-prettier/`)

Uses ESLint Flat Config with TypeScript ESLint and platform-specific rules:

- **Base Config**: `eslint/flat/base.mjs` - TypeScript, import sorting, and Prettier integration
- **Platform Configs**:
  - `eslint/flat/next.mjs` - Next.js rules and React hooks
  - `eslint/flat/expo.mjs` - React Native and Expo-specific rules
  - `eslint/flat/nest.mjs` - Node.js and Nest.js backend rules
  - `eslint/flat/node.mjs` - General Node.js applications
  - `eslint/flat/react.mjs` - React-specific rules

**Prettier Configs**:
- `prettier/prettier.base.cjs` - Standard Prettier configuration
- `prettier/prettier.tailwind.cjs` - Tailwind CSS class sorting

**Usage Pattern**: Apps import and extend configs: `import baseConfig from '@tkhwang-pico/config-eslint-prettier/eslint/next'`

## EAS Build Configuration

The mobile app uses Expo Application Services (EAS) for builds:

- **development**: Local development with dev client (APK output for Android)
- **development-simulator**: iOS simulator builds
- **preview**: Android release builds for testing
- **production**: Production builds with auto-increment versioning

## Common File Patterns

- `@/` path alias in both mobile and web apps points to their respective app root directories
- UI components follow shadcn/ui naming and structure conventions
- Cross-platform components maintain similar APIs but different implementations
- Theme constants defined in `lib/constants.ts` for mobile, CSS variables for web

## Dependencies & Tools

### AI & Intelligence Layer (Mastra)

- `@mastra/core`: Core Mastra framework for agent orchestration
- `@mastra/libsql`: LibSQL storage and vector database integration
- `@mastra/memory`, `@mastra/rag`: Memory and RAG capabilities
- `@ai-sdk/openai`: OpenAI integration for GPT models
- `@copilotkit/runtime`, `@copilotkit/react-*`: Real-time AI chat interface

### Shared Utilities

- `class-variance-authority`: Component variant management
- `clsx` & `tailwind-merge`: Conditional styling utilities
- `lucide-react`/`lucide-react-native`: Consistent iconography
- `zod`: Runtime type validation and schema definition

### Mobile-Specific

- Expo SDK 53 with React Native 0.79.5
- `@rn-primitives/*`: Accessible React Native UI primitives (avatar, label, popover, portal, separator, slot)
- `expo-router`: File-based navigation
- `expo-auth-session`, `expo-web-browser`: OAuth authentication flow
- `expo-secure-store`: Secure token storage
- NativeWind v4: Tailwind CSS for React Native

### Web-Specific

- Next.js 15.4.0 with React 19
- `@radix-ui/*`: Accessible web UI primitives (dialog, dropdown-menu, avatar, etc.)
- `@supabase/supabase-js`, `@supabase/ssr`: Database and authentication
- `@tanstack/react-query`: Client-side data fetching and caching
- `@copilotkit/react-core`, `@copilotkit/react-ui`: AI chat interface
- `next-themes`: Theme management with system preference detection
- Tailwind CSS v3.4 with tailwindcss-animate
- TypeScript 5 with strict configuration

## Environment Configuration

### Required Environment Variables

#### Web App (`apps/web/.env.local`)

```bash
# Web App Configuration
NEXT_PUBLIC_WEB_URL=http://localhost:3000
NEXT_PUBLIC_MASTRA_URL=http://localhost:4000
NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY=your_license_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key
```

#### Mobile App (`apps/mobile-queue/.env`)

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

#### Mastra AI System (`apps/mastra/.env`)

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

### Development Setup

1. Set up environment variables in `.env.local` files for each app
2. Install dependencies: `yarn` (from root)
3. Start Mastra server: `cd apps/mastra && yarn dev`
4. Start web app: `cd apps/web && yarn dev`
5. For mobile: `cd apps/mobile-queue && yarn dev`

The web app validates required environment variables on startup and will throw descriptive errors for missing configuration.

## Code Quality & Linting

### ESLint Configuration (Flat Config)

All apps use the shared ESLint configuration with platform-specific extensions:

- **Shared Base**: TypeScript ESLint, import sorting, Prettier integration
- **Web (`apps/web/`)**: Next.js rules + TanStack Query plugin
- **Mobile (`apps/mobile-queue/`)**: React Native + Expo rules + import ordering
- **Mastra (`apps/mastra/`)**: Node.js + TypeScript configuration
- **Nest.js (`apps/nest/`)**: Backend-specific Node.js rules
- **LangChain (`apps/langchain/`)**: Node.js + TypeScript configuration

### Key ESLint Rules Applied Across All Apps

- **Import Organization**: Enforced by `simple-import-sort` plugin
- **TypeScript**: Consistent type imports with `@typescript-eslint/consistent-type-imports`
- **Unused Variables**: Warnings for unused vars (with `_` prefix exceptions)
- **Prettier Integration**: Automatic code formatting

### Import Organization Pattern

All apps enforce consistent import ordering:

1. Built-in modules (Node.js, React Native)
2. External packages (React/React Native first, then alphabetical)
3. Internal modules (using `@/` alias)
4. Relative imports (./filename)
5. Type imports (separated and marked with `type`)

### Platform-Specific Rules

- **Web**: Next.js patterns, React hooks, TanStack Query exhaustive deps
- **Mobile**: React Native patterns, Expo conventions, platform-specific imports
- **Backend**: Node.js patterns, async/await best practices

## Testing & Quality

Currently no test infrastructure is configured. When adding tests:

- **Mastra**: Consider Jest for agent logic and vector database operations
- **Mobile**: Consider Expo testing tools or React Native Testing Library
- **Web**: Jest + React Testing Library would be appropriate
- **E2E**: Playwright could work for web, Detox for mobile
- **AI Agents**: Test routing logic and agent responses with mock data

## Package Resolution

The monorepo enforces specific React versions across all packages:
- React: 19.0.0
- React DOM: 19.0.0

These are enforced via `resolutions` in the root `package.json`.

## Build Artifacts

Mobile app generates APK files in the root directory (e.g., `build-1755019814115.apk`). These should be added to `.gitignore` if not already present.

The Mastra system uses LibSQL with in-memory storage by default. When configured for persistence, it creates database files for storing telemetry and evaluation data.

## Authentication Architecture

### Mobile App

- **Clerk Authentication**: Primary auth provider with Supabase JWT integration
- **Token Flow**: Clerk JWT tokens are passed to Supabase for RLS (Row Level Security)
- **Session Management**: Uses `expo-secure-store` for secure token storage
- **Supabase Client**: Created with Clerk JWT token via `createSupabaseClientWithClerkAuth()`

### Web App

- **Supabase Auth**: Direct authentication with Supabase
- **Session Handling**: Server-side session management with `@supabase/ssr`
- **Protected Routes**: Middleware-based route protection

## Deployment Platforms

- **Web App**: Vercel (automatic deployments from main branch)
- **Mastra AI**: Mastra Cloud (dedicated AI agent hosting)
- **Nest.js Backend**: Railway (container-based deployment)
- **Mobile App**: Expo EAS Build for iOS/Android app stores
- **Database**: Supabase (Postgres with real-time, auth, and storage)

## Common Troubleshooting

### Mobile Development Issues

- **Metro bundler issues**: Run `yarn clean` then `yarn dev` from mobile app directory
- **iOS simulator not starting**: Ensure Xcode is installed and run `yarn ios`
- **Android build failures**: Check that Android SDK is properly configured

### Supabase Integration

- **RLS policies**: Ensure proper JWT configuration for Clerk-Supabase integration
- **Type generation**: Run `yarn generate-types` after schema changes

### Monorepo Dependencies

- **Workspace resolution**: Always run `yarn` from repository root after package changes
- **Cross-package imports**: Use workspace protocol `@tkhwang-pico/common` for shared code
- **React version conflicts**: Enforced via root `resolutions` to React 19.0.0

### AI Agent Integration

- **Mastra server must be running**: Start with `cd apps/mastra && yarn dev` before web app
- **CopilotKit runtime**: Connects to Mastra agents via `/api/copilotkit` endpoint
- **Agent routing**: Routing network analyzes intent and dispatches to appropriate agents
