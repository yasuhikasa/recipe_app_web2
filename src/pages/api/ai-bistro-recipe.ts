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
  difficulty: string;
  flavorTheme: string;
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
      difficulty= '',
      flavorTheme= '',
      platingStyle= '',
      preferredIngredients= '',
    } = req.body as RecipeRequestBody;

    // プロンプトの生成
    const prompt = `
あなたはプロのビストロ料理アドバイザーです。テーマは「こだわりのビストロ料理」です。以下の条件に従ってビストロ料理に取り組む人が作りたいと思うようなレシピを提案してください。
- ソースの種類: ${sauce || "おまかせ"}
- 料理スタイル: ${cookingStyle || "おまかせ"}
- 料理の難易度: ${difficulty || "おまかせ"}
- 風味のテーマ: ${flavorTheme || "おまかせ"}
- 盛り付けスタイル: ${platingStyle || "おまかせ"}
- 使いたい食材: ${preferredIngredients || "指定なし"}

レシピには以下の情報を含めてください:
1. レシピ名: 必ず "### レシピ名: {ここにタイトル}" の形式で記載してください。
2. 必要な材料リスト: 材料と分量を具体的に明記してください。また、オプションの材料も提案してください。
3. 詳細な調理手順: 一番重要な部分なので丁寧な説明を心がけてください。
4. 完成までの時間
5. 調理のポイント: 美味しく仕上げるための具体的な工夫を記載してください。
6. 季節感のあるアレンジ: 季節ごとに適した食材や盛り付けの工夫を提案してください。
7. 他の料理との組み合わせ提案
8. ビストロ風アレンジ例: 家庭で簡単に取り入れられるアレンジや代替材料の提案を含めてください。

【注意事項】
- 各セクションは必ず記載してください。
- 情報は具体的にしてください。
- 初心者から中級者まで楽しめる内容にしてください。
- ビストロ料理特有のエレガンスと親しみやすさを兼ね備えた情報を提供してください。
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
