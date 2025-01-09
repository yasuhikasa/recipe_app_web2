// pages/api/ai-recipe.ts
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// OpenAI API の設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // .env.localにAPIキーを保存
});

// フォームデータの型定義
type RecipeRequestBody = {
  baseAlcohol?: string;
  flavorProfile?: string;
  garnish?: string;
  style?: string;
  strength?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      baseAlcohol= '',
      flavorProfile= '',
      garnish= '',
      style= '',
      strength= '',
    } = req.body as RecipeRequestBody;

    // プロンプトの生成
    const prompt = `
あなたはプロのバーテンダー、カクテルアドバイザーです。テーマは「こだわりのカクテル」です。以下の条件に従ってお酒好きな人が作りたいと思うようなカクテルレシピを提案してください。
- ベースのお酒: ${baseAlcohol || "おまかせ"}
- フレーバープロファイル: ${flavorProfile || "おまかせ"}
- 使用する果物・ハーブ: ${garnish || "おまかせ"}
- 仕上げのスタイル: ${style || "おまかせ"}
- カクテルの強さ: ${strength || "おまかせ"}

レシピには以下の情報を含めてください:
1. レシピ名: 必ず "### レシピ名: {ここにタイトル}" の形式で記載してください。
2. 必要な材料リスト
3. 詳細な調理手順: 一番重要な部分なので丁寧な説明を心がけてください。
4. 完成までの時間
5. カクテル作りのポイント: 初心者でも美味しく仕上げられる役立つ情報。例: シェイクの回数や氷の量
6. おすすめのペアリングフード: カクテルに合う具体的な料理やおつまみを提案してください。
7. カスタマイズの提案
8. カクテルの歴史や背景情報

【注意事項】
- 各セクションは必ず記載してください。
- レシピは初心者から上級者まで幅広く楽しめる内容にしてください。
- 情報はできるだけ具体的に記載し、想像を膨らませる表現を心がけてください。
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
