// components/RecipeModal.tsx
import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// モーダルのアクセシビリティ設定
// Next.jsを使用している場合は '#__next' を指定
// create-react-appを使用している場合は '#root' を指定
ReactModal.setAppElement("#__next");

type RecipeModalProps = {
  open: boolean;
  recipe: string;
  onClose: () => void;
  onSave: (title: string) => void;
  onGenerateNewRecipe: () => void;
  isGenerating: boolean; // 新しいプロパティを追加
};

// モーダルのスタイル定義
const customStyles: ReactModal.Styles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "90%", // レスポンシブ幅
    maxWidth: "600px", // 最大幅
    maxHeight: "80vh", // 最大高さ
    overflowY: "auto", // 縦方向にスクロール可能
    display: "flex",
    flexDirection: "column",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000, // モーダルを最前面に
  },
};

const RecipeModal: React.FC<RecipeModalProps> = ({
  open,
  recipe,
  onClose,
  onSave,
  onGenerateNewRecipe,
  isGenerating, // 受け取ったプロパティを追加
}) => {
  const [title, setTitle] = useState<string>("");

  // レシピ名を抽出して初期値に設定
  useEffect(() => {
    if (recipe) {
      console.log("Generated Recipe:", recipe); // デバッグ用
      const regex = /^###\s*レシピ名:\s*(.+)$/m;
      const match = recipe.match(regex);
      if (match && match[1]) {
        setTitle(match[1].trim());
      } else {
        console.warn("レシピ名が見つかりませんでした");
        setTitle("");
      }
    }
  }, [recipe]);

  // 背景のスクロールを防止
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const handleSave = () => {
    if (!title.trim()) {
      alert("タイトルを入力してください。");
      return;
    }
    onSave(title.trim());
  };

  return (
    <ReactModal
      isOpen={open}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Recipe Modal"
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      shouldFocusAfterRender={true}
      shouldReturnFocusAfterClose={true}
    >
      <h2 style={{ color: "#ff6347", marginBottom: "1em", textAlign: "center" }}>
        AIが提案したレシピ 🍴
      </h2>
      {isGenerating ? (
        <div style={{ textAlign: "center", marginBottom: "1.5em" }}>
          レシピを生成中です...⏳
        </div>
      ) : (
        <>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{recipe}</ReactMarkdown>
            <div style={{ marginBottom: "1.5em", textAlign: "center" }}>
  <h4 style={{ color: "#ff6347", marginBottom: "1em" }}>
    保存するレシピタイトルを設定してください 🍴
  </h4>
  <input
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="レシピタイトルを入力してください"
    style={{
      width: "80%",
      minHeight: "25px",
      padding: "10px",
      margin: "auto",
      marginBottom: "20px",
      borderRadius: "4px",
      border: "1px solid #ccc",
      fontSize: "16px",
      display: "block", // 中央寄せのために追加
    }}
  />
</div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          width: "100%",
        }}
      >
        <button
          onClick={handleSave}
          style={{
            padding: "10px 20px",
            backgroundColor: "#ff6347",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
          }}
          disabled={isGenerating} // ボタンを無効化
        >
          保存する
        </button>
        <button
          onClick={onClose}
          style={{
            padding: "10px 20px",
            backgroundColor: "#fff",
            color: "#ff6347",
            border: "2px solid #ff6347",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
          }}
          disabled={isGenerating} // ボタンを無効化
        >
          保存しない
        </button>
        {!isGenerating && (
          <button
            onClick={onGenerateNewRecipe}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50", // 緑色
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            別のレシピを見る
          </button>
        )}
      </div>
      </>
      )}
    </ReactModal>
  );
};

export default RecipeModal;
