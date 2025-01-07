// pages/api/ai-fusion-recipe.ts
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// OpenAI API の設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // .env.localにAPIキーを保存
});

// フォームデータの型定義
type FusionRecipeRequestBody = {
  baseCuisine?: string;
  fusionElement?: string;
  flavorProfile?: string;
  cookingMethod?: string;
  preferredIngredients?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      baseCuisine = "",
      fusionElement = "",
      flavorProfile = "",
      cookingMethod = "",
      preferredIngredients = "",
    } = req.body as FusionRecipeRequestBody;

    // プロンプトの生成
    const prompt = `
    あなたはプロの料理アドバイザーです。テーマは「フュージョン料理」です。以下の条件に従って、異なる文化を組み合わせたユニークな料理を提案してください。
    - ベースの料理スタイル: ${baseCuisine || "おまかせ"}
    - フュージョンの要素: ${fusionElement || "おまかせ"}
    - 味の特徴: ${flavorProfile || "おまかせ"}
    - 調理法: ${cookingMethod || "おまかせ"}
    - その他使いたい食材: ${preferredIngredients || "指定なし"}

    レシピには以下の情報を含めてください:
    1. レシピ名: 必ず "### レシピ名: {ここにタイトル}" の形式で記載してください。
    2. 必要な材料リスト: 材料と分量を具体的に明記してください。また、オプションの材料も提案してください。
    3. 詳細な調理手順: 初心者向けの説明を心がけ、注意点や成功させるためのヒントを含めてください。
    4. 完成までの時間
    5. 調理のポイント: 切り方や火加減、器具の使い方など、美味しく仕上げるための具体的な工夫を記載してください。
    6. フュージョン要素の説明: なぜこの組み合わせが面白いのか、またどのように文化的特徴が取り入れられているかを記載してください。
    7. 他の料理との組み合わせ提案: 相性の良いサイドメニューや飲み物を挙げてください。

    【注意事項】
    - 各セクションは必ず記載してください。
    - 情報は具体的かつ役立つ内容にし、視覚的にもイメージしやすい表現を心がけてください。
    - 初心者から中級者まで楽しめる内容にしてください。
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
