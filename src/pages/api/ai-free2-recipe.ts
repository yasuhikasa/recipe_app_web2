import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// OpenAI API の設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // .env.local に API キーを保存
});

// フォームデータの型定義
type Free2RecipeRequestBody = {
  mood?: string;
  purpose?: string;
  mealStyle?: string;
  ingredientCategory?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      mood = '',
      purpose = '',
      mealStyle = '',
      ingredientCategory = '',
    } = req.body as Free2RecipeRequestBody;

    // プロンプトの生成
    const prompt = `
    あなたはプロの料理アドバイザーです。テーマは「今日の1皿」です。以下の条件に従って、ユニークで美味しいレシピを提案してください。
    - 今の気分: ${mood || "おまかせ"}
    - 料理の目的: ${purpose || "おまかせ"}
    - 食事のスタイル: ${mealStyle || "おまかせ"}
    - 食材カテゴリー: ${ingredientCategory || "おまかせ"}

    レシピには以下の情報を含めてください:
    1. レシピ名: 必ず "### レシピ名: {ここにタイトル}" の形式で記載してください。
    2. 必要な材料リスト
    3. 詳細な調理手順: 一番重要な部分なので丁寧な説明を心がけてください。
    4. 完成までの時間
    5. 調理のポイント:
      - 美味しく仕上げるための具体的な工夫を記載してください。
    6. おすすめの盛り付け:
      - 見た目を引き立てる盛り付けの提案を記載してください。
    7. アレンジのアイデア:
      - 別の材料を使ったバリエーションや、余った料理をリメイクする方法を記載してください。
    8. 健康や栄養面の説明

    【注意事項】
    - 各セクションは必ず記載してください。
    - 情報は具体的で役立つ内容にし、初心者から中級者まで楽しめる内容にしてください。
    `;

    console.log("Sending request to OpenAI API...");

    // OpenAI ChatCompletion API を呼び出し
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // モデルの指定
      messages: [
        { role: "system", content: "あなたはプロの料理アドバイザーです。" },
        { role: "user", content: prompt },
      ],
      max_tokens: 1300,
      temperature: 0.7,
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
