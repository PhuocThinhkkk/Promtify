/*
  # Create prompt enhancements table for persistent history

  1. New Tables
    - `prompt_enhancements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `original_prompt` (text, the user's original prompt)
      - `enhanced_prompt` (text, the AI-enhanced version)
      - `provider` (text, which AI service was used)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `prompt_enhancements` table
    - Add policies for users to manage their own enhancements

  3. Indexes
    - Index on user_id for fast user queries
    - Index on created_at for chronological ordering
*/

-- Create prompt_enhancements table
CREATE TABLE IF NOT EXISTS prompt_enhancements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_prompt text NOT NULL,
  enhanced_prompt text NOT NULL,
  provider text DEFAULT 'Google Gemini 1.5 Flash',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE prompt_enhancements ENABLE ROW LEVEL SECURITY;

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompt_enhancements_user_id 
  ON prompt_enhancements(user_id);

CREATE INDEX IF NOT EXISTS idx_prompt_enhancements_created_at 
  ON prompt_enhancements(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prompt_enhancements_updated_at
  BEFORE UPDATE ON prompt_enhancements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();