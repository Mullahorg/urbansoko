import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MpesaRequest {
  phone: string;
  amount: number;
  orderId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, amount, orderId }: MpesaRequest = await req.json();

    console.log('Processing M-Pesa STK Push for:', { phone, amount, orderId });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get M-Pesa credentials from environment
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET');
    const shortcode = Deno.env.get('MPESA_SHORTCODE');
    const passkey = Deno.env.get('MPESA_PASSKEY');
    const callbackUrl = Deno.env.get('MPESA_CALLBACK_URL');

    if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
      console.error('M-Pesa credentials not configured');
      
      // For demo purposes, simulate successful payment after 3 seconds
      console.log('Running in demo mode - simulating payment');
      
      setTimeout(async () => {
        const { error } = await supabase
          .from('orders')
          .update({
            payment_status: 'completed',
            mpesa_transaction_id: `DEMO${Date.now()}`,
            status: 'processing'
          })
          .eq('id', orderId);

        if (error) {
          console.error('Error updating order:', error);
        } else {
          console.log('Demo payment completed for order:', orderId);
        }
      }, 3000);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Demo payment initiated. Payment will be confirmed in 3 seconds.',
          demo: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Get OAuth token
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenResponse = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      }
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to get M-Pesa access token');
    }

    const { access_token } = await tokenResponse.json();

    // Step 2: Prepare STK Push request
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    const stkPushPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: phone.replace(/^0/, '254').replace(/^\+/, ''),
      PartyB: shortcode,
      PhoneNumber: phone.replace(/^0/, '254').replace(/^\+/, ''),
      CallBackURL: callbackUrl || `${supabaseUrl}/functions/v1/mpesa-callback`,
      AccountReference: orderId.slice(0, 12),
      TransactionDesc: `Payment for order ${orderId.slice(0, 8)}`
    };

    // Step 3: Send STK Push
    const stkResponse = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stkPushPayload)
      }
    );

    const stkResult = await stkResponse.json();
    console.log('STK Push Response:', stkResult);

    if (stkResult.ResponseCode === '0') {
      // Update order with checkout request ID
      await supabase
        .from('orders')
        .update({
          mpesa_transaction_id: stkResult.CheckoutRequestID
        })
        .eq('id', orderId);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment request sent. Please check your phone.',
          checkoutRequestId: stkResult.CheckoutRequestID
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error(stkResult.ResponseDescription || 'STK Push failed');
    }

  } catch (error: any) {
    console.error('Error in M-Pesa STK Push:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
