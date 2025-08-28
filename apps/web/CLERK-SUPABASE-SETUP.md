# Clerk JWT + Supabase Integration Setup Guide

This guide explains how to complete the Clerk JWT integration with Supabase for your Next.js application.

## Prerequisites

✅ Clerk is already configured in your Next.js app  
✅ Supabase client setup is complete  
✅ Code changes have been implemented

## Required Manual Configuration

### 1. Configure Clerk for Supabase Integration

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Navigate to **Integrations** → **Databases**
3. Find **Supabase** and click **Configure**
4. Enable the integration - this adds `"role": "authenticated"` to your JWT tokens
5. Copy your **Clerk domain** (e.g., `your-app.clerk.accounts.dev`)

### 2. Add Clerk as Third-Party Auth Provider in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Click **Add provider**
5. Select **Third Party Auth**
6. Paste your **Clerk domain** from step 1
7. The JWKS Endpoint URL will be automatically generated
8. Click **Save**

### 3. Create Database Tables

1. In Supabase Dashboard, go to **SQL Editor**
2. Run the contents of `create-tables.sql` file first:

```bash
# Copy and paste this into Supabase SQL Editor
cat apps/web/create-tables.sql
```

This will create:
- `threads` table with Clerk-compatible `user_id` (TEXT type)
- `messages` table with foreign key relationship
- Indexes for performance
- Auto-update trigger for `updated_at`

### 4. Apply Row Level Security (RLS) Policies

1. Still in **SQL Editor**, run the contents of `supabase-rls-policies.sql` file:

```bash
# Copy and paste this into Supabase SQL Editor
cat apps/web/supabase-rls-policies.sql
```

This will:

- Enable RLS on `threads` and `messages` tables
- Create policies that use `auth.jwt()->>'sub'` to identify users
- Ensure users can only access their own data

### 5. Update Environment Variables

Your `.env.local` should include:

```bash
# Clerk Configuration (already set)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Configuration (already set)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGci...
```

## How It Works

### Authentication Flow

1. User signs in via Clerk UI components
2. Clerk generates a JWT token with `"role": "authenticated"` claim
3. Frontend passes JWT to Supabase via `Authorization: Bearer {token}` header
4. Supabase validates JWT using Clerk's JWKS endpoint
5. RLS policies use `auth.jwt()->>'sub'` (Clerk user ID) to filter data

### Database Security

- **Threads**: Users can only CRUD their own threads (`user_id` matches JWT `sub`)
- **Messages**: Users can only CRUD messages from their own threads
- All database operations are protected by RLS policies

## Code Architecture

### Client-Side (React Components)

```typescript
// Use this in components that need authentication
const supabase = useSupabaseClient();
const createThreadFn = createThreadWithAuth(supabase);
```

### Server-Side (Server Components/API Routes)

```typescript
// Use this in server components that need authentication
const supabase = await createClientWithAuth();
```

## Testing the Integration

1. Start the development server:

```bash
yarn dev
```

2. Sign in using Clerk UI
3. Try creating a chat thread
4. Verify in Supabase that:
   - Thread `user_id` matches your Clerk user ID
   - You can only see your own threads/messages

## Troubleshooting

### "JWT expired" or "Invalid JWT" errors

- Check that Clerk domain is correctly configured in Supabase
- Verify JWKS endpoint is accessible

### "Permission denied" errors

- Ensure RLS policies are applied correctly
- Check that JWT contains `"role": "authenticated"` claim
- Verify `auth.jwt()->>'sub'` returns the correct user ID

### Integration not working

- Confirm Clerk integration is enabled in Clerk Dashboard
- Check that Third-Party Auth provider is properly configured in Supabase
- Test JWT token by decoding it (use jwt.io) to verify claims

## Next Steps

After completing these manual steps:

1. Test authentication flow end-to-end
2. Verify data isolation between users
3. Monitor for any JWT-related errors in production
