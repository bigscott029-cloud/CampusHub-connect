import * as Sentry from "@sentry/react";

export const initMonitoring = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

  if (!dsn) {
    return;
  }

  const environment = (import.meta.env.VITE_SENTRY_ENVIRONMENT as string | undefined) || import.meta.env.MODE;
  const isProduction = environment === "production";

  Sentry.init({
    dsn,
    environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: isProduction ? 0.2 : 1,
    replaysSessionSampleRate: isProduction ? 0.05 : 0,
    replaysOnErrorSampleRate: 1,
  });
};

export const MonitoringErrorBoundary = Sentry.ErrorBoundary;
