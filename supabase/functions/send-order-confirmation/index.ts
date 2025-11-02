import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderId: string;
  email: string;
  customerName: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, email, customerName }: OrderConfirmationRequest = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products:product_id (name, price)
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError) throw orderError;

    // Note: To actually send emails, you would need to integrate with a service like Resend
    // For now, we'll log the email that would be sent
    console.log("Order confirmation email would be sent to:", email);
    console.log("Order details:", {
      orderNumber: order.tracking_code,
      customerName,
      totalAmount: order.total_amount,
      items: order.order_items,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Order confirmation processed",
        trackingCode: order.tracking_code 
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
