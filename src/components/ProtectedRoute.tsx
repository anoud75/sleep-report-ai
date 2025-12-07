import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireApproval?: boolean;
  requireOrgApproval?: boolean;
  requireSuperAdmin?: boolean;
  requireOrgAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireApproval = true,
  requireOrgApproval = true,
  requireSuperAdmin = false,
  requireOrgAdmin = false,
}) => {
  const { user, isLoading, isApproved, isOrgApproved, isSuperAdmin, isOrgAdmin, profile } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireOrgAdmin && !isOrgAdmin && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireApproval && !isApproved && !isSuperAdmin) {
    return <Navigate to="/pending-approval" replace />;
  }

  if (requireOrgApproval && profile?.organization_id && !isOrgApproved && !isSuperAdmin) {
    return <Navigate to="/org-pending" replace />;
  }

  return <>{children}</>;
};
