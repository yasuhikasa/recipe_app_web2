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
      try {
        const { data: recipeData, error: recipeError } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', id)
          .single();

        if (recipeError || !recipeData) {
          throw new Error(`Error fetching recipe: ${recipeError?.message || 'Recipe not found'}`);
        }

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.status(200).json({ recipe: recipeData });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error fetching recipe:', error.message);
          res.status(500).json({ message: 'Error fetching recipe' });
        }
      }
      break;

    case 'DELETE':
      const { user_id } = req.body;

      if (!user_id || typeof user_id !== 'string') {
        return res.status(400).json({ message: 'Invalid user_id' });
      }

      try {
        const { error: deleteError } = await supabase
          .from('recipes')
          .delete()
          .eq('id', id)
          .eq('user_id', user_id);

        if (deleteError) {
          throw new Error(`Error deleting recipe: ${deleteError.message}`);
        }

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.status(200).json({ message: 'Recipe deleted successfully' });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error deleting recipe:', error.message);
          res.status(500).json({ message: 'Error deleting recipe' });
        }
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
