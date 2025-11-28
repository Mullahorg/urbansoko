import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify user is admin
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      throw new Error("Admin access required");
    }

    // Get all tables data
    const tables = [
      "categories",
      "products", 
      "profiles",
      "orders",
      "order_items",
      "order_status_history",
      "reviews",
      "wishlist",
      "user_rewards",
      "rewards_history",
      "newsletter_subscribers",
      "site_content",
      "settings",
      "vendors",
      "gamification_settings",
      "flash_sales",
      "language_packs"
    ];

    let sqlStatements: string[] = [];
    sqlStatements.push("-- Database Export");
    sqlStatements.push(`-- Generated: ${new Date().toISOString()}`);
    sqlStatements.push("-- Note: user_roles table is excluded for security\n");

    for (const table of tables) {
      const { data, error } = await supabaseClient
        .from(table)
        .select("*");

      if (error) {
        console.error(`Error fetching ${table}:`, error);
        continue;
      }

      if (data && data.length > 0) {
        sqlStatements.push(`-- Table: ${table}`);
        sqlStatements.push(`-- Records: ${data.length}\n`);

        for (const row of data) {
          const columns = Object.keys(row);
          const values = columns.map(col => {
            const val = row[col];
            if (val === null) return "NULL";
            if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
            if (typeof val === "number") return val.toString();
            if (Array.isArray(val)) {
              return `ARRAY[${val.map(v => `'${String(v).replace(/'/g, "''")}'`).join(",")}]`;
            }
            if (typeof val === "object") {
              return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
            }
            return `'${String(val).replace(/'/g, "''")}'`;
          });

          sqlStatements.push(
            `INSERT INTO public.${table} (${columns.join(", ")}) VALUES (${values.join(", ")}) ON CONFLICT DO NOTHING;`
          );
        }
        sqlStatements.push("");
      }
    }

    const sqlContent = sqlStatements.join("\n");

    return new Response(JSON.stringify({ sql: sqlContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Export error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
