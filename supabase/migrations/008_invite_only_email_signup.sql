-- Migration: Invite-only email signup enforcement
-- Date: 2026-03-18
--
-- Objective:
-- 1) Keep public app UI free of email self-serve signup entry
-- 2) Enforce invite-only email registration in backend/auth flow
-- 3) Make invite matching case-insensitive
-- 4) Reject uninvited email registrations before auth user creation

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.email_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_normalized TEXT NOT NULL UNIQUE,
  invite_token TEXT NOT NULL UNIQUE,
  invite_policy TEXT NOT NULL DEFAULT 'one_time' CHECK (invite_policy IN ('one_time', 'reusable')),
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  consumed_at TIMESTAMP WITH TIME ZONE,
  consumed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  CHECK (email_normalized = lower(btrim(email_normalized)))
);

ALTER TABLE public.email_invites ENABLE ROW LEVEL SECURITY;

-- No RLS policies for anon/authenticated users by default.
REVOKE ALL ON TABLE public.email_invites FROM anon;
REVOKE ALL ON TABLE public.email_invites FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.email_invites TO service_role;

CREATE OR REPLACE FUNCTION public.normalize_email(input_email TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT NULLIF(lower(btrim(input_email)), '');
$$;

-- Admin-only helper to issue/reset invite for an email.
-- Returns token for delivery via admin-owned channel.
CREATE OR REPLACE FUNCTION public.create_email_invite(
  input_email TEXT,
  input_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  input_policy TEXT DEFAULT 'one_time'
)
RETURNS TABLE (
  email_normalized TEXT,
  invite_token TEXT,
  invite_policy TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_email TEXT;
  token TEXT;
BEGIN
  normalized_email := public.normalize_email(input_email);

  IF normalized_email IS NULL THEN
    RAISE EXCEPTION 'invalid_email';
  END IF;

  IF input_policy NOT IN ('one_time', 'reusable') THEN
    RAISE EXCEPTION 'invalid_invite_policy';
  END IF;

  token := encode(gen_random_bytes(24), 'hex');

  INSERT INTO public.email_invites (
    email_normalized,
    invite_token,
    invite_policy,
    expires_at,
    revoked_at,
    consumed_at,
    consumed_by,
    updated_at
  )
  VALUES (
    normalized_email,
    token,
    input_policy,
    input_expires_at,
    NULL,
    NULL,
    NULL,
    timezone('utc'::text, now())
  )
  ON CONFLICT (email_normalized)
  DO UPDATE
    SET invite_token = EXCLUDED.invite_token,
        invite_policy = EXCLUDED.invite_policy,
        expires_at = EXCLUDED.expires_at,
        revoked_at = NULL,
        consumed_at = NULL,
        consumed_by = NULL,
        updated_at = timezone('utc'::text, now());

  RETURN QUERY
  SELECT
    ei.email_normalized,
    ei.invite_token,
    ei.invite_policy,
    ei.expires_at
  FROM public.email_invites ei
  WHERE ei.email_normalized = normalized_email;
END;
$$;

REVOKE ALL ON FUNCTION public.create_email_invite(TEXT, TIMESTAMP WITH TIME ZONE, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_email_invite(TEXT, TIMESTAMP WITH TIME ZONE, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.revoke_email_invite(input_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_email TEXT;
BEGIN
  normalized_email := public.normalize_email(input_email);

  IF normalized_email IS NULL THEN
    RAISE EXCEPTION 'invalid_email';
  END IF;

  UPDATE public.email_invites
  SET revoked_at = timezone('utc'::text, now()),
      updated_at = timezone('utc'::text, now())
  WHERE email_normalized = normalized_email;
END;
$$;

REVOKE ALL ON FUNCTION public.revoke_email_invite(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_email_invite(TEXT) TO service_role;

-- Helper for diagnostics and optional backend checks.
CREATE OR REPLACE FUNCTION public.is_email_invited(input_email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.email_invites ei
    WHERE ei.email_normalized = public.normalize_email(input_email)
      AND ei.revoked_at IS NULL
      AND (ei.expires_at IS NULL OR ei.expires_at > timezone('utc'::text, now()))
      AND (
        ei.invite_policy = 'reusable'
        OR (ei.invite_policy = 'one_time' AND ei.consumed_at IS NULL)
      )
  );
$$;

REVOKE ALL ON FUNCTION public.is_email_invited(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_email_invited(TEXT) TO service_role;

-- BEFORE INSERT guard:
-- - Applies only to email provider registrations
-- - Blocks uninvited emails (case-insensitive)
-- - Blocks expired/revoked invites
-- - Blocks reused one-time invites
CREATE OR REPLACE FUNCTION public.enforce_invite_only_email_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  provider TEXT;
  normalized_email TEXT;
  invite_record public.email_invites%ROWTYPE;
BEGIN
  provider := COALESCE(NEW.raw_app_meta_data ->> 'provider', '');

  -- Keep non-email providers unchanged (out of scope for this feature).
  IF provider <> 'email' THEN
    RETURN NEW;
  END IF;

  normalized_email := public.normalize_email(NEW.email);

  IF normalized_email IS NULL THEN
    RAISE EXCEPTION 'invite_required';
  END IF;

  SELECT *
  INTO invite_record
  FROM public.email_invites ei
  WHERE ei.email_normalized = normalized_email
    AND ei.revoked_at IS NULL
    AND (ei.expires_at IS NULL OR ei.expires_at > timezone('utc'::text, now()))
  LIMIT 1
  FOR UPDATE;

  IF invite_record.id IS NULL THEN
    RAISE EXCEPTION 'invite_required';
  END IF;

  IF invite_record.invite_policy = 'one_time' AND invite_record.consumed_at IS NOT NULL THEN
    RAISE EXCEPTION 'invite_already_used';
  END IF;

  RETURN NEW;
END;
$$;

-- AFTER INSERT consume step (one-time policy only).
-- Runs only after user insertion succeeds, so rejected attempts create no auth/profile records.
CREATE OR REPLACE FUNCTION public.consume_email_invite_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  provider TEXT;
  normalized_email TEXT;
BEGIN
  provider := COALESCE(NEW.raw_app_meta_data ->> 'provider', '');

  IF provider <> 'email' THEN
    RETURN NEW;
  END IF;

  normalized_email := public.normalize_email(NEW.email);

  UPDATE public.email_invites
  SET consumed_at = timezone('utc'::text, now()),
      consumed_by = NEW.id,
      updated_at = timezone('utc'::text, now())
  WHERE email_normalized = normalized_email
    AND invite_policy = 'one_time'
    AND consumed_at IS NULL
    AND revoked_at IS NULL
    AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now()));

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_invite_only_email_signup ON auth.users;
CREATE TRIGGER enforce_invite_only_email_signup
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_invite_only_email_signup();

DROP TRIGGER IF EXISTS consume_email_invite_on_signup ON auth.users;
CREATE TRIGGER consume_email_invite_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.consume_email_invite_on_signup();
