// pages/api/ai-recipe.ts
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// OpenAI API の設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // .env.localにAPIキーを保存
});

// フォームデータの型定義
type RecipeRequestBody = {
  preferences?: string[],
  appearanceTheme?: string,
  cookingTime?: string,
  taste?: string,
  healthFocus?: string,
  preferredIngredients?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      preferences = [],
      appearanceTheme = "",
      cookingTime = "",
      taste = "",
      healthFocus = "",
      preferredIngredients = "",
    } = req.body as RecipeRequestBody;

    // プロンプトの生成
    const prompt = `
あなたはプロの料理アドバイザーです。テーマは「子供が喜ぶ料理」です。以下の条件に従って子供を持つ母親が作りたいと思うような子供が喜ぶレシピを提案してください。
- 子供が喜ぶポイント: ${preferences.length ? preferences.join(", ") : "おまかせ"}
- 見た目のテーマ: ${appearanceTheme || "おまかせ"}
- 調理時間: ${cookingTime || "おまかせ"}
- 味付けのバリエーション: ${taste || "おまかせ"}
- 健康志向のこだわり: ${healthFocus || "おまかせ"}
- 好きな食材: ${preferredIngredients || "指定なし"}

レシピには以下の情報を含めてください:
1. レシピ名: 必ず "### レシピ名: {ここにタイトル}" の形式で記載してください。
2. 必要な材料リスト
3. 詳細な調理手順（初心者が安心して取り組める説明付き）
4. 完成までの時間
5. 調理のポイント（切り方や火加減など、初心者でも美味しく料理できる役立つ情報。）

【注意事項】
- 各セクションは必ず記載してください
    `;

    console.log("Sending request to OpenAI API...");

    // OpenAI ChatCompletion API を呼び出し（ストリーミング無効化）
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 現行バージョンのモデル名
      messages: [
        { role: "system", content: "あなたはプロの料理アドバイザーです。" },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
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
