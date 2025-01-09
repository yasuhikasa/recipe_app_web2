import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET': {
      const {
        user_id,
        label_id,
        limit = 30,
        offset = 0,
        sortField = 'created_at', // デフォルトのソートフィールド
        sortOrder = 'desc',      // デフォルトのソート順
      } = req.query;

      if (!user_id) {
        return res.status(400).json({ message: 'user_id is required' });
      }

      try {
        // ラベルを取得
        const { data: labels, error: labelsError } = await supabase
          .from('labels')
          .select('id, name')
          .eq('user_id', user_id);

        if (labelsError) {
          throw new Error(`Error fetching labels: ${labelsError.message}`);
        }

        // レシピを取得
        let recipes;

        if (label_id && label_id !== 'null') {
          // ラベルが指定されている場合
          const { data, error } = await supabase
            .from('recipes')
            .select(`
              id, title,
              recipe_labels!inner(label_id)
            `)
            .eq('user_id', user_id)
            .eq('recipe_labels.label_id', label_id)
            .order(sortField as string, { ascending: sortOrder === 'asc' })
            .range(Number(offset) || 0, (Number(offset) || 0) + (Number(limit) || 30) - 1);

          if (error) {
            throw new Error(`Error fetching recipes: ${error.message}`);
          }

          recipes = data;
        } else {
          // 全レシピを取得
          const { data, error } = await supabase
            .from('recipes')
            .select('id, title')
            .eq('user_id', user_id)
            .order(sortField as string, { ascending: sortOrder === 'asc' })
            .range(Number(offset) || 0, (Number(offset) || 0) + (Number(limit) || 30) - 1);

          if (error) {
            throw new Error(`Error fetching recipes: ${error.message}`);
          }

          recipes = data;
        }

        return res.status(200).json({ labels: labels || [], recipes: recipes || [] });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error in handler:', error.message);
          return res.status(500).json({ message: error.message || 'Unexpected server error' });
        }
        return res.status(500).json({ message: 'Unknown error occurred' });
      }
    }

    default: {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  }
}
