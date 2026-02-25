-- 1. Drop the profiles_public view (depends on email column)
DROP VIEW IF EXISTS public.profiles_public;

-- 2. Drop email column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- 3. Update handle_new_user trigger to stop inserting email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
    );
    RETURN NEW;
END;
$$;

-- 4. Recreate profiles_public view without email
CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT id, full_name, organization_id, is_approved, created_at, updated_at
  FROM public.profiles;