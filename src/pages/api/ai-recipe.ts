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
  budget?: string;
  people?: string;
  effort?: string[];
  preferredIngredients?: string;
  avoidedIngredients?: string;
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
      budget,
      people,
      effort = [],
      preferredIngredients = "",
      avoidedIngredients = "",
    } = req.body as RecipeRequestBody;

    // プロンプトの生成
    const prompt = `
あなたはプロの料理アドバイザーです。以下の条件を元にユーザーが作りたいと思うようなレシピを提案してください。
- 今日の気分: ${mood || "指定なし"}
- 調理時間: ${time || "指定なし"}
- 食べる時間帯: ${mealTime || "指定なし"}
- 予算: ${budget || "指定なし"}
- 人数: ${people || "指定なし"}
- 手間: ${effort.length ? effort.join(", ") : "指定なし"}
- 好きな食材: ${preferredIngredients || "指定なし"}
- 避けたい食材: ${avoidedIngredients || "指定なし"}

レシピには以下の情報を含めてください:
1. レシピ名
2. 必要な材料リスト
3. 詳細な調理手順（初心者が安心して取り組める説明付き）
4. 完成までの時間
5. 調理のポイント（切り方や火加減など、初心者でも美味しく料理できる役立つ情報。）
    `;

    // ストリーミングレスポンスの設定
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    console.log("Sending request to OpenAI API...");

    // OpenAI ChatCompletion API を呼び出し（ストリーミング有効化）
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 現行バージョンのモデル名
      messages: [
        { role: "system", content: "あなたはプロの料理アドバイザーです。" },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.6,
      stream: true, // ストリーミングを有効化
    });

    console.log("Response from OpenAI API received.");

    // ストリームを逐次的にクライアントへ送信
    for await (const part of completion) {
      const content = part.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.end(); // ストリームを終了
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating recipe:", errorMessage);
    res.setHeader("Content-Type", "application/json");
    res.status(500).json({ message: "レシピ生成中にエラーが発生しました。", error: errorMessage });
  }
}
