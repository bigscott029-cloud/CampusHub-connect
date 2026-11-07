export type AudiencePersona = "student" | "trader_agent" | "community" | "explorer";

const AUDIENCE_KEY = "campushub_last_audience";
const SPLASH_SEEN_KEY = "campushub_splash_seen_session";

export const isStandalonePWA = (): boolean => {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as unknown as { standalone?: boolean }).standalone) ||
    document.referrer.includes("android-app://")
  );
};

export const getSavedAudience = (): AudiencePersona => {
  if (typeof window === "undefined") return "student";
  const saved = localStorage.getItem(AUDIENCE_KEY);
  if (saved === "student" || saved === "trader_agent" || saved === "community" || saved === "explorer") {
    return saved;
  }
  return "student";
};

export const setSavedAudience = (audience: AudiencePersona): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUDIENCE_KEY, audience);
};

export const hasSeenSessionSplash = (): boolean => {
  if (typeof window === "undefined") return true;
  return sessionStorage.getItem(SPLASH_SEEN_KEY) === "true";
};

export const markSessionSplashSeen = (): void => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SPLASH_SEEN_KEY, "true");
};

export interface GracePeriodInfo {
  isExpired: boolean;
  daysRemaining: number;
  gracePeriodEndsAt: Date;
}

export const calculateGracePeriod = (createdAtIso?: string | null): GracePeriodInfo => {
  const created = createdAtIso ? new Date(createdAtIso) : new Date();
  const GRACE_PERIOD_DAYS = 7;
  const gracePeriodEndsAt = new Date(created.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
  const now = new Date();
  const msRemaining = gracePeriodEndsAt.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

  return {
    isExpired: msRemaining <= 0,
    daysRemaining,
    gracePeriodEndsAt,
  };
};
