import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Allowed tables for import (security measure)
const ALLOWED_TABLES = [
  "categories",
  "products",
  "site_content",
  "settings",
  "gamification_settings",
  "flash_sales",
  "language_packs",
  "newsletter_subscribers"
];

// Dangerous SQL patterns to block
const DANGEROUS_PATTERNS = [
  /DROP\s+(TABLE|DATABASE|SCHEMA)/i,
  /TRUNCATE/i,
  /DELETE\s+FROM\s+(?!public\.(categories|products|site_content|settings|gamification_settings|flash_sales|language_packs|newsletter_subscribers))/i,
  /ALTER\s+TABLE.*DROP/i,
  /CREATE\s+USER/i,
  /GRANT/i,
  /REVOKE/i,
  /pg_/i,
  /information_schema/i,
  /auth\./i,
  /storage\./i,
  /user_roles/i,
  /profiles.*INSERT/i,
];

function validateSQL(sql: string): { valid: boolean; error?: string } {
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(sql)) {
      return { valid: false, error: `Blocked: SQL contains restricted pattern` };
    }
  }
  return { valid: true };
}

function parseInsertStatements(sql: string): string[] {
  // Extract only INSERT statements for allowed tables
  const lines = sql.split("\n");
  const validStatements: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("--") || trimmed === "") continue;
    
    // Check if it's an INSERT for an allowed table
    const insertMatch = trimmed.match(/INSERT\s+INTO\s+public\.(\w+)/i);
    if (insertMatch) {
      const tableName = insertMatch[1];
      if (ALLOWED_TABLES.includes(tableName)) {
        validStatements.push(trimmed);
      }
    }
  }
  
  return validStatements;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const dbUrl = Deno.env.get("SUPABASE_DB_URL")!;
    
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

    const { sql, dryRun = true } = await req.json();

    if (!sql) {
      throw new Error("No SQL provided");
    }

    // Validate SQL
    const validation = validateSQL(sql);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Parse and filter statements
    const statements = parseInsertStatements(sql);
    
    if (statements.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No valid INSERT statements found for allowed tables",
          allowedTables: ALLOWED_TABLES,
          statementsFound: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (dryRun) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          dryRun: true,
          message: `Found ${statements.length} valid INSERT statements`,
          allowedTables: ALLOWED_TABLES,
          statementsFound: statements.length,
          preview: statements.slice(0, 10)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Execute statements using Supabase client (safer than raw SQL)
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const statement of statements) {
      try {
        // Use RPC to execute SQL safely
        const { error } = await supabaseClient.rpc('exec_sql', { query: statement });
        if (error) {
          errorCount++;
          errors.push(`Statement failed: ${error.message}`);
        } else {
          successCount++;
        }
      } catch (e) {
        errorCount++;
        const errMsg = e instanceof Error ? e.message : "Unknown error";
        errors.push(`Statement error: ${errMsg}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        dryRun: false,
        message: `Executed ${successCount} statements, ${errorCount} errors`,
        successCount,
        errorCount,
        errors: errors.slice(0, 10)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Import error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
