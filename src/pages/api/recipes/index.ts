// 型定義を変更
type LabelData = {
  id: string;
  name: string;
};

type RecipeLabelData = {
  label_id: string;
  labels: LabelData[]; // 単一オブジェクトでなく配列として定義
};

type RecipeRow = {
  id: string;
  title: string;
  created_at: string;
  recipe_labels?: RecipeLabelData[];
};

// pages/api/recipes/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { user_id, label_id } = req.query;

  if (typeof user_id !== 'string') {
    return res.status(400).json({ message: 'user_id is required' });
  }

  switch (method) {
    case 'GET': {
      let query = supabase
        .from('recipes')
        .select(`
          id, title, created_at,
          recipe_labels ( label_id, labels ( id, name ) )
        `)
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

      if (label_id && typeof label_id === 'string') {
        query = query.eq('recipe_labels.label_id', label_id);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      if (!data) {
        return res.status(200).json({ recipes: [] });
      }

      // ここでunknown経由でアサート
      const typedData = data as unknown as RecipeRow[];

      // 複数のlabels配列があるのでflatMapで平坦化するか、そのままネストを維持するか選ぶ
      // ここでは全てのラベルをまとめて一つの配列に格納
      const recipes = typedData.map((r) => ({
        id: r.id,
        title: r.title,
        labels: r.recipe_labels
          ? r.recipe_labels.flatMap((rl) => rl.labels) // 複数のlabelを持つ場合
          : [],
      }));

      return res.status(200).json({ recipes });
    }

    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
