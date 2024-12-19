import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClient'; // Supabaseクライアント

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET': {
      const { user_id, label_id } = req.query;

      if (!user_id || typeof user_id !== 'string') {
        return res.status(400).json({ message: 'user_id is required and must be a string' });
      }

      try {
        let query = supabase
          .from('recipes')
          .select(`
            id, title
          `)
          .eq('user_id', user_id);

        // ラベルでフィルタリング
        if (label_id && typeof label_id === 'string') {
          query = supabase
            .from('recipes')
            .select(`
              id, title,
              recipe_labels (
                label_id
              )
            `)
            .eq('user_id', user_id)
            .eq('recipe_labels.label_id', label_id);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Supabase Query Error:', error.message);
          return res.status(500).json({ message: error.message });
        }

        return res.status(200).json({ recipes: data || [] });
      } catch (error) {
        console.error('Unexpected Error:', error);
        return res.status(500).json({ message: 'Unexpected server error' });
      }
    }

    case 'POST': {
      const { user_id, name } = req.body;

      if (!user_id || !name) {
        console.error('Validation Failed: Missing user_id or name');
        return res.status(400).json({ message: 'user_id and name are required in the body' });
      }

      try {
        // 新しいラベルを作成
        const { data: insertData, error: insertError } = await supabase
          .from('labels')
          .insert([{ user_id, name }])
          .single();

        if (insertError) {
          console.error('Supabase Insert Error:', insertError.details || insertError.message);
          return res.status(500).json({ message: insertError.message });
        }

        return res.status(201).json({ label: insertData });
      } catch (error) {
        console.error('Unexpected Error:', error);
        return res.status(500).json({ message: 'Unexpected server error' });
      }
    }

    default: {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  }
}
