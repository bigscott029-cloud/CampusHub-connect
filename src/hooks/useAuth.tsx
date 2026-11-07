import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isEmailVerified: boolean;
  isGracePeriodExpired: boolean;
  gracePeriodDaysRemaining: number;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    options?: {
      universityId?: string;
      userType?: string;
      homeState?: string;
      homeRegion?: string;
      username?: string;
      phoneNumber?: string;
      referralCode?: string;
    },
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    options?: {
      universityId?: string;
      userType?: string;
      homeState?: string;
      homeRegion?: string;
      username?: string;
      phoneNumber?: string;
      referralCode?: string;
    },
  ) => {
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/login&verified=1`,
        data: {
          display_name: displayName,
          username: options?.username,
          university_id: options?.universityId,
          user_type: options?.userType,
          home_state: options?.homeState,
          home_region: options?.homeRegion,
          phone_number: options?.phoneNumber,
          referral_code: options?.referralCode,
        },
      },
    });

    if (!error && data.user) {
      await (supabase as any)
        .from("profiles")
        .update({
          university_id: options?.universityId || null,
          username: options?.username || null,
          user_type: options?.userType || "student",
          home_state: options?.homeState || null,
          home_region: options?.homeRegion || null,
          phone_number: options?.phoneNumber || null,
        })
        .eq("user_id", data.user.id);

      // Soft onboarding: If no session was returned due to Supabase email verification setting, attempt instant signin
      if (!data.session) {
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    return { error };
  };

  const resetPasswordForEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password&type=recovery`,
    });

    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isEmailVerified = Boolean(user?.email_confirmed_at);
  const userCreatedAt = user?.created_at ? new Date(user.created_at) : new Date();
  const msElapsed = Date.now() - userCreatedAt.getTime();
  const daysElapsed = msElapsed / (1000 * 60 * 60 * 24);
  const gracePeriodDaysRemaining = Math.max(0, Math.ceil(7 - daysElapsed));
  const isGracePeriodExpired = !isEmailVerified && daysElapsed > 7;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isEmailVerified,
        isGracePeriodExpired,
        gracePeriodDaysRemaining,
        signUp,
        signIn,
        resetPasswordForEmail,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
