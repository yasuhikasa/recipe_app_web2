// src/pages/api/recipes/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // クエリからIDを取得
  const { method } = req;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid recipe id' });
  }

  switch (method) {
    case 'GET': {
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
        return res.status(200).json({ recipe: recipeData });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error fetching recipe:', error.message);
        }
        return res.status(500).json({ message: 'Error fetching recipe' });
      }
    }

    case 'DELETE': {
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
        return res.status(200).json({ message: 'Recipe deleted successfully' });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error deleting recipe:', error.message);
        }
        return res.status(500).json({ message: 'Error deleting recipe' });
      }
    }

    case 'PATCH': {
      const { title } = req.body; // リクエストボディからタイトルを取得

      if (!title || typeof title !== 'string') {
        return res.status(400).json({ message: 'Title is required and must be a string' });
      }

      try {
        // Supabaseでレシピタイトルを更新
        const { error: updateError } = await supabase
          .from('recipes')
          .update({ title }) // 更新するデータ
          .eq('id', id); // クエリパラメータから取得したレシピIDで絞り込み

        if (updateError) {
          throw new Error(`Failed to update recipe title: ${updateError.message}`);
        }

        return res.status(200).json({ message: 'Recipe title updated successfully' });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error updating recipe title:', error.message);
        }
        return res.status(500).json({ message: 'Error updating recipe title' });
      }
    }

    default: {
      res.setHeader('Allow', ['GET', 'DELETE', 'PATCH']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  }
}
