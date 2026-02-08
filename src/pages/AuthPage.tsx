import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { z } from 'zod';
import { motion } from 'framer-motion';
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
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', confirmPassword: '', fullName: '' });
  const [errors, setErrors] = useState<any>({});
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-secondary/10 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 hex-pattern opacity-20 pointer-events-none" />
      <motion.div
        className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.2, 0.3] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="w-full bg-card border-border shadow-xl">
          <CardHeader className="text-center flex flex-col items-center gap-4">
            <Link to="/" className="flex flex-col items-center gap-3">
              <motion.img 
                src={logo} 
                alt="UrbanSoko" 
                className="h-20 w-20 object-contain"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              />
              <CardTitle className="text-3xl font-bold text-gradient-cyber">UrbanSoko</CardTitle>
            </Link>
            <div className="flex items-center gap-2">
              <CardDescription className="text-muted-foreground">
                Africa's Next-Gen Marketplace
              </CardDescription>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={toggleTheme} 
                className="h-8 w-8"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-foreground">Email</Label>
                    <Input 
                      id="signin-email"
                      type="email" 
                      value={signInData.email} 
                      onChange={e => setSignInData({...signInData, email: e.target.value})} 
                      className="bg-background border-input text-foreground"
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={isLoading}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-foreground">Password</Label>
                    <div className="relative">
                      <Input 
                        id="signin-password"
                        type={showSignInPassword ? "text" : "password"} 
                        value={signInData.password} 
                        onChange={e => setSignInData({...signInData, password: e.target.value})} 
                        className="pr-10 bg-background border-input text-foreground"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isLoading}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" 
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        disabled={isLoading}
                      >
                        {showSignInPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname" className="text-foreground">Full Name</Label>
                    <Input 
                      id="signup-fullname"
                      type="text" 
                      value={signUpData.fullName} 
                      onChange={e => setSignUpData({...signUpData, fullName: e.target.value})} 
                      className="bg-background border-input text-foreground"
                      placeholder="John Doe"
                      autoComplete="name"
                      disabled={isLoading}
                    />
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                    <Input 
                      id="signup-email"
                      type="email" 
                      value={signUpData.email} 
                      onChange={e => setSignUpData({...signUpData, email: e.target.value})} 
                      className="bg-background border-input text-foreground"
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={isLoading}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                    <div className="relative">
                      <Input 
                        id="signup-password"
                        type={showSignUpPassword ? "text" : "password"} 
                        value={signUpData.password} 
                        onChange={e => setSignUpData({...signUpData, password: e.target.value})} 
                        className="pr-10 bg-background border-input text-foreground"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isLoading}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" 
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        disabled={isLoading}
                      >
                        {showSignUpPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="text-foreground">Confirm Password</Label>
                    <div className="relative">
                      <Input 
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"} 
                        value={signUpData.confirmPassword} 
                        onChange={e => setSignUpData({...signUpData, confirmPassword: e.target.value})} 
                        className="pr-10 bg-background border-input text-foreground"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isLoading}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <p className="text-center text-sm text-muted-foreground mt-6">
              By continuing, you agree to UrbanSoko's{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms</Link> and{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;
