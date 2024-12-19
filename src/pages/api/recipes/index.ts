import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClient'; // Supabaseクライアント

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET': {
      const { user_id, label_id } = req.query;

      if (!user_id) {
        return res.status(400).json({ message: 'user_id is required' });
      }

      let query = supabase
        .from('recipes')
        .select(`
          id, title,
          recipe_labels (
            label_id
          )
        `)
        .eq('user_id', user_id);

      // ラベルでフィルタリング
      if (label_id && typeof label_id === 'string') {
        query = query.eq('recipe_labels.label_id', label_id);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(200).json({ recipes: data || [] });
    }

    default: {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  }
}
