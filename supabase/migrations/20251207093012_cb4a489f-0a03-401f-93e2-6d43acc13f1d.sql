-- Add is_approved column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Add is_approved column to organizations table
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'super_admin')
$$;

-- Update profiles RLS policies
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Approved users can view profiles in their organization"
ON public.profiles
FOR SELECT
USING (
    (SELECT is_approved FROM public.profiles WHERE id = auth.uid()) = true
    AND organization_id = get_user_organization_id(auth.uid())
);

CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update any profile"
ON public.profiles
FOR UPDATE
USING (is_super_admin(auth.uid()));

CREATE POLICY "Org admins can update profiles in their organization"
ON public.profiles
FOR UPDATE
USING (
    is_org_admin(auth.uid())
    AND organization_id = get_user_organization_id(auth.uid())
);

-- Organizations policies for super admin
CREATE POLICY "Super admins can view all organizations"
ON public.organizations
FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update all organizations"
ON public.organizations
FOR UPDATE
USING (is_super_admin(auth.uid()));

-- Update sleep_study_results policies
DROP POLICY IF EXISTS "Users can view their organization's studies" ON public.sleep_study_results;
CREATE POLICY "Approved users can view their organization's studies"
ON public.sleep_study_results
FOR SELECT
USING (
    organization_id = get_user_organization_id(auth.uid())
    AND (SELECT is_approved FROM public.profiles WHERE id = auth.uid()) = true
    AND (SELECT is_approved FROM public.organizations WHERE id = organization_id) = true
);

DROP POLICY IF EXISTS "Users can insert studies for their organization" ON public.sleep_study_results;
CREATE POLICY "Approved users can insert studies for their organization"
ON public.sleep_study_results
FOR INSERT
WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND (SELECT is_approved FROM public.profiles WHERE id = auth.uid()) = true
    AND (SELECT is_approved FROM public.organizations WHERE id = organization_id) = true
);

DROP POLICY IF EXISTS "Users can update their organization's studies" ON public.sleep_study_results;
CREATE POLICY "Approved users can update their organization's studies"
ON public.sleep_study_results
FOR UPDATE
USING (
    organization_id = get_user_organization_id(auth.uid())
    AND (SELECT is_approved FROM public.profiles WHERE id = auth.uid()) = true
    AND (SELECT is_approved FROM public.organizations WHERE id = organization_id) = true
);