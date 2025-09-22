-- Create tables for chat application with Clerk authentication
-- Run this SQL in your Supabase SQL Editor

-- Enable pgcrypto extension for gen_random_uuid() function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create threads table
CREATE TABLE IF NOT EXISTS "public"."threads" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" text NOT NULL,
    "title" text,
    "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL
);

-- Create messages table  
CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "thread_id" uuid NOT NULL REFERENCES "public"."threads"("id") ON DELETE CASCADE,
    "role" text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    "content" text NOT NULL,
    "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "threads_user_id_idx" ON "public"."threads" ("user_id");
CREATE INDEX IF NOT EXISTS "threads_updated_at_idx" ON "public"."threads" ("updated_at" DESC);
CREATE INDEX IF NOT EXISTS "messages_thread_id_idx" ON "public"."messages" ("thread_id");
CREATE INDEX IF NOT EXISTS "messages_created_at_idx" ON "public"."messages" ("created_at");
-- Optimized for fetching latest messages per thread
CREATE INDEX IF NOT EXISTS "messages_thread_id_created_at_desc_idx"
  ON "public"."messages" ("thread_id", "created_at" DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION bump_thread_updated_at()
RETURNS TRIGGER AS $$
DECLARE
  v_thread_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_thread_id := OLD.thread_id;
  ELSE
    v_thread_id := NEW.thread_id;
  END IF;
  UPDATE "public"."threads" SET "updated_at" = now() WHERE id = v_thread_id;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER bump_threads_updated_at_on_message
  AFTER INSERT OR UPDATE OR DELETE ON "public"."messages"
  FOR EACH ROW
  EXECUTE FUNCTION bump_thread_updated_at();

-- Keep thread recency in sync with message activity
DROP TRIGGER IF EXISTS bump_threads_updated_at_on_message ON "public"."messages";
CREATE OR REPLACE FUNCTION bump_thread_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "public"."threads" SET "updated_at" = now() WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER bump_threads_updated_at_on_message
  AFTER INSERT OR UPDATE ON "public"."messages"
  FOR EACH ROW
  EXECUTE FUNCTION bump_thread_updated_at();

-- Verify tables were created
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('threads', 'messages') 
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

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
  EXISTS (
    SELECT 1 FROM "public"."threads" t 
    WHERE t.id = messages.thread_id AND (SELECT auth.jwt()->>'sub') = t.user_id
  )
);

-- Policy for creating messages: users can only create messages in their own threads
CREATE POLICY "Users can create messages in their threads"
ON "public"."messages"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."threads" t 
    WHERE t.id = messages.thread_id AND (SELECT auth.jwt()->>'sub') = t.user_id
  )
);

-- Policy for updating messages: users can only update messages in their own threads
CREATE POLICY "Users can update messages in their threads"
ON "public"."messages"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."threads" t 
    WHERE t.id = messages.thread_id AND (SELECT auth.jwt()->>'sub') = t.user_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."threads" t 
    WHERE t.id = messages.thread_id AND (SELECT auth.jwt()->>'sub') = t.user_id
  )
);

-- Policy for deleting messages: users can only delete messages from their own threads
CREATE POLICY "Users can delete messages from their threads"
ON "public"."messages"
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."threads" t 
    WHERE t.id = messages.thread_id AND (SELECT auth.jwt()->>'sub') = t.user_id
  )
);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('threads', 'messages')
ORDER BY tablename, policyname;
