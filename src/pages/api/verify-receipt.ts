import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

async function verifyReceipt(receipt: string) {
  const payload = {
    'receipt-data': receipt,
  };

  const response = await fetch(PRODUCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (data.status === 21007) {
    // サンドボックスで再試行
    const sandboxResponse = await fetch(SANDBOX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return await sandboxResponse.json();
  }

  return data;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { receipt, userId } = req.body;

    if (!receipt || !userId) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // レシートを検証
    const receiptData = await verifyReceipt(receipt);

    if (receiptData.status !== 0) {
      throw new Error(`Receipt verification failed with status: ${receiptData.status}`);
    }

    // 最新の購入情報を取得
    const latestTransaction = receiptData.latest_receipt_info?.[0]; // 最新トランザクションを取得
    if (!latestTransaction) {
      throw new Error('No latest transaction found in receipt');
    }

    const originalTransactionId = latestTransaction.original_transaction_id;

    if (!originalTransactionId) {
      throw new Error('Original Transaction ID is missing in receipt');
    }

    // `user_profiles` テーブルの `original_transaction_id` を更新
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ original_transaction_id: originalTransactionId })
      .eq('user_id', userId);

    if (profileError) {
      throw new Error(`Failed to update user_profiles: ${profileError.message}`);
    }

    res.status(200).json({ message: 'User profile updated successfully' });
  } catch (error) {
    console.error('Error verifying receipt:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
}
