import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { z } from 'zod';
import logo from '@/assets/logo.png';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { role, isAdmin, isVendor, loading: roleLoading } = useUserRole();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', confirmPassword: '', fullName: '' });
  const [errors, setErrors] = useState<any>({});
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!user || roleLoading) return;
    if (isAdmin) navigate('/admin', { replace: true });
    else if (isVendor) navigate('/vendor/dashboard', { replace: true });
    else navigate('/', { replace: true });
  }, [user, role, roleLoading, isAdmin, isVendor, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      signInSchema.parse(signInData);
      setIsLoading(true);
      await signIn(signInData.email, signInData.password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: any = {};
        error.errors.forEach(err => { fieldErrors[err.path[0]] = err.message; });
        setErrors(fieldErrors);
      }
    } finally { setIsLoading(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      signUpSchema.parse(signUpData);
      setIsLoading(true);
      await signUp(signUpData.email, signUpData.password, signUpData.fullName);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: any = {};
        error.errors.forEach(err => { fieldErrors[err.path[0]] = err.message; });
        setErrors(fieldErrors);
      }
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm">
        <Card className="border-border">
          <CardHeader className="text-center space-y-3">
            <Link to="/" className="flex flex-col items-center gap-2">
              <img src={logo} alt="UrbanSoko" className="h-12 w-12 object-contain rounded-lg" />
              <CardTitle className="text-xl font-semibold">UrbanSoko</CardTitle>
            </Link>
            <div className="flex items-center justify-center gap-2">
              <CardDescription>Sign in to your account</CardDescription>
              <Button size="icon" variant="ghost" onClick={toggleTheme} className="h-7 w-7">
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-email" className="text-sm">Email</Label>
                    <Input id="signin-email" type="email" value={signInData.email} onChange={e => setSignInData({...signInData, email: e.target.value})} placeholder="you@example.com" autoComplete="email" disabled={isLoading} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password" className="text-sm">Password</Label>
                      <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">Forgot?</Link>
                    </div>
                    <div className="relative">
                      <Input id="signin-password" type={showSignInPassword ? "text" : "password"} value={signInData.password} onChange={e => setSignInData({...signInData, password: e.target.value})} placeholder="••••••••" autoComplete="current-password" disabled={isLoading} className="pr-9" />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-2.5 hover:bg-transparent" onClick={() => setShowSignInPassword(!showSignInPassword)} disabled={isLoading}>
                        {showSignInPassword ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
                      </Button>
                    </div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                  <Button type="submit" className="w-full h-10" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-fullname" className="text-sm">Full Name</Label>
                    <Input id="signup-fullname" value={signUpData.fullName} onChange={e => setSignUpData({...signUpData, fullName: e.target.value})} placeholder="John Doe" autoComplete="name" disabled={isLoading} />
                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-sm">Email</Label>
                    <Input id="signup-email" type="email" value={signUpData.email} onChange={e => setSignUpData({...signUpData, email: e.target.value})} placeholder="you@example.com" autoComplete="email" disabled={isLoading} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-sm">Password</Label>
                    <div className="relative">
                      <Input id="signup-password" type={showSignUpPassword ? "text" : "password"} value={signUpData.password} onChange={e => setSignUpData({...signUpData, password: e.target.value})} placeholder="••••••••" autoComplete="new-password" disabled={isLoading} className="pr-9" />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-2.5 hover:bg-transparent" onClick={() => setShowSignUpPassword(!showSignUpPassword)} disabled={isLoading}>
                        {showSignUpPassword ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
                      </Button>
                    </div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-confirm" className="text-sm">Confirm Password</Label>
                    <div className="relative">
                      <Input id="signup-confirm" type={showConfirmPassword ? "text" : "password"} value={signUpData.confirmPassword} onChange={e => setSignUpData({...signUpData, confirmPassword: e.target.value})} placeholder="••••••••" autoComplete="new-password" disabled={isLoading} className="pr-9" />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-2.5 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}>
                        {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
                      </Button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                  </div>
                  <Button type="submit" className="w-full h-10" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-center text-xs text-muted-foreground mt-4">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="underline">Terms</Link> and{' '}
              <Link to="/privacy" className="underline">Privacy Policy</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
