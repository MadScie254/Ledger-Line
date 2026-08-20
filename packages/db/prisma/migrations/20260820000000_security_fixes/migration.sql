-- Migration: 20260820000000_security_fixes
-- Security fixes for tenant isolation and function search paths

-- 1. Redefine ledgerline_org_id to only use app_metadata
CREATE OR REPLACE FUNCTION public.ledgerline_org_id() RETURNS text
  LANGUAGE sql STABLE SECURITY DEFINER
  SET search_path = public
  AS $$
    SELECT coalesce(
      (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'orgId'),
      ''
    )
  $$;

-- 2. Revoke EXECUTE from anon and authenticated
REVOKE EXECUTE ON FUNCTION public.ledgerline_org_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- 3. Set explicit search_path on trigger functions
ALTER FUNCTION public.enforce_balanced_journal_entry() SET search_path = public;
ALTER FUNCTION public.check_accounting_period_status() SET search_path = public;
