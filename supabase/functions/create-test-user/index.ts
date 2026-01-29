import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if test user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const testUserExists = existingUser?.users?.some(
      (user) => user.email === "admin@demo.edu.ng"
    );

    if (testUserExists) {
      return new Response(
        JSON.stringify({ message: "Test user already exists", email: "admin@demo.edu.ng" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Create test user
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@demo.edu.ng",
      password: "password",
      email_confirm: true,
      user_metadata: {
        display_name: "Admin",
      },
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        message: "Test user created successfully",
        email: "admin@demo.edu.ng",
        password: "password",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
