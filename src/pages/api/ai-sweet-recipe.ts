// pages/api/ai-recipe.ts
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// OpenAI API の設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // .env.localにAPIキーを保存
});

// フォームデータの型定義
type RecipeRequestBody = {
  sweetType?: string,
  sweetFlavor?: string,
  sweetDecoration?: string,
  sweetTexture?: string,
  sweetCookingMethod?: string,
  sweetIngredient?: string,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      sweetType= '',
      sweetFlavor= '',
      sweetDecoration= '',
      sweetTexture= '',
      sweetCookingMethod= '',
      sweetIngredient= '',
    } = req.body as RecipeRequestBody;

    // プロンプトの生成
    const prompt = `
あなたはプロのパティシエ、料理アドバイザーです。テーマは「女子受けするスイーツレシピ」です。以下の条件に従ってスイーツ作りに取り組む女の子が作りたいと思うようなレシピを提案してください。
- スイーツの種類: ${sweetType|| "おまかせ"}
- 味のテーマ: ${sweetFlavor || "おまかせ"}
- デコレーション: ${sweetDecoration || "おまかせ"}
- 食感: ${sweetTexture || "おまかせ"}
- 調理方法: ${sweetCookingMethod || "おまかせ"}
- 使用する食材: ${sweetIngredient || "おまかせ"}

レシピには以下の情報を含めてください:
1. レシピ名: 必ず "### レシピ名: {ここにタイトル}" の形式で記載してください。
2. 必要な材料リスト: 分量を具体的に明記し、初心者でも揃えやすい代替案も提案してください。
3. 詳細な調理手順: 初心者が安心して取り組める説明を心がけ、注意点や成功させるためのヒントを含めてください。
4. 完成までの時間
5. 調理のポイント: 火加減や混ぜ方、特に失敗しやすい工程での注意点を記載してください。
6. デコレーションの工夫: 女子受けする色合いや形のアイデア、簡単なデコレーションテクニックを提案してください。
7. 味のバリエーション: 味の組み合わせを変えたアレンジ方法を提案してください（例: チョコレート、抹茶、フルーツベースなど）。
8. SNS映えポイント: 写真映えする盛り付けや演出のアイデアを提案してください。

【注意事項】
- 各セクションは必ず記載してください。
- 女子受けする要素を重視し、見た目と味を両立した内容にしてください。
- 初心者から中級者まで楽しめる内容にしてください。
- スイーツ作りの楽しさを伝える工夫を盛り込んでください。
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
