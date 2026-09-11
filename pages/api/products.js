// pages/api/products.js
import { supabase } from '@/lib/supabase';

const APP_USER_ID = 'demo-user';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', APP_USER_ID)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error('products GET error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === 'POST') {
    const { name, productUrl, imageUrl, platform } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Product name is required' });
    }
    if (!productUrl || !productUrl.trim()) {
      return res.status(400).json({ success: false, error: 'Product URL is required' });
    }
    if (!['amazon', 'ebay', 'walmart', 'bestbuy', 'other'].includes(platform)) {
      return res.status(400).json({ success: false, error: 'Invalid platform' });
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          user_id: APP_USER_ID,
          name: name.trim(),
          product_url: productUrl.trim(),
          image_url: imageUrl ? imageUrl.trim() : null,
          platform,
        }])
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error('products POST error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
