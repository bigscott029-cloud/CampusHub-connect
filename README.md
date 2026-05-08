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

Do not add database connection strings, Supabase service-role keys, Stripe secret keys, PayPal secrets, or webhook signing secrets to `VITE_` variables. Anything prefixed with `VITE_` is bundled into the browser. Keep server-only secrets in Supabase Edge Function secrets or your backend host environment.

### Payments

Payment rows are stored in Supabase, but checkout/session creation should happen in server-side Supabase Edge Functions or another backend. The frontend should only receive publishable keys and checkout URLs.

## Development

Run the development server: `npm run dev` or `bun run dev`
