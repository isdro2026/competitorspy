// pages/api/schedules.js
import { supabase } from '@/lib/supabase';

const APP_USER_ID = 'demo-user';

function computeNextRunAt(frequency, from = new Date()) {
    const next = new Date(from);
    if (frequency === 'monthly') {
          next.setMonth(next.getMonth() + 1);
    } else if (frequency === 'weekly') {
          next.setDate(next.getDate() + 7);
    } else {
          next.setDate(next.getDate() + 1);
    }
    return next.toISOString();
}

export default async function handler(req, res) {
    if (req.method === 'GET') {
          try {
                  const { data, error } = await supabase
                    .from('content_schedules')
                    .select('*')
                    .eq('user_id', APP_USER_ID)
                    .order('created_at', { ascending: false });

            if (error) throw error;
                  return res.status(200).json({ success: true, data });
          } catch (err) {
                  console.error('schedules GET error:', err);
                  return res.status(500).json({ success: false, error: err.message });
          }
    }

  if (req.method === 'POST') {
        const { inputType, inputValue, frequency, previewCaption } = req.body;

      if (!inputValue || !inputValue.trim()) {
              return res.status(400).json({ success: false, error: 'Niche or URL is required' });
      }
        if (!['niche', 'url'].includes(inputType)) {
                return res.status(400).json({ success: false, error: 'inputType must be niche or url' });
        }
        if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
                return res.status(400).json({ success: false, error: 'Frequency must be daily, weekly, or monthly' });
        }

      try {
              const { data, error } = await supabase
                .from('content_schedules')
                .insert([{
                            user_id: APP_USER_ID,
                            input_type: inputType,
                            input_value: inputValue.trim(),
                            frequency,
                            active: true,
                            next_run_at: computeNextRunAt(frequency),
                            last_caption: previewCaption || null,
                }])
                .select()
                .single();

          if (error) throw error;
              return res.status(200).json({ success: true, data });
      } catch (err) {
              console.error('schedules POST error:', err);
              return res.status(500).json({ success: false, error: err.message });
      }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
