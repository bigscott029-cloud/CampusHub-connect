interface InstitutionLogoInput {
  logo_url?: string | null;
  website_url?: string | null;
}

const normalizeWebsiteUrl = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "nodomain.edu.ng") return null;

  try {
    return new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
};

export const getInstitutionLogoUrl = ({ logo_url, website_url }: InstitutionLogoInput) => {
  if (logo_url) return logo_url;

  const website = normalizeWebsiteUrl(website_url);
  if (!website) return null;

  return `https://www.google.com/s2/favicons?domain=${website.hostname}&sz=128`;
};
