// pages/api/ai-recipe.ts
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// OpenAI API の設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // .env.localにAPIキーを保存
});

// フォームデータの型定義
type RecipeRequestBody = {
  sauce: string;
  cookingStyle: string;
  garnish: string;
  winePairing: string;
  platingStyle: string;
  preferredIngredients: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      sauce= '',
      cookingStyle= '',
      garnish= '',
      winePairing= '',
      platingStyle= '',
      preferredIngredients= '',
    } = req.body as RecipeRequestBody;

    // プロンプトの生成
    const prompt = `
あなたはプロのビストロ料理アドバイザーです。テーマは「こだわりのビストロ料理」です。以下の条件に従ってビストロ料理に取り組む人が作りたいと思うようなレシピを提案してください。
- ソースの種類: ${sauce || "おまかせ"}
- 料理スタイル: ${cookingStyle || "おまかせ"}
- 付け合わせ: ${garnish || "おまかせ"}
- ワインペアリング: ${winePairing || "おまかせ"}
- 盛り付けスタイル: ${platingStyle || "おまかせ"}
- 使いたい食材: ${preferredIngredients || "指定なし"}

レシピには以下の情報を含めてください:
1. レシピ名
2. 必要な材料リスト
3. 詳細な調理手順（初心者が安心して取り組める説明付き）
4. 完成までの時間
5. 調理のポイント（切り方や火加減など、初心者でも美味しく料理できる役立つ情報。）
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
