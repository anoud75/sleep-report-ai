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
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  LogOut,
  Loader2,
  Home,
  UserCheck,
  FileText
} from 'lucide-react';

interface TeamMember {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  is_approved: boolean;
  role: string | null;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, profile, organization } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTeamMembers = async () => {
    if (!organization?.id) return;
    
    setIsLoading(true);
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at, is_approved')
        .eq('organization_id', organization.id);

      if (membersError) throw membersError;

      // Get roles for each member
      const membersWithRoles = await Promise.all(
        (membersData || []).map(async (member) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', member.id)
            .single();
          
          return {
            ...member,
            role: roleData?.role || 'member',
          };
        })
      );

      setTeamMembers(membersWithRoles);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [organization?.id]);

  const approveMember = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', userId);

      if (error) throw error;

      // Send approval notification
      const member = teamMembers.find(m => m.id === userId);
      if (member?.email) {
        await supabase.functions.invoke('send-approval-notification', {
          body: {
            userEmail: member.email,
            userName: member.full_name,
            approved: true,
          },
        });
      }

      toast.success('Team member approved successfully');
      fetchTeamMembers();
    } catch (error) {
      console.error('Error approving member:', error);
      toast.error('Failed to approve team member');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectMember = async (userId: string) => {
    setActionLoading(userId);
    try {
      const member = teamMembers.find(m => m.id === userId);
      
      // Remove from organization instead of deleting
      const { error } = await supabase
        .from('profiles')
        .update({ organization_id: null })
        .eq('id', userId);

      if (error) throw error;

      // Send rejection notification
      if (member?.email) {
        await supabase.functions.invoke('send-approval-notification', {
          body: {
            userEmail: member.email,
            userName: member.full_name,
            approved: false,
          },
        });
      }

      toast.success('Team member request rejected');
      fetchTeamMembers();
    } catch (error) {
      console.error('Error rejecting member:', error);
      toast.error('Failed to reject team member');
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

  const pendingMembers = teamMembers.filter(m => !m.is_approved);
  const activeMembers = teamMembers.filter(m => m.is_approved);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SleepLogo size="md" />
            <div>
              <h1 className="text-xl font-brockmann font-bold text-foreground">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">{organization?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/analysis')}>
              <FileText className="mr-2 h-4 w-4" />
              Analysis
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold text-foreground">{teamMembers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <UserCheck className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                  <p className="text-2xl font-bold text-foreground">{activeMembers.length}</p>
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
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold text-foreground">{pendingMembers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
              {pendingMembers.length > 0 && (
                <Badge variant="secondary" className="ml-1">{pendingMembers.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Active Members
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>
                  Review and approve team members who want to join your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : pendingMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending requests
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.full_name || 'N/A'}</TableCell>
                          <TableCell>{member.email || 'N/A'}</TableCell>
                          <TableCell>{formatDate(member.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => approveMember(member.id)}
                                disabled={actionLoading === member.id}
                              >
                                {actionLoading === member.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectMember(member.id)}
                                disabled={actionLoading === member.id}
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

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active Team Members</CardTitle>
                <CardDescription>
                  All approved members of your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : activeMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active members
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            {member.full_name || 'N/A'}
                            {member.id === profile?.id && (
                              <Badge variant="outline" className="ml-2">You</Badge>
                            )}
                          </TableCell>
                          <TableCell>{member.email || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                              {member.role === 'admin' ? 'Admin' : 'Member'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(member.created_at)}</TableCell>
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

export default Admin;
