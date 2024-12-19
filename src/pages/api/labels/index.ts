import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClient'; // Supabaseクライアント

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET': {
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({ message: 'user_id is required' });
      }

      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .eq('user_id', user_id);

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(200).json({ labels: data || [] });
    }

    case 'POST': {
      const { user_id, name } = req.body;

      if (!user_id || !name) {
        return res.status(400).json({ message: 'user_id and name are required in the body' });
      }

      const { data: insertData, error: insertError } = await supabase
        .from('labels')
        .insert([{ user_id, name }])
        .single();

      if (insertError) {
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
