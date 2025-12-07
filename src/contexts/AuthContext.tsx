import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'member' | 'super_admin';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  organization_id: string | null;
  is_approved: boolean;
}

interface Organization {
  id: string;
  name: string;
  is_approved: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  organization: Organization | null;
  roles: AppRole[];
  isLoading: boolean;
  isApproved: boolean;
  isOrgApproved: boolean;
  isSuperAdmin: boolean;
  isOrgAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, organizationName?: string, joinOrganizationId?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, organization_id, is_approved')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      setProfile(profileData);

      if (profileData?.organization_id) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name, is_approved')
          .eq('id', profileData.organization_id)
          .single();

        if (!orgError && orgData) {
          setOrganization(orgData);
        }
      }

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (!rolesError && rolesData) {
        setRoles(rolesData.map(r => r.role as AppRole));
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setOrganization(null);
          setRoles([]);
        }

        if (event === 'SIGNED_OUT') {
          setIsLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    organizationName?: string,
    joinOrganizationId?: string
  ) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { error: error as Error };
    }

    if (data.user) {
      let orgId: string | null = null;
      let isNewOrg = false;

      if (organizationName) {
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert({ name: organizationName, is_approved: false })
          .select()
          .single();

        if (orgError) {
          console.error('Error creating organization:', orgError);
          return { error: new Error('Failed to create organization') };
        }

        orgId = newOrg.id;
        isNewOrg = true;
      } else if (joinOrganizationId) {
        orgId = joinOrganizationId;
      }

      if (orgId) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ organization_id: orgId })
          .eq('id', data.user.id);

        if (updateError) {
          console.error('Error updating profile with organization:', updateError);
        }
      }

      const roleToAssign = isNewOrg ? 'admin' : 'member';
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: data.user.id, role: roleToAssign });

      if (roleError) {
        console.error('Error assigning role:', roleError);
      }

      try {
        await supabase.functions.invoke('send-registration-notification', {
          body: {
            userId: data.user.id,
            userEmail: email,
            userName: fullName,
            organizationId: orgId,
            organizationName: organizationName || null,
            isNewOrganization: isNewOrg,
          },
        });
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setOrganization(null);
    setRoles([]);
  };

  const isApproved = profile?.is_approved ?? false;
  const isOrgApproved = organization?.is_approved ?? false;
  const isSuperAdmin = roles.includes('super_admin');
  const isOrgAdmin = roles.includes('admin');

  const value: AuthContextType = {
    user,
    session,
    profile,
    organization,
    roles,
    isLoading,
    isApproved,
    isOrgApproved,
    isSuperAdmin,
    isOrgAdmin,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
