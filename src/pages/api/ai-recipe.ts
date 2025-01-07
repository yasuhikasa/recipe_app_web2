// pages/api/ai-recipe.ts
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// OpenAI API の設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // .env.localにAPIキーを保存
});

// フォームデータの型定義
type RecipeRequestBody = {
  mood?: string;
  time?: string;
  mealTime?: string;
  mealStyle?: string;
  ingredientCategory?: string;
  effort?: string[];
  preferredIngredients?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      mood,
      time,
      mealTime,
      mealStyle,
      ingredientCategory,
      effort = [],
      preferredIngredients = "",
    } = req.body as RecipeRequestBody;

    // プロンプトの生成
    const prompt = `
あなたはプロの料理アドバイザーです。テーマは「今の気分で作る料理」です。以下の条件に従ってアドバイスを受ける人が興味を持って作りたいと思うようなレシピを一品提案してください。
- 今の気分: ${mood || "指定なし"}
- 調理時間: ${time || "指定なし"}
- 食べる時間帯: ${mealTime || "指定なし"}
- 食事のスタイル: ${mealStyle || "指定なし"}
- 食材カテゴリー: ${ingredientCategory || "指定なし"}
- 手間: ${effort.length ? effort.join(", ") : "指定なし"}
- 好きな食材: ${preferredIngredients || "指定なし"}

レシピには以下の情報を含めてください:
1. レシピ名: 必ず "### レシピ名: {ここにタイトル}" の形式で記載してください。
2. 必要な材料リスト
3. 詳細な調理手順: 初心者が安心して取り組める説明を心がけてください。
4. 完成までの時間
5. 調理のポイント: 初心者でも美味しく料理できる役立つ情報。
6. 健康志向やリラックス効果の要素: その料理が健康や気分にどのように良い影響を与えるかを説明してください。
7. 他の料理との組み合わせ提案
8. アレンジ提案: 気分や食材の在庫によって変化を加える方法や、手間を省く工夫を提案してください。

【注意事項】
- 各セクションは必ず記載してください。
- 気分に寄り添った内容で、ユーザーが共感できる提案を心がけてください。
- 気分や状況に合わせて柔軟にアレンジできるアイデアを含めてください。
    `;

    console.log("Sending request to OpenAI API...");

    // OpenAI ChatCompletion API を呼び出し（ストリーミング無効化）
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 現行バージョンのモデル名
      messages: [
        { role: "system", content: "あなたはプロの料理アドバイザーです。" },
        { role: "user", content: prompt },
      ],
      max_tokens: 1300,
      temperature: 0.6,
      stream: false, // ストリーミングを無効化
    });

    console.log("Response from OpenAI API received.");

    // レシピをクライアントに送信
    res.status(200).json({ recipe: completion.choices[0]?.message?.content });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating recipe:", errorMessage);
    res.status(500).json({ message: "レシピ生成中にエラーが発生しました。", error: errorMessage });
  }
}
