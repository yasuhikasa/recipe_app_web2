// components/RecipeFormExtended.tsx
import React, { useState } from "react";
import {
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Grid,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material";
import axios from "axios";
import {
  moodOptions,
  cookingTimeOptions,
  effortOptions,
  mealTimeOptions,
  budgetOptions,
  peopleOptions,
  preferenceOptions,
} from "@/utils/options";
import RecipeModal from "../RecipeModal";

// 型定義
type FormData = {
  mood: string;
  time: string;
  mealTime: string;
  budget: string;
  effort: string[];
  preferredIngredients: string; // 使いたい食材
  avoidedIngredients: string; // 避けたい食材
  people: string; // 人数
  preference: string; // 趣向
};

const RecipeFormExtended = () => {
  const [formData, setFormData] = useState<FormData>({
    mood: "",
    time: "",
    mealTime: "",
    budget: "",
    effort: [],
    preferredIngredients: "",
    avoidedIngredients: "",
    people: "",
    preference: "",
  });

  const [generatedRecipe, setGeneratedRecipe] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  // ローディング状態
  const [loading, setLoading] = useState(false);
  // レシピ生成中のローディング状態
  const [isGenerating, setIsGenerating] = useState(false);

  // バリデーション
  const [error, setError] = useState<string | null>(null);

  // セレクトボックスの変更ハンドラー
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // チェックボックスの変更ハンドラー
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target;
    setFormData((prev) => {
      const updatedValues = checked
        ? [...(prev[name as keyof FormData] as string[]), value]
        : (prev[name as keyof FormData] as string[]).filter((item) => item !== value);
      return { ...prev, [name]: updatedValues };
    });
  };

  // テキストフィールドの変更ハンドラー
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // レシピ生成関数
  const generateRecipe = async () => {
    try {
      setIsGenerating(true); // モーダル内のローディング開始
      const response = await axios.post("/api/ai-recipe", formData);
      setGeneratedRecipe(response.data.recipe);
    } catch (error) {
      console.error("Error generating recipe:", error);
      setError("レシピ生成中にエラーが発生しました。");
    } finally {
      setIsGenerating(false); // モーダル内のローディング終了
      setModalOpen(true); // モーダルを開く
    }
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 必須項目のバリデーション
    if (!formData.mood || !formData.time) {
      setError("気分と調理時間は必須項目です！");
      return;
    }

    setError(null); // エラーをリセット
    setLoading(true); // フォーム全体のローディング開始
    await generateRecipe(); // レシピ生成関数を呼び出す
    setLoading(false); // フォーム全体のローディング終了
  };

  // レシピ保存
 const handleSave = async (title: string) => {
  try {
    const response = await axios.post("/api/save-recipe", {
      recipe: generatedRecipe, // レシピ詳細
      formData, // フォームデータ
      title, // ユーザーが入力したタイトル
    });
    alert(response.data.message);
    setModalOpen(false);
  } catch (error) {
    console.error("Error saving recipe:", error);
    alert("レシピの保存中にエラーが発生しました。");
  }
};

  // モーダルを閉じる
  const handleClose = () => {
    setModalOpen(false);
  };

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: 800,
        mx: "auto",
        mt: 5,
        bgcolor: "linear-gradient(to bottom right, #ffe5d5, #fffaf0)",
        borderRadius: 3,
        boxShadow: "0 8px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          textAlign: "center",
          color: "#ff6347",
          mb: 4,
          fontFamily: "cursive",
        }}
      >
        🍳 あなたのこだわりレシピを探そう
      </Typography>

      {loading ? (
        <Typography>レシピ生成中です...⏳</Typography>
      ) : (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* 気分セクション */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="mood-label">今日の気分😃</InputLabel>
                <Select
                  labelId="mood-label"
                  id="mood"
                  name="mood"
                  value={formData.mood}
                  onChange={handleSelectChange}
                  required
                >
                  {moodOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 調理時間セクション */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="time-label">調理時間⏰</InputLabel>
                <Select
                  labelId="time-label"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleSelectChange}
                  required
                >
                  {cookingTimeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 食べる時間帯セクション */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="meal-time-label">食べる時間帯🍽️</InputLabel>
                <Select
                  labelId="meal-time-label"
                  id="mealTime"
                  name="mealTime"
                  value={formData.mealTime}
                  onChange={handleSelectChange}
                  required
                >
                  {mealTimeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 予算セクション */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="budget-label">予算💰</InputLabel>
                <Select
                  labelId="budget-label"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleSelectChange}
                  required
                >
                  {budgetOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 人数セクション */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="people-label">人数👨‍👩‍👧‍👦</InputLabel>
                <Select
                  labelId="people-label"
                  id="people"
                  name="people"
                  value={formData.people}
                  onChange={handleSelectChange}
                  required
                >
                  {peopleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 趣向セクション */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="preference-label">趣向🍽️</InputLabel>
                <Select
                  labelId="preference-label"
                  id="preference"
                  name="preference"
                  value={formData.preference}
                  onChange={handleSelectChange}
                >
                  {preferenceOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 手間セクション */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: "#555" }}>
                手間
              </Typography>
              {effortOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      name="effort"
                      value={option.value}
                      onChange={handleCheckboxChange}
                      checked={formData.effort.includes(option.value)}
                    />
                  }
                  label={option.label}
                />
              ))}
            </Grid>

            {/* テキストフィールドセクション */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: "#555", mb: 2 }}>
                詳細設定
              </Typography>

              {/* 使いたい食材 */}
              <TextField
                fullWidth
                multiline
                label="使いたい食材 🥕"
                name="preferredIngredients"
                value={formData.preferredIngredients}
                onChange={handleInputChange}
                placeholder="例: 鶏肉, トマト　（20文字以内）"
                inputProps={{ maxLength: 20 }}
                sx={{ mb: 2 }}
              />

              {/* 避けたい食材 */}
              <TextField
                fullWidth
                multiline
                label="避けたい食材 🚫"
                name="avoidedIngredients"
                value={formData.avoidedIngredients}
                onChange={handleInputChange}
                placeholder="例: パクチー, ナス　（20文字以内）"
                inputProps={{ maxLength: 20 }}
                sx={{ mb: 2 }}
              />
            </Grid>

            {/* エラーメッセージ */}
            {error && (
              <Grid item xs={12}>
                <Typography color="error">{error}</Typography>
              </Grid>
            )}

            {/* 提出ボタン */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: "#ff6347",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  py: 1.5,
                  ":hover": { bgcolor: "#e55347" },
                }}
              >
                レシピを探す 🚀
              </Button>
            </Grid>
          </Grid>
        </form>
      )}

      {/* モーダル */}
      {generatedRecipe && (
        <RecipeModal
          open={modalOpen}
          recipe={generatedRecipe}
          onClose={handleClose}
          onSave={handleSave}
          onGenerateNewRecipe={generateRecipe} // 修正: handleSubmitではなくgenerateRecipeを渡す
          isGenerating={isGenerating} // 新しいプロパティを渡す
        />
      )}
    </Box>
  );
};

export default RecipeFormExtended;
