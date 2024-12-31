// pages/api/ai-recipe.ts
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// OpenAI API の設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // .env.localにAPIキーを保存
});

// フォームデータの型定義
type RecipeRequestBody = {
  sweetType?: string,
  sweetFlavor?: string,
  sweetDecoration?: string,
  sweetTexture?: string,
  sweetCookingMethod?: string,
  sweetIngredient?: string,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      sweetType= '',
      sweetFlavor= '',
      sweetDecoration= '',
      sweetTexture= '',
      sweetCookingMethod= '',
      sweetIngredient= '',
    } = req.body as RecipeRequestBody;

    // プロンプトの生成
    const prompt = `
あなたはプロのパティシエ、料理アドバイザーです。テーマは「女子受けするスイーツレシピ」です。以下の条件に従ってスイーツ作りに取り組む女の子が作りたいと思うようなレシピを提案してください。
- スイーツの種類: ${sweetType|| "おまかせ"}
- 味のテーマ: ${sweetFlavor || "おまかせ"}
- デコレーション: ${sweetDecoration || "おまかせ"}
- 食感: ${sweetTexture || "おまかせ"}
- 調理方法: ${sweetCookingMethod || "おまかせ"}
- 使用する食材: ${sweetIngredient || "おまかせ"}

レシピには以下の情報を含めてください:
1. レシピ名: 必ず "### レシピ名: {ここにタイトル}" の形式で記載してください。
2. 必要な材料リスト
3. 詳細な調理手順（初心者が安心して取り組める説明付き）
4. 完成までの時間
5. 調理のポイント（切り方や火加減、盛り付け方など、初心者でも美味しく料理できる役立つ情報。）

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
