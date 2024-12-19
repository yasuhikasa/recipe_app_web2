import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClient'; // Supabaseクライアント

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET': {
      const { user_id } = req.query; // クエリパラメータから user_id を取得

      if (typeof user_id !== 'string') {
        return res.status(400).json({ message: 'user_id is required as a query parameter' });
      }

      // 指定ユーザーのラベルを取得
      const { data: labels, error: fetchError } = await supabase
        .from('labels')
        .select('*')
        .eq('user_id', user_id);

      if (fetchError) {
        return res.status(500).json({ message: fetchError.message });
      }

      return res.status(200).json({ labels });
    }

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
        console.error('Insert Error:', insertError.message);
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
