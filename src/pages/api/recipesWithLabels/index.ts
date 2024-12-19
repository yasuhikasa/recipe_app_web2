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
        // 基本クエリ（ユーザーのレシピを取得）
        let query = supabase
          .from('recipes')
          .select(`
            id, title,
            recipe_labels (label_id)
          `)
          .eq('user_id', user_id);

        // ラベルが指定されている場合はフィルタリング
        if (label_id && typeof label_id === 'string') {
          query = query.contains('recipe_labels', [{ label_id }]);
        }

        const { data: recipes, error: recipesError } = await query;

        if (recipesError) {
          console.error('Error fetching recipes:', recipesError.message);
          return res.status(500).json({ message: recipesError.message });
        }

        // ラベルを取得
        const { data: labels, error: labelsError } = await supabase
          .from('labels')
          .select('id, name')
          .eq('user_id', user_id);

        if (labelsError) {
          console.error('Error fetching labels:', labelsError.message);
          return res.status(500).json({ message: labelsError.message });
        }

        return res.status(200).json({ recipes: recipes || [], labels: labels || [] });
      } catch (error: unknown) {
        if (error instanceof Error)
        console.error('Unexpected Error:', error.message);
        return res.status(500).json({ message: 'Unexpected server error occurred.' });
      }
    }

    default: {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  }
}
