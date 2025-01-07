// pages/api/ai-recipe.ts
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// OpenAI API の設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // .env.localにAPIキーを保存
});

// フォームデータの型定義
type RecipeRequestBody = {
  spiceLevel?: string,
  spiceType?: string,
  cookingMethod?: string,
  mainIngredient?: string,
  flavorTheme?: string,
  dishTexture?: string,
  finalTouch?: string,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      spiceLevel= '',
      spiceType= '',
      cookingMethod= '',
      mainIngredient= '',
      flavorTheme= '',
      dishTexture= '',
      finalTouch= '',
    } = req.body as RecipeRequestBody;

    // プロンプトの生成
    const prompt = `
あなたはプロの料理アドバイザーです。テーマは「ピリ辛レシピ」です。以下の条件に従ってピリ辛料理が大好きな人が作りたいと思うようなレシピを提案してください。
- 辛さのレベル: ${spiceLevel|| "おまかせ"}
- 辛味の種類: ${spiceType || "おまかせ"}
- 調理法: ${cookingMethod || "おまかせ"}
- メインの食材: ${mainIngredient || "おまかせ"}
- 風味のテーマ: ${flavorTheme || "おまかせ"}
- 食感: ${dishTexture || "おまかせ"}
- 仕上げ: ${finalTouch || "おまかせ"}

レシピには以下の情報を含めてください:
1. レシピ名: 必ず "### レシピ名: {ここにタイトル}" の形式で記載してください。
2. 必要な材料リスト: 分量を具体的に明記し、辛さを調節できるオプションや代替案も記載してください。
3. 詳細な調理手順: 初心者が安心して取り組める説明を心がけ、注意点や成功させるためのヒントを含めてください。
4. 完成までの時間
5. 調理のポイント: 切り方や火加減、盛り付け方など、初心者でも美味しく料理できる役立つ情報。
6. 辛さ調整の方法: 辛さを増減するための調整方法（例: スパイスの追加や控えめな使い方）を提案してください。
7. 辛味の種類に応じた楽しみ方: スパイスや調味料に関する背景情報や、辛味の特徴を引き立てる組み合わせを提案してください。
8. バリエーション提案: 他の辛味の種類や食材を使ったアレンジ例を提案してください。

【注意事項】
- 各セクションは必ず記載してください。
- 辛さだけでなく、風味や食感を重視し、ピリ辛の魅力を最大限引き出してください。
- 初心者から上級者まで楽しめる内容にしてください。
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
