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
  appearanceTheme?: string,
  cookingTime?: string,
  taste?: string,
  healthFocus?: string,
  preferredIngredients?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      preferences = [],
      appearanceTheme = "",
      cookingTime = "",
      taste = "",
      healthFocus = "",
      preferredIngredients = "",
    } = req.body as RecipeRequestBody;

    // プロンプトの生成
    const prompt = `
あなたはプロの料理アドバイザーです。テーマは「子供が喜ぶ料理」です。以下の条件に従って子供を持つ母親が作りたいと思うような子供が喜ぶレシピを提案してください。
- 子供が喜ぶポイント: ${preferences.length ? preferences.join(", ") : "おまかせ"}
- 見た目のテーマ: ${appearanceTheme || "おまかせ"}
- 調理時間: ${cookingTime || "おまかせ"}
- 味付けのバリエーション: ${taste || "おまかせ"}
- 健康志向のこだわり: ${healthFocus || "おまかせ"}
- 好きな食材: ${preferredIngredients || "指定なし"}

レシピには以下の情報を含めてください:
1. レシピ名: 必ず "### レシピ名: {ここにタイトル}" の形式で記載してください。
2. 必要な材料リスト: 分量を具体的に明記し、子供の好みに合わせた食材の代替案も提案してください。
3. 詳細な調理手順: 一番重要な部分なので丁寧な説明を心がけてください。
4. 完成までの時間
5. 調理のポイント: 子供が食べやすい工夫を記載してください。
6. 見た目の工夫: 子供が喜ぶ盛り付けのアイデアを提案してください。
7. 栄養情報: カロリー、タンパク質、脂質、炭水化物、ビタミンの推定値を含め、健康志向の親が安心できる内容を記載してください。
8. バリエーション提案: アレンジ方法を提案してください。

【注意事項】
- 各セクションは必ず記載してください。
- 子供が喜ぶ要素を重視し、視覚的に魅力的で作りやすい内容にしてください。
- 親が安心して作れる健康志向の内容を心がけてください。
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
