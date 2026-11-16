// Staff sign-in: who is using the app.
import type { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Auth = {
  session: Session | null;
  /** True until the saved sign-in has been checked. */
  loading: boolean;
  /** Name shown on Team messages. */
  displayName: string;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const user = session?.user;
  const meta = (user?.user_metadata ?? {}) as { name?: string; full_name?: string; display_name?: string };
  const fromEmail = user?.email ? user.email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';
  const displayName = meta.name || meta.full_name || meta.display_name || fromEmail || 'Staff';

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (!error) return null;
    if (/invalid login credentials/i.test(error.message)) return 'That email and password do not match. Check them and try again.';
    if (/email not confirmed/i.test(error.message)) return 'This account has not been confirmed yet. Ask your manager to confirm it in Supabase.';
    if (/fetch|network/i.test(error.message)) return "Can't reach the Scratch Kitchen database. Check the phone's internet connection and try again.";
    return error.message;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return <AuthContext.Provider value={{ session, loading, displayName, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
  const a = useContext(AuthContext);
  if (!a) throw new Error('useAuth must be used inside AuthProvider');
  return a;
}
