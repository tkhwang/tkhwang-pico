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