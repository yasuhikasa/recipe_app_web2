import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id: recipeId } = req.query;

  if (typeof recipeId !== 'string') {
    return res.status(400).json({ message: 'Invalid recipe id' });
  }

  switch (method) {
    case 'GET': {
      try {
        const { data, error } = await supabase
          .from('recipe_labels')
          .select(`
            label_id,
            labels(name)
          `)
          .eq('recipe_id', recipeId);

        if (error) {
          throw new Error(error.message);
        }

        return res.status(200).json({ labels: data });
      } catch (error: unknown) {
        if (error instanceof Error) {
        console.error('Error fetching labels:', error.message);
        }
        return res.status(500).json({ message: 'Failed to fetch labels' });
      }
    }

    case 'POST': {
      const { label_id } = req.body;

      if (!label_id || typeof label_id !== 'string') {
        return res.status(400).json({ message: 'label_id is required' });
      }

      try {
        const { error: insertError } = await supabase
          .from('recipe_labels')
          .insert([{ recipe_id: recipeId, label_id }]);

        if (insertError) {
          throw new Error(insertError.message);
        }

        return res.status(200).json({ message: 'Label assigned to recipe' });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error assigning label:', error.message);
        }
        return res.status(500).json({ message: 'Failed to assign label' });
      }
    }

    case 'DELETE': {
      const { label_id } = req.body;

      if (!label_id || typeof label_id !== 'string') {
        return res.status(400).json({ message: 'label_id is required' });
      }

      try {
        const { error: deleteError } = await supabase
          .from('recipe_labels')
          .delete()
          .eq('recipe_id', recipeId)
          .eq('label_id', label_id);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        return res.status(200).json({ message: 'Label removed from recipe' });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error removing label:', error.message);
        }
        return res.status(500).json({ message: 'Failed to remove label' });
      }
    }

    default: {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  }
}
