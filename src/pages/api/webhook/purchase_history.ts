import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const { email, product_id, receipt_data } = req.body;

    if (!email || !product_id || !receipt_data) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 購入情報を保存
    const { error } = await supabase.from('purchase_history').insert([
      {
        email,
        product_id,
        receipt_data,
      },
    ]);

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({ message: 'Purchase recorded successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error saving purchase history:', error.message);
    } else {
      console.error('Error saving purchase history:', error);
      res.status(500).json({ message: 'Failed to record purchase' });
    }
  }
}
