import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// OpenAI API の設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // .env.localにAPIキーを保存
});

// フォームデータの型定義
type LeftoverRecipeRequestBody = {
  mainIngredients?: string; // 必須
  cookingTime?: string;
  flavor?: string;
  dishType?: string;
  purpose?: string; // 新規項目
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      mainIngredients= '',
      cookingTime= '',
      flavor= '',
      dishType= '',
      purpose= '',
    } = req.body as LeftoverRecipeRequestBody;

    // プロンプトの生成
    const prompt = `
    あなたはプロの料理アドバイザーです。テーマは「冷蔵庫の残り物で作る料理」です。以下の条件に従って、冷蔵庫にある食材を使った美味しいレシピを提案してください。
    - 主な材料: ${mainIngredients || "指定なし"}
    - 調理時間: ${cookingTime || "指定なし"}
    - 味付けの好み: ${flavor || "指定なし"}
    - 料理のジャンル: ${dishType || "指定なし"}
    - 目的: ${purpose || "指定なし"}


    レシピには以下の情報を含めてください:
    1. レシピ名: 必ず "### レシピ名: {ここにタイトル}" の形式で記載してください。
    2. 必要な材料リスト:
      - 指定された材料を中心に、不足している場合は追加で必要な材料を提案してください。
    3. 詳細な調理手順:
      - 写真がなくてもイメージしやすいよう、切り方や器具の使い方など調理法を具体的に説明してください。
    4. 完成までの時間:
    5. 調理のポイント:
      - 美味しく仕上げるための具体的な工夫を記載してください。
    6. アレンジのアイデア:
      - 別の食材を使ったバリエーションや、余った料理をリメイクする方法を記載してください。
    7. 健康や栄養面の説明:
      - このレシピの健康的なポイントや栄養効果を簡単に説明してください。

    【注意事項】
    - 各セクションは必ず記載してください。
    - 情報は具体的で役立つ内容にし、初心者から中級者まで楽しめる内容にしてください。
    - 冷蔵庫にある材料を最大限活用してください。
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
