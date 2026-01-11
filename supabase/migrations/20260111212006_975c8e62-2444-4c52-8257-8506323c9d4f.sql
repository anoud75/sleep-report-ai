-- Drop the insecure policy that allows anyone to create organizations
DROP POLICY IF EXISTS "Anyone can create an organization" ON public.organizations;

-- Create a new secure policy that only allows super admins to create organizations
CREATE POLICY "Only super admins can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (is_super_admin(auth.uid()));