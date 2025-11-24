import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserRole = "admin" | "vendor" | "user";

export interface ExtendedUser extends User {}

interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any, user: ExtendedUser | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any, user: ExtendedUser | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

interface AuthProviderProps { children: ReactNode; }

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl, data: { full_name: fullName || '' } }
    });
    if (data?.user) setUser(data.user);
    if (error) toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    else toast({ title: "Account created!", description: "You can now sign in to your account." });
    return { error, user: data?.user || null };
  };

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (data?.user) setUser(data.user);
    if (error) toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    else toast({ title: "Welcome back!", description: "You've successfully signed in." });
    return { error, user: data?.user || null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    toast({ title: "Signed out", description: "You've been signed out successfully." });
  };

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
