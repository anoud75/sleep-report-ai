
-- Create a public view that excludes email
CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT id, full_name, created_at, updated_at, is_approved, organization_id
  FROM public.profiles;

-- Block direct SELECT on the base table for non-owners
-- Drop existing permissive SELECT policies and replace with tighter ones
DROP POLICY IF EXISTS "Approved users can view profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;

-- Users can only SELECT their own row from the base table
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (id = auth.uid());

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles"
ON public.profiles FOR SELECT
USING (is_super_admin(auth.uid()));
