CREATE OR REPLACE FUNCTION public.ledgerline_org_id() 
RETURNS text 
LANGUAGE sql 
STABLE 
SECURITY DEFINER 
SET search_path = public 
AS $$ 
  SELECT coalesce( 
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'orgId'), 
    '' 
  ) 
$$;
