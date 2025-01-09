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
  skinCare?: string,
  detox?: string,
  flavor?: string,
  cookingMethod?: string,
  ingredients?: string[],
  preferredIngredients?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      preferences= [],
      skinCare= '',
      detox= '',
      flavor= '',
      cookingMethod= '',
      ingredients= [],
      preferredIngredients = "",
    } = req.body as RecipeRequestBody;

    // プロンプトの生成
    const prompt = `
    あなたはプロの料理アドバイザーです。テーマは「美容・アンチエイジングレシピ」です。以下の条件に従って、美容・アンチエイジングに取り組む人が作りたいと思うようなレシピを提案してください。
    - 美容のこだわり: ${preferences.length ? preferences.join(", ") : "おまかせ"}
    - 肌質改善のこだわり: ${skinCare || "おまかせ"}
    - デトックスのこだわり: ${detox || "おまかせ"}
    - 味付け: ${flavor || "おまかせ"}
    - 調理法: ${cookingMethod || "おまかせ"}
    - 使用する食材: ${ingredients || "おまかせ"}
    - その他使いたい食材: ${preferredIngredients || "指定なし"}
    
    レシピには以下の情報を含めてください:
    1. レシピ名: 必ず "### レシピ名: {ここにタイトル}" の形式で記載してください。
    2. 必要な材料リスト: 材料と分量を具体的に明記してください。また、オプションの材料も提案してください。
    3. 詳細な調理手順: 一番重要な部分なので丁寧な説明を心がけてください。
    4. 完成までの時間
    5. 調理のポイント: 美味しく仕上げるための具体的な工夫を記載してください。
    6. 栄養情報: 1人分あたりのカロリー、タンパク質、脂質、炭水化物量の推定値を記載してください。
    7. 他の料理との組み合わせ提案
    8. 美容や健康効果の簡単な説明: レシピが美容やアンチエイジングにどのように役立つかを具体的に説明してください。
    
    【注意事項】
    - 各セクションは必ず記載してください。
    - 情報は具体的かつ役立つ内容にしてください。
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
