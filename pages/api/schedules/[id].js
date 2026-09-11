// pages/api/schedules/[id].js
import { supabase } from '@/lib/supabaseAdmin';

const APP_USER_ID = 'demo-user';

export default async function handler(req, res) {
  const { id } = req.query;

    if (req.method === 'PATCH') {
        const { active } = req.body;
            if (typeof active !== 'boolean') {
                  return res.status(400).json({ success: false, error: 'active (boolean) is required' });
                      }

                          try {
                                const { data, error } = await supabase
                                        .from('content_schedules')
                                                .update({ active })
                                                        .eq('id', id)
                                                                .eq('user_id', APP_USER_ID)
                                                                        .select()
                                                                                .single();

                                                                                      if (error) throw error;
                                                                                            return res.status(200).json({ success: true, data });
                                                                                                } catch (err) {
                                                                                                      console.error('schedules PATCH error:', err);
                                                                                                            return res.status(500).json({ success: false, error: err.message });
                                                                                                                }
                                                                                                                  }
                                                                                                                  
                                                                                                                    if (req.method === 'DELETE') {
                                                                                                                        try {
                                                                                                                              const { error } = await supabase
                                                                                                                                      .from('content_schedules')
                                                                                                                                              .delete()
                                                                                                                                                      .eq('id', id)
                                                                                                                                                              .eq('user_id', APP_USER_ID);
                                                                                                                                                              
                                                                                                                                                                    if (error) throw error;
                                                                                                                                                                          return res.status(200).json({ success: true });
                                                                                                                                                                              } catch (err) {
                                                                                                                                                                                    console.error('schedules DELETE error:', err);
                                                                                                                                                                                          return res.status(500).json({ success: false, error: err.message });
                                                                                                                                                                                              }
                                                                                                                                                                                                }
                                                                                                                                                                                                
                                                                                                                                                                                                  return res.status(405).json({ success: false, error: 'Method not allowed' });
                                                                                                                                                                                                  }
                                                                                                                                                                                                  
