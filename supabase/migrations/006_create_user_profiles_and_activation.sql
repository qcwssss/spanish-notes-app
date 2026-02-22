-- Migration: Create user profiles and activation system
-- Date: 2026-02-21
-- Description: Creates user_profiles table, activation_codes table, and related functions

-- Step 1: Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  is_active BOOLEAN DEFAULT false,
  storage_used BIGINT DEFAULT 0,
  plan_type TEXT DEFAULT 'free',
  target_language TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view own profile
CREATE POLICY "Users can view own profile" 
  ON public.user_profiles FOR SELECT USING (auth.uid() = id);

-- Allow users to update own profile
CREATE POLICY "Users can update own profile" 
  ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Step 2: Create activation_codes table
CREATE TABLE IF NOT EXISTS public.activation_codes (
  code TEXT PRIMARY KEY,
  max_uses INT DEFAULT 1,
  used_count INT DEFAULT 0,
  plan_type TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Step 3: Update handle_new_user to also create user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_collection_id uuid;
BEGIN
  -- Create user profile
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  
  -- Create default collection
  INSERT INTO public.collections (user_id, name, is_default)
  VALUES (NEW.id, 'My Collection', true)
  RETURNING id INTO new_collection_id;
  
  -- Create default folder
  INSERT INTO public.folders (user_id, collection_id, name, is_default)
  VALUES (NEW.id, new_collection_id, 'My Notes', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create redemption function
CREATE OR REPLACE FUNCTION public.redeem_activation_code(input_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  code_record RECORD;
  user_status BOOLEAN;
BEGIN
  -- Ensure user profile exists
  INSERT INTO public.user_profiles (id, email, is_active)
  SELECT auth.uid(), 
         (SELECT email FROM auth.users WHERE id = auth.uid()), 
         false
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = auth.uid()
  );
  
  -- Check if already activated
  SELECT is_active INTO user_status FROM public.user_profiles WHERE id = auth.uid();
  IF user_status = true THEN
    RETURN 'Already activated';
  END IF;

  -- Find and lock activation code
  SELECT * INTO code_record FROM public.activation_codes 
  WHERE code = input_code FOR UPDATE;

  -- Validate code
  IF code_record IS NULL THEN
    RETURN 'Invalid code';
  END IF;

  IF code_record.used_count >= code_record.max_uses THEN
    RETURN 'Code fully used';
  END IF;

  -- Execute activation
  UPDATE public.activation_codes 
  SET used_count = used_count + 1 
  WHERE code = input_code;

  UPDATE public.user_profiles 
  SET is_active = true, 
      plan_type = code_record.plan_type 
  WHERE id = auth.uid();

  RETURN 'Success';
END;
$$;

-- Step 5: Create profiles for existing users who don't have one
INSERT INTO public.user_profiles (id, email)
SELECT u.id, u.email
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles p WHERE p.id = u.id
);

-- Step 6: Update notes INSERT policy to require activation
DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;

CREATE POLICY "Active users can insert notes" 
  ON public.notes FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND 
    (SELECT is_active FROM public.user_profiles WHERE id = auth.uid()) = true
  );
