REVOKE EXECUTE ON FUNCTION public.is_couple_member(), public.is_partner() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_couple_member(), public.is_partner() TO service_role;