// pages/api/ai-recipe.ts
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// OpenAI API の設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // .env.localにAPIキーを保存
});

// フォームデータの型定義
type RecipeRequestBody = {
  preferences?: string[];
  bentoBoxType?: string;
  cookingTime?: string;
  ingredientType?: string;
  flavor?: string;
  storageMethod?: string;
  preferredIngredients?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      preferences = [],
      bentoBoxType = "",
      cookingTime = "",
      ingredientType = "",
      flavor = "",
      storageMethod = "",
      preferredIngredients = "",
    } = req.body as RecipeRequestBody;

    // プロンプトの生成
    const prompt = `
あなたはプロの料理アドバイザーです。テーマは「こだわりのお弁当」です。以下の条件に従ってアドバイスを受ける人が興味を持って作りたいと思うようなお弁当レシピを提案してください。
- お弁当の要望、こだわり: ${preferences.length ? preferences.join(", ") : "おまかせ"}
- お弁当箱のタイプ: ${bentoBoxType || "おまかせ"}
- 調理時間: ${cookingTime || "おまかせ"}
- 食材のタイプ: ${ingredientType || "おまかせ"}
- 味付けのバリエーション: ${flavor || "おまかせ"}
- 保存方法: ${storageMethod || "おまかせ"}
- 好きな食材: ${preferredIngredients || "指定なし"}

レシピには以下の情報を含めてください:
1. レシピ名: 必ず "### レシピ名: {ここにタイトル}" の形式で記載してください。
2. 必要な材料リスト:材料と分量を具体的に明記し、特に持ち運びや保存性を考慮した食材の提案も加えてください。
3. 詳細な調理手順: 初心者が安心して取り組める説明を心がけ、注意点や成功させるためのヒントを含めてください。
4. 完成までの時間
5. 調理のポイント: お弁当として調理するコツなど、初心者でも美味しく料理できる役立つ情報。
6. 栄養バランスの提案: タンパク質、炭水化物、野菜のバランスが取れるようなアドバイスを含めてください。
7. 彩りの工夫: お弁当全体が見た目にも魅力的になるよう、色のバランスや盛り付け方のアイデアを提案してください。
8. 保存と持ち運びの注意点: 食材ごとの保存性や持ち運び時の注意点（例えば、汁漏れ防止や腐敗を防ぐ工夫）を提案してください。

【注意事項】
- 各セクションは必ず記載してください。
- お弁当の持ち運びや保存を考慮した内容を重視してください。
- 初心者でも安心して作れる具体的かつ実用的なアドバイスを心がけてください。
- 見た目の良さ、保存性、美味しさをバランスよく重視してください。
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
