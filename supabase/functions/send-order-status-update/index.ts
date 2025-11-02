import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusUpdateRequest {
  orderId: string;
  newStatus: string;
  notes?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, newStatus, notes }: StatusUpdateRequest = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order with customer details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        profiles:user_id (email, full_name)
      `)
      .eq("id", orderId)
      .single();

    if (orderError) throw orderError;

    // Create status history entry
    const { error: historyError } = await supabase
      .from("order_status_history")
      .insert({
        order_id: orderId,
        status: newStatus,
        notes: notes || null,
      });

    if (historyError) throw historyError;

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (updateError) throw updateError;

    // Get customer email
    const customerEmail = order.guest_email || order.profiles?.email;
    const customerName = order.guest_name || order.profiles?.full_name;

    // Note: To actually send emails, integrate with Resend
    console.log("Status update email would be sent to:", customerEmail);
    console.log("Status update details:", {
      trackingCode: order.tracking_code,
      customerName,
      oldStatus: order.status,
      newStatus,
      notes,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Status update notification processed",
        trackingCode: order.tracking_code,
        newStatus 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
