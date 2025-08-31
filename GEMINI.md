# GEMINI Local Development Context

This document provides context for local development of the PICO project.

## Project Overview

PICO (Personal Intelligent COpilot) is a personal AI playground. It is a monorepo with the following components:

-   **AI Backend**:
    -   `/apps/mastra`: [mastra.ai](https://mastra.ai/)
    -   `/apps/langchain`: [LangChain.js](https://js.langchain.com/docs/introduction/) + [LangGraph.js](https://langchain-ai.github.io/langgraphjs/tutorials/quickstart/)
-   **Backend**:
    -   `/apps/nest`: [nest.js](https://docs.nestjs.com/)
-   **Web Frontend**:
    -   `/apps/web`: [next.js](https://nextjs.org/docs)
-   **Mobile App**:
    -   `/apps/mobile-queue`: [expo react native](https://docs.expo.dev/)

## Building and Running

### Web Frontend (`/apps/web`)

-   **Run in development mode**: `yarn workspace @tkhwang-pico/web dev`
-   **Build for production**: `yarn workspace @tkhwang-pico/web build`
-   **Run in production mode**: `yarn workspace @tkhwang-pico/web start`
-   **Lint**: `yarn workspace @tkhwang-pico/web lint`

### Backend (`/apps/nest`)

-   **Run in development mode**: `yarn workspace nest start:dev`
-   **Build for production**: `yarn workspace nest build`
-   **Run in production mode**: `yarn workspace nest start:prod`
-   **Run tests**: `yarn workspace nest test`

### Mobile App (`/apps/mobile-queue`)

-   **Run on Android**: `yarn workspace @tkhwang-pico/mobile-queue android`
-   **Run on iOS**: `yarn workspace @tkhwang-pico/mobile-queue ios`
-   **Run on web**: `yarn workspace @tkhwang-pico/mobile-queue web`
-   **Build for Android**: `yarn workspace @tkhwang-pico/mobile-queue build:android`
-   **Build for iOS**: `yarn workspace @tkhwang-pico/mobile-queue build:ios`

### AI Backend (`/apps/langchain`)

-   **Run in development mode**: `yarn workspace @tkhwang-pico/langchain dev`
-   **Build for production**: `yarn workspace @tkhwang-pico/langchain build`
-   **Run tests**: `yarn workspace @tkhwang-pico/langchain test`
-   **Lint**: `yarn workspace @tkhwang-pico/langchain lint`

### AI Backend (`/apps/mastra`)

-   **Run in development mode**: `yarn workspace @tkhwang-pico/mastra dev`
-   **Build for production**: `yarn workspace @tkhwang-pico/mastra build`
-   **Run in production mode**: `yarn workspace @tkhwang-pico/mastra start`

## Development Conventions

-   This is a monorepo using Yarn workspaces.
-   Each application has its own set of dependencies and scripts.
-   The web frontend uses Next.js, Clerk for authentication, and Supabase for the database.
-   The backend is a Nest.js application.
-   The mobile app is a React Native application built with Expo.
-   The AI backend uses both mastra.ai and LangChain/LangGraph.
