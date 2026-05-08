import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ProfileRow = Tables<"profiles">;
export type UniversityRow = Tables<"universities">;

export interface ProfileWithUniversity {
  profile: ProfileRow | null;
  university: UniversityRow | null;
}

export async function getProfileWithUniversity(
  userId: string,
): Promise<ProfileWithUniversity> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile?.university_id) {
    return { profile, university: null };
  }

  const { data: university, error: universityError } = await supabase
    .from("universities")
    .select("*")
    .eq("id", profile.university_id)
    .maybeSingle();

  if (universityError) {
    throw universityError;
  }

  return {
    profile,
    university,
  };
}
