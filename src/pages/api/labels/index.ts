import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClient'; // Supabaseクライアント

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      const { user_id, label_id } = req.query;
      let query = supabase
        .from('recipes')
        .select(`
          id, title,
          recipe_labels (
            label_id
          )
        `)
        .eq('user_id', user_id);

      // ラベルでフィルタリング
      if (label_id && typeof label_id === 'string') {
        query = query.eq('recipe_labels.label_id', label_id);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(200).json({ recipes: data });

    case 'POST': {
      const { user_id, name } = req.body;

      console.log('Request Body:', req.body);

      if (!user_id || !name) {
        console.error('Validation Failed: Missing user_id or name');
        return res.status(400).json({ message: 'user_id and name are required in the body' });
      }

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
    }

    default: {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  }
}
