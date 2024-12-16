import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../lib/supabaseClient'; // Supabase クライアントの設定をインポート

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { recipe, formData, title, user_id } = req.body;

  // 入力バリデーション
  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ message: 'UIDが無効です。' });
  }

  if (!recipe || typeof recipe !== 'string') {
    return res.status(400).json({ message: 'レシピ内容が無効です。' });
  }

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ message: 'タイトルが無効です。' });
  }

  try {
    // Supabase の recipes テーブルにデータを挿入
    const { data, error } = await supabase
      .from('recipes')
      .insert([
        {
          user_id: user_id,
          title: title.trim() || '未設定',
          recipe: recipe.trim(),
          form_data: formData, // JSON 形式で送信
        },
      ]);

    if (error) {
      throw error;
    }

    res.status(200).json({ message: 'レシピが保存されました。' });
  } catch (error: unknown) {
    if (error instanceof Error)
    console.error('Error saving recipe:', error.message);
    res.status(500).json({ message: 'レシピ保存中にエラーが発生しました。' });
  }
}
