-- Clerk JWT Integration with Supabase RLS Policies
-- Run this SQL in your Supabase SQL Editor after configuring Clerk as a Third-Party Auth Provider

-- First, ensure RLS is enabled on both tables (if not already enabled)
ALTER TABLE "public"."threads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (optional, only if you had Supabase auth policies before)
DROP POLICY IF EXISTS "Users can view their own threads" ON "public"."threads";
DROP POLICY IF EXISTS "Users can create their own threads" ON "public"."threads";
DROP POLICY IF EXISTS "Users can update their own threads" ON "public"."threads";
DROP POLICY IF EXISTS "Users can delete their own threads" ON "public"."threads";

DROP POLICY IF EXISTS "Users can view messages from their threads" ON "public"."messages";
DROP POLICY IF EXISTS "Users can create messages in their threads" ON "public"."messages";
DROP POLICY IF EXISTS "Users can update their own messages" ON "public"."messages";
DROP POLICY IF EXISTS "Users can delete their own messages" ON "public"."messages";

-- THREADS TABLE POLICIES
-- Policy for viewing threads: users can only see their own threads
CREATE POLICY "Users can view their own threads"
ON "public"."threads"
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- Policy for creating threads: users can only create threads with their own user_id
CREATE POLICY "Users can create their own threads"
ON "public"."threads"
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- Policy for updating threads: users can only update their own threads
CREATE POLICY "Users can update their own threads"
ON "public"."threads"
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- Policy for deleting threads: users can only delete their own threads
CREATE POLICY "Users can delete their own threads"
ON "public"."threads"
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- MESSAGES TABLE POLICIES
-- Policy for viewing messages: users can only see messages from their own threads
CREATE POLICY "Users can view messages from their threads"
ON "public"."messages"
FOR SELECT
TO authenticated
USING (
  thread_id IN (
    SELECT id FROM "public"."threads" 
    WHERE (SELECT auth.jwt()->>'sub') = user_id
  )
);

-- Policy for creating messages: users can only create messages in their own threads
CREATE POLICY "Users can create messages in their threads"
ON "public"."messages"
FOR INSERT
TO authenticated
WITH CHECK (
  thread_id IN (
    SELECT id FROM "public"."threads" 
    WHERE (SELECT auth.jwt()->>'sub') = user_id
  )
);

-- Policy for updating messages: users can only update messages in their own threads
CREATE POLICY "Users can update messages in their threads"
ON "public"."messages"
FOR UPDATE
TO authenticated
USING (
  thread_id IN (
    SELECT id FROM "public"."threads" 
    WHERE (SELECT auth.jwt()->>'sub') = user_id
  )
)
WITH CHECK (
  thread_id IN (
    SELECT id FROM "public"."threads" 
    WHERE (SELECT auth.jwt()->>'sub') = user_id
  )
);

-- Policy for deleting messages: users can only delete messages from their own threads
CREATE POLICY "Users can delete messages from their threads"
ON "public"."messages"
FOR DELETE
TO authenticated
USING (
  thread_id IN (
    SELECT id FROM "public"."threads" 
    WHERE (SELECT auth.jwt()->>'sub') = user_id
  )
);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('threads', 'messages')
ORDER BY tablename, policyname;