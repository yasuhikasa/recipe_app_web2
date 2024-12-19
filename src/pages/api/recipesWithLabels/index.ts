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
        // ラベルを取得
        const { data: labels, error: labelsError } = await supabase
          .from('labels')
          .select('id, name')
          .eq('user_id', user_id);

        if (labelsError) {
          throw new Error(`Error fetching labels: ${labelsError.message}`);
        }

        // レシピを取得
        let recipesQuery = supabase
          .from('recipes')
          .select(`
            id, title,
            recipe_labels!inner(label_id)
          `)
          .eq('user_id', user_id);

        // ラベルが指定されている場合、フィルタリング
        if (label_id) {
          recipesQuery = recipesQuery.eq('recipe_labels.label_id', label_id);
        }

        const { data: recipes, error: recipesError } = await recipesQuery;

        if (recipesError) {
          throw new Error(`Error fetching recipes: ${recipesError.message}`);
        }

        return res.status(200).json({ labels: labels || [], recipes: recipes || [] });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error in handler:', error.message);
          return res.status(500).json({ message: error.message || 'Unexpected server error' });
        }
      }
    }

    default: {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  }
}
