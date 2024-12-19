import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET': {
      const { user_id, label_id } = req.query;

      if (!user_id) {
        return res.status(400).json({ message: 'user_id is required' });
      }

      try {
        let query = supabase
          .from('recipes')
          .select(`
            id, title,
            recipe_labels (label_id)
          `)
          .eq('user_id', user_id);

        // ラベルフィルタリング
        if (label_id && typeof label_id === 'string') {
          query = query.contains('recipe_labels', [{ label_id }]);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Supabase Query Error:', error.message);
          return res.status(500).json({ message: error.message });
        }

        // サンプル：ラベルも返すようにする
        const { data: labels, error: labelError } = await supabase
          .from('labels')
          .select('id, name')
          .eq('user_id', user_id);

        if (labelError) {
          console.error('Supabase Labels Error:', labelError.message);
          return res.status(500).json({ message: labelError.message });
        }

        return res.status(200).json({ recipes: data || [], labels: labels || [] });
      } catch (error: unknown) {
        if (error instanceof Error)
        console.error('Unexpected Server Error:', error.message);
        return res.status(500).json({ message: 'Unexpected server error occurred.' });
      }
    }

    default: {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  }
}
