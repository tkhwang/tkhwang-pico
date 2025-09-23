# @tkhwang-pico/supabase

Shared Supabase schema types, client factories, and runtime helpers for every platform in the PICO monorepo.

## Features

- **Unified factory** – `createSupabaseClientFactory` builds the right client for web, server, or mobile with a single options object.
- **Mode awareness** – `public`, `auth`, and `service` modes ensure Row Level Security rules stay predictable per platform.
- **Auto configuration** – `getSupabaseConfigForPlatform` resolves validated environment config per runtime.
- **Strict validation** – descriptive `SupabaseConfigError` / `SupabaseAuthError` guards catch misconfigurations early.
- **Typed exports** – Database, factory, and client helpers are fully typed for frictionless DX.
- **Composable helpers** – platform-specific helper objects expose Clerk token utilities, Nest service factories, and mobile hydrators.

## Package Structure

```
@tkhwang-pico/supabase/
├── src
│   ├── clients
│   │   ├── client-factory.ts      # createSupabaseClientFactory & config resolver
│   │   ├── web|server|mobile.ts   # low-level platform client builders
│   │   └── platform-resolvers/    # buildWeb/Server/MobileFactory wrappers
│   ├── lib/config.ts              # validation + shared error classes
│   └── types                      # Supabase schema + factory/types exports
├── dist                           # Compiled output (tsc)
└── README.md
```

### Export Map

- `@tkhwang-pico/supabase` – everything (types + clients + factories)
- `@tkhwang-pico/supabase/clients` – client factories, helpers, config utils
- `@tkhwang-pico/supabase/types` – generated database types & factory types

## Quick Start

### Factory-first setup

```typescript
import {
  createSupabaseClientFactory,
  getSupabaseConfigForPlatform,
  type SupabaseFactoryOptions,
} from "@tkhwang-pico/supabase/clients";

const options: SupabaseFactoryOptions = {
  platform: "web",
  runtime: "server",
  mode: "auth",
  cookies,
  auth: { token: await getToken({ template: "supabase" }) },
};

const { client, helpers } = createSupabaseClientFactory(options);
```

- `client` is a platform-aware `SupabaseClientWithDatabase`.
- `helpers` exposes runtime specific utilities (see sections below).
- `getSupabaseConfigForPlatform("web" | "server" | "mobile")` returns validated environment config when you want to hydrate options manually.
- Internally, the factory delegates to `buildWebFactory`, `buildServerFactory`, or `buildMobileFactory` under `src/clients/platform-resolvers` to assemble the correct helpers.

### Default modes

| Platform | Runtime default | Mode fallback | Notes |
|----------|-----------------|---------------|-------|
| web      | `browser`       | `auth`        | 브라우저 런타임에서는 auth 모드만 지원합니다. |
| web      | `server`        | `public`      | `cookies` object required; `auth` mode also needs `auth.token` |
| server   | –               | `service`     | service mode uses service role key |
| mobile   | –               | `public`      | `auth` mode requires a user access token |

## Platform Usage

### Web (Next.js)

#### Browser runtime

```typescript
import { createSupabaseClientFactory } from "@tkhwang-pico/supabase/clients";

const { client } = createSupabaseClientFactory({
  platform: "web",
  runtime: "browser",
  session, // Clerk session (required in browser runtime)
});
```

#### Server runtime (Next.js App Router, API routes, middleware)

```typescript
const factory = createSupabaseClientFactory({
  platform: "web",
  runtime: "server",
  mode: "auth",
  cookies, // from Next.js cookies() helper
  auth: { token: await getToken({ template: "supabase" }) },
});

const { client, helpers } = factory;
const supabase = client;
const jwt = await helpers.getClerkToken(() => getToken({ template: "supabase" }));
```

- `helpers.runtime` exposes the resolved runtime (`browser` | `server`).
- `helpers.getClerkToken` wraps Clerk token retrieval with validation + helpful errors.

### Mobile (Expo React Native)

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSupabaseClientFactory } from "@tkhwang-pico/supabase/clients";

const { client, helpers } = createSupabaseClientFactory({
  platform: "mobile",
  mode: "auth",
  auth: { token: clerkToken },
  options: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Legacy helper retained for gradual migration
helpers.createClientWithClerkToken(clerkToken);
```

- `mode: "public"` builds an unauthenticated client (uses anon key only).
- `helpers.createClientWithClerkToken` mirrors the deprecated `createSupabaseClientWithClerkAuth` signature for backwards compatibility.

### Server / Nest.js

```typescript
import { createSupabaseClientFactory } from "@tkhwang-pico/supabase/clients";

// Service client (default)
const { client, helpers } = createSupabaseClientFactory({ platform: "server" });

const serviceClient = client; // bypasses RLS using service role key
const userClient = helpers.getClientForUser(userJwt);
const publicClient = helpers.getPublicClient();

// Need DI-friendly factory?
const nestFactory = helpers.getClientFactory();
const nestService = nestFactory.getServiceClient();
```

- Switch to `mode: "auth"` to force user-token RLS enforcement.
- `mode: "public"` reuses the anon key for open access (requires `SUPABASE_ANON_KEY`).

## Configuration Helpers

### Environment utilities

```typescript
import { getSupabaseConfigForPlatform } from "@tkhwang-pico/supabase/clients";

const config = getSupabaseConfigForPlatform("server");
// → { url, serviceRoleKey, anonKey? }
```

- All config functions call `validateBaseConfig` / `validateServerConfig` under the hood and throw `SupabaseConfigError` when required vars are missing.
- `validateAuthToken` backs every auth-enabled client; absence of a token triggers `SupabaseAuthError`.

### Environment variables

| Platform | Variable | Required | Description |
|----------|----------|----------|-------------|
| Web      | `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| Web      | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` | ✅ | Public anon key |
| Mobile   | `EXPO_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| Mobile   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key |
| Server   | `SUPABASE_URL` | ✅ | Supabase project URL |
| Server   | `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (bypasses RLS) |
| Server   | `SUPABASE_ANON_KEY` | ⚠️ | Required for `public`/`auth` server clients |

## Error Handling Cheatsheet

| Error | Thrown When |
|-------|-------------|
| `SupabaseConfigError` | Missing URLs/keys, unsupported modes/platforms |
| `SupabaseAuthError` | Missing or invalid auth token, Clerk token fetch failures |

## Legacy Helpers

- `createSupabaseClientWithClerkAuth` remains exported for mobile. It now wraps `createMobileClientWithAuth` and will be removed when consumers migrate.

## Development

```bash
yarn workspace @tkhwang-pico/supabase build
```

- Generated types live at `src/types/supabase-database.types.ts` (`yarn workspace @tkhwang-pico/supabase generate-types`).
- All exports are tree-shakeable (`sideEffects: false`).
