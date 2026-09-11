// pages/api/products/[id].js
import { supabase } from '@/lib/supabaseAdmin';

const APP_USER_ID = 'demo-user';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', APP_USER_ID);

      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('products DELETE error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
