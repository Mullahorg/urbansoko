import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      throw new Error('Unauthorized: Admin access required');
    }

    // Products data to seed
    const products = [
      {
        name: 'Traditional Kente Shirt',
        description: 'Authentic African Kente fabric shirt with modern tailoring',
        price: 4500,
        category: 'Shirts',
        stock: 15,
        featured: true,
        image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=500&fit=crop',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Blue', 'Red', 'Green']
      },
      {
        name: 'Dashiki Print Blazer',
        description: 'Contemporary blazer featuring bold Dashiki prints',
        price: 7200,
        category: 'Jackets',
        stock: 8,
        featured: true,
        image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop',
        sizes: ['M', 'L', 'XL', 'XXL'],
        colors: ['Orange', 'Purple', 'Yellow']
      },
      {
        name: 'African Print Trousers',
        description: 'Comfortable trousers with authentic African textile patterns',
        price: 3800,
        category: 'Trousers',
        stock: 20,
        featured: false,
        image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=500&fit=crop',
        sizes: ['30', '32', '34', '36', '38'],
        colors: ['Black', 'Navy', 'Brown']
      },
      {
        name: 'Ankara Casual Shirt',
        description: 'Vibrant Ankara print casual shirt perfect for any occasion',
        price: 3500,
        category: 'Shirts',
        stock: 25,
        featured: false,
        image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&h=500&fit=crop',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Multi-color', 'Blue', 'Red']
      },
      {
        name: 'Batik Bomber Jacket',
        description: 'Modern bomber jacket with traditional Batik artistry',
        price: 8500,
        category: 'Jackets',
        stock: 6,
        featured: true,
        image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
        sizes: ['M', 'L', 'XL'],
        colors: ['Black', 'Indigo', 'Brown']
      },
      {
        name: 'Mudcloth Chino Pants',
        description: 'Stylish chinos featuring authentic Mudcloth patterns',
        price: 4200,
        category: 'Trousers',
        stock: 18,
        featured: false,
        image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=500&fit=crop',
        sizes: ['30', '32', '34', '36'],
        colors: ['Beige', 'Olive', 'Charcoal']
      },
      {
        name: 'Kitenge Formal Shirt',
        description: 'Elegant formal shirt with Kitenge fabric accents',
        price: 5200,
        category: 'Shirts',
        stock: 12,
        featured: true,
        image_url: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500&h=500&fit=crop',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['White', 'Light Blue', 'Pink']
      },
      {
        name: 'Kente Denim Jacket',
        description: 'Classic denim jacket enhanced with Kente fabric panels',
        price: 9800,
        category: 'Jackets',
        stock: 5,
        featured: true,
        image_url: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500&h=500&fit=crop',
        sizes: ['M', 'L', 'XL'],
        colors: ['Blue', 'Black']
      }
    ];

    // Check if products already exist
    const { count } = await supabaseClient
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Products already exist in database. Clear the table first if you want to reseed.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Insert products
    const { data, error } = await supabaseClient
      .from('products')
      .insert(products)
      .select();

    if (error) {
      throw error;
    }

    console.log(`Successfully seeded ${data.length} products`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully seeded ${data.length} products`,
        products: data
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Error seeding products:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
