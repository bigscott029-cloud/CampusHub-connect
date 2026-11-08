import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

// 20 minutes of inactivity before auto-logout
const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000;

export const useInactivityLogout = () => {
  const { user, signOut } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        // Cache user info for one-tap resume before logging out
        try {
          if (user.user_metadata?.display_name) {
            localStorage.setItem(
              "campushub_last_session_user",
              JSON.stringify({
                displayName: user.user_metadata.display_name,
                username: user.user_metadata.username,
                email: user.email,
                avatarUrl: user.user_metadata.avatar_url,
                lastActiveAt: new Date().toISOString(),
              })
            );
          }
          await signOut();
          toast.info("Session expired due to inactivity. Please tap to sign back in.", {
            duration: 6000,
          });
        } catch {
          // ignore
        }
      }, INACTIVITY_TIMEOUT_MS);
    };

    const activityEvents = ["mousedown", "mousemove", "keydown", "touchstart", "scroll", "click"];

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, resetTimer);
      });
    };
  }, [user, signOut]);
};

export default useInactivityLogout;
