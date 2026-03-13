import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import logo from '@/assets/logo.png';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try { emailSchema.parse(email); } catch { setError('Please enter a valid email address'); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast({ title: 'Reset email sent', description: 'Check your inbox for the password reset link.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm">
        <Card className="border-border">
          <CardHeader className="text-center space-y-2">
            <Link to="/" className="flex flex-col items-center gap-2">
              <img src={logo} alt="UrbanSoko" className="h-10 w-10 object-contain rounded-lg" />
              <CardTitle className="text-lg font-semibold">Reset Password</CardTitle>
            </Link>
            <CardDescription className="text-sm">
              {sent ? 'Check your email' : 'Enter your email to receive a reset link'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  We've sent a reset link to <strong>{email}</strong>.
                </p>
                <Button variant="outline" className="w-full" size="sm" onClick={() => setSent(false)}>
                  <Mail className="mr-2 h-4 w-4" /> Try a different email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required disabled={loading} />
                  {error && <p className="text-xs text-destructive">{error}</p>}
                </div>
                <Button type="submit" className="w-full h-10" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            )}
            <div className="mt-4 text-center">
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
