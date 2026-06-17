-- Final launch controls for admin-managed ad campaigns and institution logo fallbacks.

ALTER TABLE public.ads
  ALTER COLUMN owner_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS target_scope TEXT NOT NULL DEFAULT 'general' CHECK (target_scope IN ('general', 'region', 'institution')),
  ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_impressions_per_user INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS cooldown_hours INTEGER NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ads'
      AND policyname = 'Owners and admins can delete ads'
  ) THEN
    CREATE POLICY "Owners and admins can delete ads"
    ON public.ads FOR DELETE
    USING (
      auth.uid() = owner_id
      OR public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'moderator')
    );
  END IF;
END $$;

UPDATE public.universities
SET logo_url = 'https://www.google.com/s2/favicons?domain=' ||
  regexp_replace(
    regexp_replace(
      regexp_replace(website_url, '^https?://', '', 'i'),
      '^www\.',
      '',
      'i'
    ),
    '/.*$',
    ''
  ) ||
  '&sz=128'
WHERE logo_url IS NULL
  AND website_url IS NOT NULL
  AND btrim(website_url) <> ''
  AND website_url NOT ILIKE '%nodomain%'
  AND website_url ~* '^[a-z]+://|^[[:alnum:]][[:alnum:].-]+\.[[:alpha:]]{2,}';
