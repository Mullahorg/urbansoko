import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { z } from 'zod';

// Validation schemas
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
  const navigate = useNavigate();

  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', confirmPassword: '', fullName: '' });
  const [errors, setErrors] = useState<any>({});
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-accent/10">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-3xl font-bold">Male Afrique</CardTitle>
            <Button size="icon" variant="ghost" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
          <CardDescription>Welcome to Kenya's premier men's fashion store</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={signInData.email} onChange={e => setSignInData({...signInData, email: e.target.value})} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                {/* Password */}
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input type={showSignInPassword ? "text" : "password"} value={signInData.password} onChange={e => setSignInData({...signInData, password: e.target.value})} className="pr-10" />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowSignInPassword(!showSignInPassword)}>
                      {showSignInPassword ? <EyeOff className="h-4 w-4 text-muted-foreground"/> : <Eye className="h-4 w-4 text-muted-foreground"/>}
                    </Button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign In'}</Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input type="text" value={signUpData.fullName} onChange={e => setSignUpData({...signUpData, fullName: e.target.value})} />
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={signUpData.email} onChange={e => setSignUpData({...signUpData, email: e.target.value})} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input type={showSignUpPassword ? "text" : "password"} value={signUpData.password} onChange={e => setSignUpData({...signUpData, password: e.target.value})} className="pr-10" />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowSignUpPassword(!showSignUpPassword)}>
                      {showSignUpPassword ? <EyeOff className="h-4 w-4 text-muted-foreground"/> : <Eye className="h-4 w-4 text-muted-foreground"/>}
                    </Button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <Input type={showConfirmPassword ? "text" : "password"} value={signUpData.confirmPassword} onChange={e => setSignUpData({...signUpData, confirmPassword: e.target.value})} className="pr-10" />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground"/> : <Eye className="h-4 w-4 text-muted-foreground"/>}
                    </Button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Creating account...' : 'Create Account'}</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
