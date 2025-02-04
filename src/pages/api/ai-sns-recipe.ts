// pages/api/ai-recipe.ts
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// OpenAI API の設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // .env.localにAPIキーを保存
});

// フォームデータの型定義
type RecipeRequestBody = {
  snsAppearance?: string,
  snsColorTheme?: string,
  snsPlatingIdea?: string,
  snsDishType?: string,
  snsIngredient?: string,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      snsAppearance= '',
      snsColorTheme= '',
      snsPlatingIdea= '',
      snsDishType= '',
      snsIngredient= '',
    } = req.body as RecipeRequestBody;

    // プロンプトの生成
    const prompt = `
あなたはプロの料理アドバイザーです。テーマは「こだわりのSNS映えレシピ」です。以下の条件に従ってSNS映え料理に取り組む女の子が作りたいと思うようなレシピを提案してください。
- 見た目のこだわり: ${snsAppearance|| "おまかせ"}
- 色合いのテーマ: ${snsColorTheme || "おまかせ"}
- 盛り付けアイデア: ${snsPlatingIdea || "おまかせ"}
- 料理の種類: ${snsDishType || "おまかせ"}
- 使用する食材: ${snsIngredient || "おまかせ"}

レシピには以下の情報を含めてください:
1. レシピ名: 必ず "### レシピ名: {ここにタイトル}" の形式で記載してください。
2. 必要な材料リスト: 分量を具体的に明記し、SNS映えを意識した特別な食材の提案も含めてください。
3. 詳細な調理手順: 一番重要な部分なので丁寧な説明を心がけてください。
4. 完成までの時間
5. 調理のポイント: 盛り付け方や色合いの調整など、SNS映えを意識した工夫を記載
6. 写真撮影のコツ: 料理をより魅力的に撮影するためのライティングや角度、背景のアイデアを記載
7. アレンジ例
8. シェアのためのコメント例: SNSに投稿する際のキャプション例や、ハッシュタグの提案を記載

【注意事項】
- 各セクションは必ず記載してください。
- SNS映えに特化した内容で、視覚的な魅力を最大限に引き出してください。
- 写真映えを考慮した盛り付けやデザインの提案を含めてください。
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
