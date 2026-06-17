-- Signup audience/location support and institution search aliases.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_type TEXT NOT NULL DEFAULT 'student' CHECK (user_type IN ('student', 'agent_trader', 'community')),
  ADD COLUMN IF NOT EXISTS home_state TEXT,
  ADD COLUMN IF NOT EXISTS home_region TEXT;

ALTER TABLE public.universities
  ADD COLUMN IF NOT EXISTS aliases TEXT[] NOT NULL DEFAULT '{}';

CREATE OR REPLACE FUNCTION public.generate_institution_alias(institution_name TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  WITH words AS (
    SELECT word, ord
    FROM regexp_split_to_table(
      regexp_replace(institution_name, '[^[:alnum:] ]', ' ', 'g'),
      '\s+'
    ) WITH ORDINALITY AS t(word, ord)
    WHERE length(word) > 0
      AND lower(word) NOT IN (
        'of', 'and', 'the', 'for', 'in', 'at', 'to', 'a', 'an',
        'state', 'federal', 'private', 'university', 'polytechnic',
        'college', 'education', 'technology', 'institute', 'school'
      )
  ),
  acronym AS (
    SELECT string_agg(upper(left(word, 1)), '' ORDER BY ord) AS value
    FROM words
  )
  SELECT CASE
    WHEN length(value) BETWEEN 2 AND 12 THEN value
    ELSE NULL
  END
  FROM acronym;
$$;

UPDATE public.universities AS university
SET aliases = ARRAY(
  SELECT DISTINCT alias
  FROM unnest(array_remove(university.aliases || ARRAY[public.generate_institution_alias(university.name)], NULL)) AS generated(alias)
  WHERE alias <> ''
);

WITH curated(slug, alias_values) AS (
  VALUES
    ('abia-state-university-uturu', ARRAY['ABSU']),
    ('abubakar-tafawa-balewa-university-bauchi', ARRAY['ATBU']),
    ('adeleke-university-ede', ARRAY['AU']),
    ('adekunle-ajasin-university-akungba', ARRAY['AAUA']),
    ('ahmadu-bello-university-zaria', ARRAY['ABU']),
    ('bayero-university-kano', ARRAY['BUK']),
    ('covenant-university-ota', ARRAY['CU']),
    ('delta-state-university-abraka', ARRAY['DELSU']),
    ('ekiti-state-university', ARRAY['EKSU']),
    ('federal-university-of-technology-akure', ARRAY['FUTA']),
    ('federal-university-of-technology-minna', ARRAY['FUTMINNA']),
    ('federal-university-of-technology-owerri', ARRAY['FUTO']),
    ('lagos-state-university-ojo', ARRAY['LASU']),
    ('nnamdi-azikiwe-university-awka', ARRAY['UNIZIK']),
    ('obafemi-awolowo-university-ile-ife', ARRAY['OAU']),
    ('university-of-benin', ARRAY['UNIBEN']),
    ('university-of-calabar', ARRAY['UNICAL']),
    ('university-of-ibadan', ARRAY['UI']),
    ('university-of-ilorin', ARRAY['UNILORIN']),
    ('university-of-jos', ARRAY['UNIJOS']),
    ('university-of-lagos', ARRAY['UNILAG']),
    ('university-of-maiduguri', ARRAY['UNIMAID']),
    ('university-of-nigeria-nsukka', ARRAY['UNN']),
    ('university-of-port-harcourt', ARRAY['UNIPORT']),
    ('university-of-uyo', ARRAY['UNIUYO']),
    ('yaba-college-of-technology', ARRAY['YABATECH'])
)
UPDATE public.universities AS university
SET aliases = ARRAY(
  SELECT DISTINCT alias
  FROM unnest(university.aliases || curated.alias_values) AS merged(alias)
  WHERE alias <> ''
)
FROM curated
WHERE university.slug = curated.slug;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_university UUID;
BEGIN
  IF NULLIF(NEW.raw_user_meta_data->>'university_id', '') IS NOT NULL THEN
    requested_university := (NEW.raw_user_meta_data->>'university_id')::UUID;
  END IF;

  INSERT INTO public.profiles (
    user_id,
    display_name,
    university_id,
    user_type,
    home_state,
    home_region
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    requested_university,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'user_type', ''), 'student'),
    NULLIF(NEW.raw_user_meta_data->>'home_state', ''),
    NULLIF(NEW.raw_user_meta_data->>'home_region', '')
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');

  RETURN NEW;
END;
$$;
