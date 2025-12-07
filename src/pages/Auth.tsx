import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Eye, EyeOff, Building2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { SleepLogo } from '@/components/SleepLogo';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  orgOption: z.enum(['create', 'join']),
  organizationName: z.string().optional(),
  joinOrganizationId: z.string().optional(),
});

interface Organization {
  id: string;
  name: string;
}

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, isApproved, isOrgApproved, isSuperAdmin } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [orgOption, setOrgOption] = useState<'create' | 'join'>('create');
  const [organizationName, setOrganizationName] = useState('');
  const [joinOrganizationId, setJoinOrganizationId] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      if (isSuperAdmin) {
        navigate('/super-admin');
      } else if (isApproved && isOrgApproved) {
        navigate('/analysis');
      } else if (!isApproved) {
        navigate('/pending-approval');
      } else if (!isOrgApproved) {
        navigate('/org-pending');
      }
    }
  }, [user, isApproved, isOrgApproved, isSuperAdmin, navigate]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('is_approved', true);
      
      if (!error && data) {
        setOrganizations(data);
      }
    };
    
    if (!isLogin) {
      fetchOrganizations();
    }
  }, [isLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    
    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Please confirm your email address');
      } else {
        toast.error(error.message);
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const validation = signupSchema.safeParse({
      fullName,
      email,
      password,
      orgOption,
      organizationName: orgOption === 'create' ? organizationName : undefined,
      joinOrganizationId: orgOption === 'join' ? joinOrganizationId : undefined,
    });
    
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    
    if (orgOption === 'create' && !organizationName.trim()) {
      setErrors({ organizationName: 'Organization name is required' });
      return;
    }
    
    if (orgOption === 'join' && !joinOrganizationId) {
      setErrors({ joinOrganizationId: 'Please select an organization' });
      return;
    }
    
    setIsSubmitting(true);
    const { error } = await signUp(
      email,
      password,
      fullName,
      orgOption === 'create' ? organizationName : undefined,
      orgOption === 'join' ? joinOrganizationId : undefined
    );
    setIsSubmitting(false);
    
    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Please login instead.');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Registration successful. Please check your email to confirm your account.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <SleepLogo size={48} />
          <span className="text-2xl font-brockmann font-bold text-primary-foreground">
            Sleep Report AI
          </span>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-brockmann font-bold text-primary-foreground leading-tight">
            Transform Sleep Studies Into Professional Reports
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Streamline your workflow with AI-powered analysis and reporting for sleep medicine professionals.
          </p>
        </div>
        
        <div className="text-sm text-primary-foreground/60">
          Trusted by sleep medicine professionals worldwide
        </div>
      </div>
      
      {/* Right Panel - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <SleepLogo size={40} />
            <span className="text-xl font-brockmann font-bold text-foreground">
              Sleep Report AI
            </span>
          </div>
          
          {/* Form Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-brockmann font-bold text-foreground">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-muted-foreground">
              {isLogin 
                ? 'Sign in to access your dashboard' 
                : 'Register to get started with Sleep Report AI'
              }
            </p>
          </div>
          
          {/* Toggle */}
          <div className="flex rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                isLogin 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                !isLogin 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>
          
          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          ) : (
            /* Signup Form */
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Dr. John Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={errors.fullName ? 'border-destructive' : ''}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signupEmail">Email</Label>
                <Input
                  id="signupEmail"
                  type="email"
                  placeholder="you@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signupPassword">Password</Label>
                <div className="relative">
                  <Input
                    id="signupPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <Label>Organization</Label>
                <RadioGroup
                  value={orgOption}
                  onValueChange={(value) => setOrgOption(value as 'create' | 'join')}
                  className="grid grid-cols-2 gap-3"
                >
                  <Label
                    htmlFor="create"
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      orgOption === 'create'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="create" id="create" />
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Create New</span>
                    </div>
                  </Label>
                  <Label
                    htmlFor="join"
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      orgOption === 'join'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="join" id="join" />
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Join Existing</span>
                    </div>
                  </Label>
                </RadioGroup>
              </div>
              
              {orgOption === 'create' ? (
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    type="text"
                    placeholder="Hospital or Clinic Name"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className={errors.organizationName ? 'border-destructive' : ''}
                  />
                  {errors.organizationName && (
                    <p className="text-sm text-destructive">{errors.organizationName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    You will be the administrator of this organization
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="joinOrganization">Select Organization</Label>
                  <Select value={joinOrganizationId} onValueChange={setJoinOrganizationId}>
                    <SelectTrigger className={errors.joinOrganizationId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Choose an organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No organizations available
                        </SelectItem>
                      ) : (
                        organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.joinOrganizationId && (
                    <p className="text-sm text-destructive">{errors.joinOrganizationId}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Your request will be sent to the organization admin for approval
                  </p>
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
