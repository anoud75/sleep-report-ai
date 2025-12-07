-- =============================================
-- MULTI-TENANT SLEEP STUDY PLATFORM - DATABASE SETUP
-- =============================================

-- 1. Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

-- 2. Create organizations table
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 3. Create profiles table (links users to organizations)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id),
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Create sleep_study_results table
CREATE TABLE public.sleep_study_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    file_name TEXT,
    file_path TEXT,
    study_type TEXT CHECK (study_type IN ('Diagnostic', 'Titration', 'Split-Night')),
    patient_info JSONB,
    clinical_data JSONB,
    extracted_data JSONB,
    clinical_summary TEXT,
    recommendations JSONB,
    clinical_interpretation JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sleep_study_results ENABLE ROW LEVEL SECURITY;

-- 6. Create security definer functions (avoid RLS recursion)

-- Function to get user's organization_id
CREATE OR REPLACE FUNCTION public.get_user_organization_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT organization_id FROM public.profiles WHERE id = _user_id
$$;

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to check if user is admin of their organization
CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'admin')
$$;

-- 7. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER set_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_sleep_study_results_updated_at
    BEFORE UPDATE ON public.sleep_study_results
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
        NEW.email
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- RLS POLICIES
-- =============================================

-- Organizations policies
CREATE POLICY "Users can view their own organization"
    ON public.organizations FOR SELECT
    TO authenticated
    USING (id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Admins can update their organization"
    ON public.organizations FOR UPDATE
    TO authenticated
    USING (id = public.get_user_organization_id(auth.uid()) AND public.is_org_admin(auth.uid()));

CREATE POLICY "Anyone can create an organization"
    ON public.organizations FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Profiles policies
CREATE POLICY "Users can view profiles in their organization"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (organization_id = public.get_user_organization_id(auth.uid()) OR id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "System can insert profiles"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- User roles policies
CREATE POLICY "Users can view roles in their organization"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (
        user_id IN (
            SELECT p.id FROM public.profiles p 
            WHERE p.organization_id = public.get_user_organization_id(auth.uid())
        )
    );

CREATE POLICY "Admins can manage roles in their organization"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (
        public.is_org_admin(auth.uid()) AND
        user_id IN (
            SELECT p.id FROM public.profiles p 
            WHERE p.organization_id = public.get_user_organization_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert their own initial role"
    ON public.user_roles FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Sleep study results policies (organization isolation)
CREATE POLICY "Users can view their organization's studies"
    ON public.sleep_study_results FOR SELECT
    TO authenticated
    USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can insert studies for their organization"
    ON public.sleep_study_results FOR INSERT
    TO authenticated
    WITH CHECK (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update their organization's studies"
    ON public.sleep_study_results FOR UPDATE
    TO authenticated
    USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Admins can delete their organization's studies"
    ON public.sleep_study_results FOR DELETE
    TO authenticated
    USING (organization_id = public.get_user_organization_id(auth.uid()) AND public.is_org_admin(auth.uid()));

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create organization-logos bucket (public for display in PDFs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-logos', 'organization-logos', true);

-- Create sleep-studies bucket (private, org-isolated)
INSERT INTO storage.buckets (id, name, public)
VALUES ('sleep-studies', 'sleep-studies', false);

-- Storage policies for organization-logos
CREATE POLICY "Anyone can view organization logos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'organization-logos');

CREATE POLICY "Admins can upload their org logo"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'organization-logos' AND
        public.is_org_admin(auth.uid()) AND
        (storage.foldername(name))[1] = public.get_user_organization_id(auth.uid())::text
    );

CREATE POLICY "Admins can update their org logo"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'organization-logos' AND
        public.is_org_admin(auth.uid()) AND
        (storage.foldername(name))[1] = public.get_user_organization_id(auth.uid())::text
    );

CREATE POLICY "Admins can delete their org logo"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'organization-logos' AND
        public.is_org_admin(auth.uid()) AND
        (storage.foldername(name))[1] = public.get_user_organization_id(auth.uid())::text
    );

-- Storage policies for sleep-studies (organization isolated)
CREATE POLICY "Users can view their org's study files"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'sleep-studies' AND
        (storage.foldername(name))[1] = public.get_user_organization_id(auth.uid())::text
    );

CREATE POLICY "Users can upload study files for their org"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'sleep-studies' AND
        (storage.foldername(name))[1] = public.get_user_organization_id(auth.uid())::text
    );

CREATE POLICY "Users can delete their org's study files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'sleep-studies' AND
        (storage.foldername(name))[1] = public.get_user_organization_id(auth.uid())::text
    );