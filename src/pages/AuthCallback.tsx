import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const finishAuthRedirect = async () => {
      const requestedNext = searchParams.get("next") || "/login";
      const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/login";
      const code = searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          toast({
            title: "Verification failed",
            description: error.message,
            variant: "destructive",
          });
          navigate("/login", { replace: true });
          return;
        }
      }

      const nextParams = new URLSearchParams();

      if (searchParams.get("verified")) {
        nextParams.set("verified", "1");
      }

      if (searchParams.get("type") === "recovery") {
        nextParams.set("type", "recovery");
      }

      const query = nextParams.toString();
      navigate(`${next}${query ? `?${query}` : ""}`, { replace: true });
    };

    finishAuthRedirect();
  }, [navigate, searchParams, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <div>
          <h1 className="text-xl font-semibold">Securing your session</h1>
          <p className="text-sm text-muted-foreground">CampusHub is completing the verification flow.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
