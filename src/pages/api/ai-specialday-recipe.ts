// pages/api/ai-recipe.ts
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// OpenAI API の設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // .env.localにAPIキーを保存
});

// フォームデータの型定義
type RecipeRequestBody = {
  event?: string;
  theme?: string;
  style?: string;
  ingredient?: string;
  tableSetting?: string;
  customNotes?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      event= '',
      theme= '',
      style= '',
      ingredient= '',
      tableSetting= '',
      customNotes= '',
    } = req.body as RecipeRequestBody;

    // プロンプトの生成
    const prompt = `
あなたはプロの料理アドバイザーです。テーマは「特別な日に作る料理」です。以下の条件に従って記念日を演出したい人が興味を持って作りたいと思うようなレシピを一品提案してください。
- イベントの種類: ${event || "指定なし"}
- 料理のテーマ: ${theme || "指定なし"}
- 料理のスタイル: ${style || "指定なし"}
- 使いたい食材: ${ingredient || "指定なし"}
- テーブルセッティング: ${tableSetting || "指定なし"}
- 特別な希望やメモ: ${customNotes || "指定なし"}

レシピには以下の情報を含めてください:
1. レシピ名: 必ず "### レシピ名: {ここにタイトル}" の形式で記載してください。
2. 必要な材料リスト: 分量を具体的に明記し、特別感を演出するための特別な食材や代替案も提案してください。
3. 詳細な調理手順: 初心者が安心して取り組める説明を心がけ、成功させるためのヒントや演出の工夫を含めてください。
4. 完成までの時間
5. 調理のポイント: 切り方や火加減、特別感を演出する盛り付け方や小技などを記載してください。
6. 特別な日の演出ポイント: ロウソクや音楽など、料理と一緒に楽しむ演出のアイデアを提案してください。
7. おすすめのドリンクペアリング: 特別な日に合うワインやカクテル、ノンアルコール飲料を提案してください。
8. アレンジ例: イベントのテーマに合わせて簡単に変更できるアレンジ方法を提案してください。

【注意事項】
- 各セクションは必ず記載してください。
- 特別な日を演出するための具体的な工夫を盛り込んでください。
- 初心者でも特別感を演出できるよう、分かりやすく説明してください。
- 見た目や味だけでなく、体験として楽しめる内容にしてください。
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
