# Production Auth And Routing

## Render SPA fallback

CampusHub uses React Router, so the static host must serve `index.html` for app routes.

Render dashboard:

- Source: `/*`
- Destination: `/index.html`
- Action: `Rewrite`

The repo also ships `public/_redirects` and `public/404.html` as fallback layers for static hosts that support them.

## Supabase Auth URLs

Set these in Supabase Dashboard > Authentication > URL Configuration.

- Site URL: `https://campushub-connect.onrender.com`
- Redirect URLs:
  - `https://campushub-connect.onrender.com/auth/callback`
  - `https://campushub-connect.onrender.com/login`
  - `https://campushub-connect.onrender.com/reset-password`

## Email delivery

For production, configure Supabase Auth SMTP with a recognized email sender instead of relying on the default Supabase email service. Good candidates to evaluate are Resend, Brevo, MailerSend, or SendGrid.

The app sends:

- Signup verification to `/auth/callback?next=/login&verified=1`
- Password recovery to `/auth/callback?next=/reset-password&type=recovery`
