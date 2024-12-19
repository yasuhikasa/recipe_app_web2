import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '' // サービスロールキーを利用
);

interface ExtendedAuthError extends Error {
  details?: string;
  hint?: string;
  status?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'ユーザーIDが提供されていません。' });
  }

  try {
    // Supabaseの管理者APIを利用してユーザーを削除
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      const extendedError = error as ExtendedAuthError;

      console.error('Supabase管理者APIエラー:', extendedError);

      return res.status(500).json({
        error: extendedError.message,
        details: extendedError.details || null,
        hint: extendedError.hint || null,
        status: extendedError.status || 500,
      });
    }

    return res
      .status(200)
      .json({ success: true, message: 'ユーザーが削除されました。' });
  } catch (err) {
    console.error('サーバーエラー:', err);
    return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
  }
}
