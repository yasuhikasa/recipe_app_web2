// pages/api/recipes/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { method } = req;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid recipe id' });
  }

  switch (method) {
    case 'GET':
      // レシピ詳細取得
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        res.status(200).json({ recipe: data });
      } catch (error: unknown) {
        if (error instanceof Error)
        console.error('Error fetching recipe:', error.message);
        res.status(500).json({ message: 'Error fetching recipe' });
      }
      break;

    case 'DELETE':
      // レシピ削除
      const { user_id } = req.body;

      if (!user_id || typeof user_id !== 'string') {
        return res.status(400).json({ message: 'Invalid user_id' });
      }

      try {
        const { data, error } = await supabase
          .from('recipes')
          .delete()
          .eq('id', id)
          .eq('user_id', user_id);

        if (error) {
          throw error;
        }

        if (!data) {
          return res.status(404).json({ message: 'Recipe not found or not authorized' });
        }

        res.status(200).json({ message: 'Recipe deleted successfully' });
      } catch (error: unknown) {
        if (error instanceof Error)
        console.error('Error deleting recipe:', error.message);
        res.status(500).json({ message: 'Error deleting recipe' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
