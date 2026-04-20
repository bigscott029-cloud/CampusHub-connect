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
4. For production deployments (like Render), configure the database connection pooler URL

### Environment Variables

Copy `.env.example` to `.env` and update the values:

- `VITE_SUPABASE_PROJECT_ID`: Your Supabase project ID
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase publishable key
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_DB_URL`: Database connection pooler URL (for production deployments)

### Database Connection Pooler

For deployments on platforms like Render, use the transaction pooler URL to avoid connection limits:

```
VITE_SUPABASE_DB_URL="postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
```

You can find your pooler URL in your Supabase dashboard under Settings > Database > Connection Pooling.

## Development

Run the development server: `npm run dev` or `bun run dev`
