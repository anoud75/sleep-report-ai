-- Fix security issue: Revoke public access to profiles and user_roles tables
-- These tables contain sensitive user data (emails, role information)

-- Revoke all privileges from anon role on profiles table
REVOKE ALL ON public.profiles FROM anon;

-- Revoke all privileges from anon role on user_roles table  
REVOKE ALL ON public.user_roles FROM anon;

-- Also revoke from public role to be thorough
REVOKE ALL ON public.profiles FROM public;
REVOKE ALL ON public.user_roles FROM public;

-- Ensure authenticated users still have access (RLS will control row-level access)
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- Note: The existing RLS policies will control which specific rows each user can access
-- - profiles: Users can view own profile, approved users can view org profiles, super admins can view all
-- - user_roles: Users can view roles in their org, admins can manage roles in their org