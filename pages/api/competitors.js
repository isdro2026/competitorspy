// pages/api/competitors.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  switch (method) {
    case 'GET':
      return getCompetitors(req, res);
    case 'POST':
      return createCompetitor(req, res);
    case 'PUT':
      return updateCompetitor(req, res, id);
    case 'DELETE':
      return deleteCompetitor(req, res, id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getCompetitors(req, res) {
  try {
    const { data, error } = await supabase
      .from('competitors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || []
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch competitors',
      details: error.message
    });
  }
}

async function createCompetitor(req, res) {
  try {
    const { name, website, industry } = req.body;

    if (!name || !website) {
      return res.status(400).json({ error: 'Name and website are required' });
    }

    const { data, error } = await supabase
      .from('competitors')
      .insert([
        {
          name,
          website,
          industry,
          user_id: 'demo-user' // Replace with actual user ID
        }
      ])
      .select();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to create competitor',
      details: error.message
    });
  }
}

async function updateCompetitor(req, res, id) {
  try {
    const { name, website, industry } = req.body;

    const { data, error } = await supabase
      .from('competitors')
      .update({ name, website, industry })
      .eq('id', id)
      .select();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to update competitor',
      details: error.message
    });
  }
}

async function deleteCompetitor(req, res, id) {
  try {
    const { error } = await supabase
      .from('competitors')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Competitor deleted'
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to delete competitor',
      details: error.message
    });
  }
}
