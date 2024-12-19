// pages/api/recipes/[id]/labels/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id: recipeId } = req.query;
  const { label_id } = req.body;

  if (typeof recipeId !== 'string') {
    return res.status(400).json({ message: 'Invalid recipe id' });
  }

  if (!label_id || typeof label_id !== 'string') {
    return res.status(400).json({ message: 'label_id is required' });
  }

  switch (method) {
    case 'POST':
      // レシピにラベルを割り当て
      const { error: insertError } = await supabase
        .from('recipe_labels')
        .insert([{ recipe_id: recipeId, label_id }]);

      if (insertError) {
        return res.status(500).json({ message: insertError.message });
      }

      return res.status(200).json({ message: 'Label assigned to recipe' });

    default:
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
