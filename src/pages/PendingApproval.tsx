import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Mail, LogOut } from 'lucide-react';
import { SleepLogo } from '@/components/SleepLogo';

const PendingApproval: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="mb-8 flex items-center gap-3">
        <SleepLogo size={48} />
        <span className="text-2xl font-brockmann font-bold text-foreground">
          Sleep Report AI
        </span>
      </div>

      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-2xl font-brockmann">Account Pending Approval</CardTitle>
          <CardDescription className="text-base">
            Your registration is complete, but your account needs to be approved before you can access the platform.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-foreground">{profile?.full_name || 'Not provided'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium text-foreground">{profile?.email || 'Not provided'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Pending Approval
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">What happens next?</p>
              <p className="text-sm text-muted-foreground">
                An administrator will review your registration and approve your account. You will receive an email notification once approved.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;
