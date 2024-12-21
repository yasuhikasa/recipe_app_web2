import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// CORSヘッダーを設定する関数
function setCorsHeaders(req: NextApiRequest, res: NextApiResponse): boolean {
  res.setHeader('Access-Control-Allow-Origin', '*'); // 必要に応じて '*' を特定のドメインに変更
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    // プリフライトリクエストの場合、レスポンスを返して終了
    res.status(200).end();
    return true; // 処理が終了したことを示す
  }
  return false; // 通常のリクエスト処理を継続
}

// リトライ関数の型定義
async function retryOperation<T>(
  operation: () => Promise<T>, // 無名関数の引数と戻り値の型を明示
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await operation(); // 成功すれば結果を返す
    } catch (error: unknown) {
      attempt++;
      if (error instanceof Error) {
        console.error(`Retry ${attempt}/${retries} failed:`, error.message);
      } else {
        console.error('Retry failed with unknown error:', error);
      }
      if (attempt === retries) throw error; // リトライ回数を超えたらエラーをスロー
      await new Promise((resolve) => setTimeout(resolve, delay)); // 次のリトライまで待機
    }
  }
  throw new Error('Max retries exceeded'); // 理論上ここには到達しない
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORSヘッダーの設定
  if (setCorsHeaders(req, res)) {
    return; // プリフライトリクエストの場合、ここで終了
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Supabaseのユーザープロファイル作成処理をリトライ付きで実行
    await retryOperation(async () => {
      const { error } = await supabase.from('user_profiles').upsert([
        {
          id: userId,
          email,
        },
      ]);

      if (error) {
        throw new Error(`Failed to insert user profile: ${error.message}`);
      }
    });

    res.status(200).json({ message: 'User profile created successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Unexpected Error:', error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error('Unexpected Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
