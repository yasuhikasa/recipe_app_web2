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
  dietFlavor?: string,
  cookingTime?: string,
  dietCookingMethods?: string,
  dietIngredient?: string[],
  preferredIngredients?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      preferences = [],
      dietFlavor = "",
      cookingTime = "",
      dietCookingMethods = "",
      dietIngredient = [],
      preferredIngredients = "",
    } = req.body as RecipeRequestBody;

    // プロンプトの生成
    const prompt = `
あなたはプロの料理アドバイザーです。テーマは「ダイエットレシピ」です。以下の条件に従ってダイエットに取り組む人が作りたいと思うようなダイエットレシピを提案してください。
- ダイエットのこだわり: ${preferences.length ? preferences.join(", ") : "おまかせ"}
- 味付けのこだわり: ${dietFlavor || "おまかせ"}
- 調理時間: ${cookingTime || "おまかせ"}
- 調理法: ${dietCookingMethods || "おまかせ"}
- 使用する食材: ${dietIngredient || "おまかせ"}
- その他使いたい食材: ${preferredIngredients || "指定なし"}

レシピには以下の情報を含めてください:
1. レシピ名: 必ず "### レシピ名: {ここにタイトル}" の形式で記載してください。
2. 必要な材料リスト: 材料と分量を具体的に明記してください。また、低カロリーで栄養価の高いオプションを提案してください。
3. 詳細な調理手順: 初心者向けの説明を心がけてください。
4. 完成までの時間
5. 調理のポイント: 美味しく仕上げるための具体的な工夫を記載してください。
6. 栄養情報: カロリー、タンパク質、脂質、炭水化物、食物繊維の推定値を含めてください。
7. ダイエットの効果説明: このレシピがどのようにダイエットに役立つのか、科学的または実用的な理由を説明してください。
8. バリエーション提案: 使用する食材や調理法を変えたアレンジ方法を提案してください。

【注意事項】
- 各セクションは必ず記載してください。
- 情報は具体的かつ視覚的にイメージしやすい内容にしてください。
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
      max_tokens: 1400,
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
