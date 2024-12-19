// pages/api/recipes/[id]/labels/[labelId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id: recipeId, labelId } = req.query;

  if (typeof recipeId !== 'string' || typeof labelId !== 'string') {
    return res.status(400).json({ message: 'Invalid recipe or label id' });
  }

  switch (method) {
    case 'DELETE':
      const { error: deleteError } = await supabase
        .from('recipe_labels')
        .delete()
        .eq('recipe_id', recipeId)
        .eq('label_id', labelId);

      if (deleteError) {
        return res.status(500).json({ message: deleteError.message });
      }

      return res.status(200).json({ message: 'Label removed from recipe' });

    default:
      res.setHeader('Allow', ['DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
