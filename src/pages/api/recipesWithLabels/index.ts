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

      try {
        // ラベル取得
        const { data: labels, error: labelsError } = await supabase
          .from('labels')
          .select('id, name')
          .eq('user_id', user_id);

        if (labelsError) {
          throw new Error(labelsError.message);
        }

        // レシピ取得（ラベルでフィルタリング）
        let recipesQuery = supabase
          .from('recipes')
          .select(`
            id, title,
            recipe_labels (
              label_id
            )
          `)
          .eq('user_id', user_id);

        if (label_id && typeof label_id === 'string') {
          recipesQuery = recipesQuery.contains('recipe_labels', [{ label_id }]);
        }

        const { data: recipes, error: recipesError } = await recipesQuery;

        if (recipesError) {
          throw new Error(recipesError.message);
        }

        return res.status(200).json({ labels: labels || [], recipes: recipes || [] });
      } catch (error: unknown) {
        if (error instanceof Error)
        console.error('Error fetching data:', error.message);
        return res.status(500).json({ message: 'データの取得に失敗しました。' });
      }
    }

    default: {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  }
}
