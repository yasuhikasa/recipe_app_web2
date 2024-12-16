import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCLRbxC1wPLTuUbhRmgTfSKVfzbwDUAgac",
  authDomain: "recipe-app-cd593.firebaseapp.com",
  projectId: "recipe-app-cd593",
  storageBucket: "recipe-app-cd593.firebaseapp.com",
  messagingSenderId: "1030535438261",
  appId: "1:1030535438261:web:f51be6b3bc74d6b4fc03fc",
  measurementId: "G-634MZNE20R"
};

const app = initializeApp(firebaseConfig);

// Analyticsの初期化 (ブラウザ環境のみ)
let analytics: Analytics | undefined; // 適切な型を指定
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    } else {
      console.warn("Firebase Analytics is not supported on this device.");
    }
  });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export { analytics }; // 必要に応じてエクスポート
