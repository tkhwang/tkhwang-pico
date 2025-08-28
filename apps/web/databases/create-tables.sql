-- Create tables for chat application with Clerk authentication
-- Run this SQL in your Supabase SQL Editor

-- Create threads table
CREATE TABLE IF NOT EXISTS "public"."threads" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" text NOT NULL,
    "title" text,
    "metadata" jsonb DEFAULT '{}',
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now()
);

-- Create messages table  
CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "thread_id" uuid NOT NULL REFERENCES "public"."threads"("id") ON DELETE CASCADE,
    "role" text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    "content" text NOT NULL,
    "metadata" jsonb DEFAULT '{}',
    "created_at" timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "threads_user_id_idx" ON "public"."threads" ("user_id");
CREATE INDEX IF NOT EXISTS "threads_updated_at_idx" ON "public"."threads" ("updated_at" DESC);
CREATE INDEX IF NOT EXISTS "messages_thread_id_idx" ON "public"."messages" ("thread_id");
CREATE INDEX IF NOT EXISTS "messages_created_at_idx" ON "public"."messages" ("created_at");

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at for threads
DROP TRIGGER IF EXISTS update_threads_updated_at ON "public"."threads";
CREATE TRIGGER update_threads_updated_at
    BEFORE UPDATE ON "public"."threads"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify tables were created
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('threads', 'messages') 
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;