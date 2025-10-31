import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const payload = await req.json();
    console.log('M-Pesa Callback received:', JSON.stringify(payload, null, 2));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { Body } = payload;
    const { stkCallback } = Body;

    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const checkoutRequestId = stkCallback.CheckoutRequestID;
      const items = stkCallback.CallbackMetadata.Item;
      
      const mpesaReceiptNumber = items.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;

      // Update order status
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          mpesa_transaction_id: mpesaReceiptNumber || checkoutRequestId,
          status: 'processing'
        })
        .eq('mpesa_transaction_id', checkoutRequestId);

      if (error) {
        console.error('Error updating order:', error);
      } else {
        console.log('Order updated successfully for receipt:', mpesaReceiptNumber);
      }
    } else {
      // Payment failed
      console.log('Payment failed:', stkCallback.ResultDesc);
      
      const checkoutRequestId = stkCallback.CheckoutRequestID;
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'cancelled'
        })
        .eq('mpesa_transaction_id', checkoutRequestId);
    }

    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in M-Pesa callback:', error);
    return new Response(
      JSON.stringify({ ResultCode: 1, ResultDesc: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
