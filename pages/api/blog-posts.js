import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('blog-posts GET error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { niche, title, content, productName, productImageUrl, productLink } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    try {
      let baseSlug = slugify(title);
      let slug = baseSlug;
      let attempt = 0;

      while (true) {
        const { data: existing } = await supabase
          .from('blog_posts')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (!existing) break;
        attempt += 1;
        slug = `${baseSlug}-${attempt}`;
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{ niche: niche || null, title, content, slug, published: true, product_name: productName || null, product_image_url: productImageUrl || null, product_link: productLink || null }])
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('blog-posts POST error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
