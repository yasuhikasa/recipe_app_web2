// pages/api/recipes/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { user_id } = req.query;

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ message: 'Invalid user_id' });
  }

  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('id, title')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json({ recipes: data });
  } catch (error: unknown) {
    if (error instanceof Error)
    console.error('Error fetching recipes:', error.message);
    res.status(500).json({ message: 'Error fetching recipes' });
  }
}
