CAMPUSHUB is a project established to connect the world together in one collective place all while doing what they love

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Setup

1. Clone the repository
2. Install dependencies: `npm install` or `bun install`
3. Copy `.env.example` to `.env` and fill in your Supabase credentials
4. Apply the Supabase migrations in `supabase/migrations`

### Environment Variables

Copy `.env.example` to `.env` and update the values:

- `VITE_SUPABASE_PROJECT_ID`: Your Supabase project ID
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase publishable key
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_FLUTTERWAVE_PAYMENT_LINK_URL`: Flutterwave payment link or backend checkout endpoint used by the marketplace and verified-agent flows
- `VITE_FLUTTERWAVE_CURRENCY`: Payment currency, defaulting to `NGN`
- `VITE_BACKUP_PAYMENT_DM_URL`: Backup DM/payment support link used when Flutterwave is not configured
- `VITE_SENTRY_DSN`: Optional Sentry browser DSN for production error monitoring
- `VITE_SENTRY_ENVIRONMENT`: Monitoring environment name, such as `development` or `production`

Do not add database connection strings, Supabase service-role keys, Flutterwave secret keys, or webhook signing secrets to `VITE_` variables. Anything prefixed with `VITE_` is bundled into the browser. Keep server-only secrets in Supabase Edge Function secrets or your backend host environment.

### Payments

Marketplace upfront fees and verified-agent fees are calculated in the app, saved against their Supabase records, and sent to the configured Flutterwave link with `amount`, `currency`, `tx_ref`, `purpose`, and customer metadata query parameters.

If Flutterwave is not configured, CampusHub falls back to `VITE_BACKUP_PAYMENT_DM_URL` and opens a prefilled DM containing the calculated amount, purpose, reference, record ID, and user contact details.

For a quick launch, use a Flutterwave no-amount payment link in `VITE_FLUTTERWAVE_PAYMENT_LINK_URL`. For the strongest production setup, replace the value with a Supabase Edge Function endpoint that calls Flutterwave Standard server-side, creates the checkout, verifies webhooks, and returns the provider checkout URL to the browser.

### Error Monitoring

Sentry is wired behind `VITE_SENTRY_DSN`. Leave it empty locally. When you create the Sentry project, paste the browser DSN into production env vars and set `VITE_SENTRY_ENVIRONMENT="production"`.

## Development

Run the development server: `npm run dev` or `bun run dev`
