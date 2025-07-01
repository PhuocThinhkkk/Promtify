/*
  # Fix prompt enhancements table creation

  1. New Tables
    - `prompt_enhancements` (only if it doesn't exist)
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `original_prompt` (text)
      - `enhanced_prompt` (text)
      - `provider` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `prompt_enhancements` table
    - Add policies for authenticated users to manage their own data

  3. Performance
    - Add indexes for user_id and created_at
    - Add updated_at trigger
*/

-- Only create the table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'prompt_enhancements') THEN
    CREATE TABLE prompt_enhancements (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      original_prompt text NOT NULL,
      enhanced_prompt text NOT NULL,
      provider text DEFAULT 'Google Gemini 1.5 Flash',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Enable RLS (safe to run multiple times)
ALTER TABLE prompt_enhancements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Users can view their own enhancements" ON prompt_enhancements;
  DROP POLICY IF EXISTS "Users can create their own enhancements" ON prompt_enhancements;
  DROP POLICY IF EXISTS "Users can update their own enhancements" ON prompt_enhancements;
  DROP POLICY IF EXISTS "Users can delete their own enhancements" ON prompt_enhancements;
END $$;

-- Create policies
CREATE POLICY "Users can view their own enhancements"
  ON prompt_enhancements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enhancements"
  ON prompt_enhancements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enhancements"
  ON prompt_enhancements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own enhancements"
  ON prompt_enhancements
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_prompt_enhancements_user_id 
  ON prompt_enhancements(user_id);

CREATE INDEX IF NOT EXISTS idx_prompt_enhancements_created_at 
  ON prompt_enhancements(created_at DESC);

-- Create updated_at trigger function (safe to run multiple times)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate trigger to avoid conflicts
DROP TRIGGER IF EXISTS update_prompt_enhancements_updated_at ON prompt_enhancements;

CREATE TRIGGER update_prompt_enhancements_updated_at
  BEFORE UPDATE ON prompt_enhancements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();