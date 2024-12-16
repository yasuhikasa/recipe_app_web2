import React, { useState } from "react";
import { auth } from "../../../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { TextField, Button, Container, Typography, Box, Link } from "@mui/material";
import { useRouter } from "next/router";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Next.js のルーター

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("アカウントが作成されました！");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        console.error(error);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          サインアップ
        </Typography>
        <TextField
          label="メールアドレス"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="パスワード"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSignUp}
        >
          サインアップ
        </Button>
        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            アカウントをお持ちの方はこちら
          </Typography>
          <Link
            component="button"
            variant="body2"
            onClick={() => router.push("/auth/login/email")}
            style={{ cursor: "pointer" }}
          >
            ログイン
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default SignUp;
