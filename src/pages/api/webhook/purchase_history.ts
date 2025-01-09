import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Webhook raw body:', req.body);


  try {
    const { email, product_id, receipt_data } = req.body;

    // リクエスト内容をログに記録
    console.log('Received purchase data:', { email, product_id, receipt_data });

    if (!email || !product_id || !receipt_data) {
      console.warn('Missing required fields:', { email, product_id, receipt_data });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 購入情報を保存
    console.log('Attempting to insert purchase record into database...');
    const { error } = await supabase.from('purchase_history').insert([
      {
        email,
        product_id,
        receipt_data,
      },
    ]);

    if (error) {
      console.error('Database insert error:', error);
      throw new Error(error.message);
    }

    console.log('Purchase record inserted successfully.');
    res.status(200).json({ message: 'Purchase recorded successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error saving purchase history:', {
        message: error.message,
        stack: error.stack,
      });
      res.status(500).json({ message: error.message || 'Unexpected server error' });
    } else {
      console.error('Unknown error saving purchase history:', error);
      res.status(500).json({ message: 'Failed to record purchase due to unknown error' });
    }
  }
}
