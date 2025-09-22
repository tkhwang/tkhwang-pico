# @tkhwang-pico/supabase

Shared Supabase types, utilities, and client factories for all platforms in the PICO monorepo.

## Features

- **Type-safe Supabase clients** with automatic Database schema integration
- **Platform-specific factories** for Web, Mobile, and Server environments
- **Authentication integration** with Clerk for consistent auth across platforms
- **Environment validation** with descriptive error messages
- **Unified API** across all platforms while respecting platform-specific patterns
- **Modular exports** with dedicated `/clients` and `/types` paths for better organization

## Installation

This package is internal to the monorepo and installed automatically via workspace dependencies.

## Package Structure

```
@tkhwang-pico/supabase/
├── clients          # Platform-specific Supabase client factories
└── types            # Database types and utilities
```

**Import Paths:**
- `@tkhwang-pico/supabase` - All exports (clients + types)
- `@tkhwang-pico/supabase/clients` - Only client factories
- `@tkhwang-pico/supabase/types` - Only database types

## Usage

### Web Platform (Next.js)

```typescript
import {
  createWebClientWithAuth,
  createWebServerClient,
  createWebServerClientWithAuth,
  getClerkToken,
  type ClerkSession,
} from "@tkhwang-pico/supabase/clients";

// Client-side with Clerk session
const supabase = createWebClientWithAuth(session);

// Server-side without auth (public data)
const supabase = createWebServerClient(cookies);

// Server-side with Clerk JWT
const token = await getClerkToken(getToken);
const supabase = createWebServerClientWithAuth(cookies, { token });
```

### Mobile Platform (React Native + Expo)

```typescript
import {
  createMobileClientWithAuth,
  createMobileClient,
  createSupabaseClientWithClerkAuth, // deprecated, use createMobileClientWithAuth
} from "@tkhwang-pico/supabase/clients";

// With Clerk token (recommended)
const supabase = createMobileClientWithAuth(
  { token: clerkToken },
  { storage: AsyncStorage }
);

// Without authentication (public data)
const supabase = createMobileClient({ storage: AsyncStorage });

// Legacy pattern (deprecated but still supported)
const supabase = createSupabaseClientWithClerkAuth(clerkToken);
```

### Server Platform (Node.js/Nest.js)

```typescript
import {
  createServerServiceClient,
  createServerClientWithAuth,
  createServerClient,
  SupabaseClientFactory,
} from "@tkhwang-pico/supabase/clients";

// Service client with admin privileges (bypasses RLS)
const supabase = createServerServiceClient();

// User-scoped client (enforces RLS)
const supabase = createServerClientWithAuth({ token: userJwt });

// Public client without auth
const supabase = createServerClient();

// Nest.js service class (drop-in replacement for existing SupabaseService)
const factory = new SupabaseClientFactory();
const serviceClient = factory.getServiceClient();
const userClient = factory.getClientForUser(jwt);
```

## Environment Variables

### Web App
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key
```

### Mobile App
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Server/Nest.js
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key  # Optional, required for user-scoped clients
```

## Authentication Patterns

### Web Platform
- **Client-side**: Clerk session → Supabase JWT via template
- **Server-side**: Clerk `getToken()` → Supabase JWT header
- **SSR**: Cookie-based session management with `@supabase/ssr`

### Mobile Platform
- **Clerk JWT**: Direct token header authentication
- **AsyncStorage**: Optional session persistence
- **React Native**: Platform-specific optimizations

### Server Platform
- **Service Role**: Administrative operations bypassing RLS
- **User JWT**: Forwarded user authentication with RLS enforcement
- **Public Access**: Unauthenticated operations with anonymous key

## Error Handling

All factories include comprehensive error handling:

```typescript
import { SupabaseConfigError, SupabaseAuthError } from "@tkhwang-pico/supabase/clients";

try {
  const supabase = createWebClientWithAuth(session);
} catch (error) {
  if (error instanceof SupabaseConfigError) {
    // Missing environment variables
  } else if (error instanceof SupabaseAuthError) {
    // Authentication issues
  }
}
```

## Migration Guide

### From Existing Web Implementation

```typescript
// Before
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/client";
const supabase = createAuthenticatedSupabaseClient(session);

// After
import { createWebClientWithAuth } from "@tkhwang-pico/supabase/clients";
const supabase = createWebClientWithAuth(session);
```

### From Existing Mobile Implementation

```typescript
// Before
import { createSupabaseClientWithClerkAuth } from "@/utils/supabase";
const supabase = createSupabaseClientWithClerkAuth(clerkToken);

// After
import { createMobileClientWithAuth } from "@tkhwang-pico/supabase/clients";
const supabase = createMobileClientWithAuth({ token: clerkToken });
```

### From Existing Nest.js Implementation

```typescript
// Before
import { SupabaseService } from "@/supabase/supabase.service";
// Use existing service...

// After
import { SupabaseClientFactory } from "@tkhwang-pico/supabase/clients";
const factory = new SupabaseClientFactory();
// Same API, drop-in replacement
```

## Type Safety

All factories return `SupabaseClientWithDatabase` which includes:
- Full Database schema types from `database.types.ts`
- Type-safe table operations
- Automatic TypeScript inference for queries

```typescript
const { data, error } = await supabase
  .from('contents')
  .select('*')
  .eq('id', contentId); // Full type safety
```

## Scripts

```bash
# Generate types from Supabase schema
yarn generate-types

# Type check the package
yarn typecheck
```