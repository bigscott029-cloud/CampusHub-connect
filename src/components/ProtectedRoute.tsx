import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, isGracePeriodExpired, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Soft Onboarding: After 7 days, if email is still unverified, display gentle lock screen with WhatsApp support (08051454564)
  if (isGracePeriodExpired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 rounded-2xl glass-card border border-amber-500/30 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
            <Loader2 className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-display font-bold">Email Verification Required</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your 7-day grace period has concluded. To keep CampusHub a trusted community, please verify your email address to continue access.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs text-left space-y-1">
            <p className="text-muted-foreground">Account: <strong className="text-foreground">{user.email}</strong></p>
            <p className="text-muted-foreground">Status: <span className="text-amber-500 font-semibold">Unverified (Saved in DB)</span></p>
          </div>

          <div className="space-y-2 pt-2">
            <a
              href={`https://wa.me/2348051454564?text=${encodeURIComponent(
                `Hello CampusHub Admin, my email is ${user.email}. Please help me verify and activate my account.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <button
                type="button"
                className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
              >
                Instant WhatsApp Verification (08051454564)
              </button>
            </a>

            <button
              type="button"
              onClick={signOut}
              className="w-full h-9 rounded-xl border border-border/80 text-xs text-muted-foreground hover:text-foreground"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
