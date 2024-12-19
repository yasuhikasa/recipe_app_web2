// pages/api/labels/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid label id' });
  }

  switch (method) {
    case 'DELETE':
      // ラベル削除（既存の実装例）
      const { error: deleteError } = await supabase
        .from('labels')
        .delete()
        .eq('id', id);

      if (deleteError) {
        return res.status(500).json({ message: deleteError.message });
      }

      return res.status(200).json({ message: 'Label deleted successfully' });

    case 'PATCH':
      // ラベル名更新
      const { name } = req.body;
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ message: 'name is required and must be a string' });
      }

      const { data: updateData, error: updateError } = await supabase
        .from('labels')
        .update({ name })
        .eq('id', id)
        .single();

      if (updateError) {
        return res.status(500).json({ message: updateError.message });
      }

      return res.status(200).json({ label: updateData });

    default:
      res.setHeader('Allow', ['DELETE', 'PATCH']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
