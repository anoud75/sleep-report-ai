import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SleepLogo } from '@/components/SleepLogo';
import { toast } from 'sonner';
import { 
  Building2, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  LogOut,
  Loader2,
  Home
} from 'lucide-react';

interface PendingOrg {
  id: string;
  name: string;
  created_at: string;
  admin_name: string | null;
  admin_email: string | null;
}

interface PendingUser {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  organization_name: string | null;
  organization_id: string | null;
}

interface Stats {
  totalOrgs: number;
  pendingOrgs: number;
  totalUsers: number;
  pendingUsers: number;
  totalStudies: number;
}

const SuperAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [pendingOrgs, setPendingOrgs] = useState<PendingOrg[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalOrgs: 0,
    pendingOrgs: 0,
    totalUsers: 0,
    pendingUsers: 0,
    totalStudies: 0,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch pending organizations with admin info
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('id, name, created_at')
        .eq('is_approved', false);

      if (orgsError) throw orgsError;

      // Get admin info for each org
      const orgsWithAdmin = await Promise.all(
        (orgsData || []).map(async (org) => {
          const { data: adminData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('organization_id', org.id)
            .limit(1)
            .single();
          
          return {
            ...org,
            admin_name: adminData?.full_name || null,
            admin_email: adminData?.email || null,
          };
        })
      );

      setPendingOrgs(orgsWithAdmin);

      // Fetch pending users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at, organization_id')
        .eq('is_approved', false);

      if (usersError) throw usersError;

      // Get org names for users
      const usersWithOrg = await Promise.all(
        (usersData || []).map(async (user) => {
          let orgName = null;
          if (user.organization_id) {
            const { data: orgData } = await supabase
              .from('organizations')
              .select('name')
              .eq('id', user.organization_id)
              .single();
            orgName = orgData?.name || null;
          }
          return {
            ...user,
            organization_name: orgName,
          };
        })
      );

      setPendingUsers(usersWithOrg);

      // Fetch stats
      const { count: totalOrgsCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });

      const { count: pendingOrgsCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false);

      const { count: totalUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: pendingUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false);

      const { count: totalStudiesCount } = await supabase
        .from('sleep_study_results')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalOrgs: totalOrgsCount || 0,
        pendingOrgs: pendingOrgsCount || 0,
        totalUsers: totalUsersCount || 0,
        pendingUsers: pendingUsersCount || 0,
        totalStudies: totalStudiesCount || 0,
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const approveOrganization = async (orgId: string) => {
    setActionLoading(orgId);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ is_approved: true })
        .eq('id', orgId);

      if (error) throw error;

      // Also approve the admin user
      const { error: userError } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('organization_id', orgId);

      if (userError) throw userError;

      toast.success('Organization approved successfully');
      fetchData();
    } catch (error) {
      console.error('Error approving organization:', error);
      toast.error('Failed to approve organization');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectOrganization = async (orgId: string) => {
    setActionLoading(orgId);
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) throw error;

      toast.success('Organization rejected and removed');
      fetchData();
    } catch (error) {
      console.error('Error rejecting organization:', error);
      toast.error('Failed to reject organization');
    } finally {
      setActionLoading(null);
    }
  };

  const approveUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', userId);

      if (error) throw error;

      // Send approval notification
      const user = pendingUsers.find(u => u.id === userId);
      if (user?.email) {
        await supabase.functions.invoke('send-approval-notification', {
          body: {
            userEmail: user.email,
            userName: user.full_name,
            approved: true,
          },
        });
      }

      toast.success('User approved successfully');
      fetchData();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const user = pendingUsers.find(u => u.id === userId);
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Send rejection notification
      if (user?.email) {
        await supabase.functions.invoke('send-approval-notification', {
          body: {
            userEmail: user.email,
            userName: user.full_name,
            approved: false,
          },
        });
      }

      toast.success('User rejected and removed');
      fetchData();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Failed to reject user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SleepLogo size={36} />
            <div>
              <h1 className="text-xl font-brockmann font-bold text-foreground">Super Admin</h1>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orgs</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalOrgs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Orgs</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingOrgs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-500/10">
                  <Users className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Users</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Studies</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalStudies}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Pending Items */}
        <Tabs defaultValue="organizations" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="organizations" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Organizations
              {stats.pendingOrgs > 0 && (
                <Badge variant="secondary" className="ml-1">{stats.pendingOrgs}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
              {stats.pendingUsers > 0 && (
                <Badge variant="secondary" className="ml-1">{stats.pendingUsers}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organizations">
            <Card>
              <CardHeader>
                <CardTitle>Pending Organizations</CardTitle>
                <CardDescription>
                  Review and approve new organization registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : pendingOrgs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending organizations
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrgs.map((org) => (
                        <TableRow key={org.id}>
                          <TableCell className="font-medium">{org.name}</TableCell>
                          <TableCell>{org.admin_name || 'N/A'}</TableCell>
                          <TableCell>{org.admin_email || 'N/A'}</TableCell>
                          <TableCell>{formatDate(org.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => approveOrganization(org.id)}
                                disabled={actionLoading === org.id}
                              >
                                {actionLoading === org.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectOrganization(org.id)}
                                disabled={actionLoading === org.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Pending Users</CardTitle>
                <CardDescription>
                  Review and approve new user registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : pendingUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending users
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                          <TableCell>{user.email || 'N/A'}</TableCell>
                          <TableCell>{user.organization_name || 'No organization'}</TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => approveUser(user.id)}
                                disabled={actionLoading === user.id}
                              >
                                {actionLoading === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectUser(user.id)}
                                disabled={actionLoading === user.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SuperAdmin;
