import React from "react";
import { Button, Container, Typography, Box } from "@mui/material";
import { useRouter } from "next/router";

const AuthHome: React.FC = () => {
  const router = useRouter();

  return (
    <Container maxWidth="sm">
      <Box mt={5} textAlign="center">
        <Typography variant="h4" gutterBottom>
          認証方法を選択してください
        </Typography>
        <Typography variant="body1" gutterBottom>
          ご希望の認証方法を選んで進んでください。
        </Typography>
        <Box mt={3}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => router.push("/auth/signup/email")}
          >
            メールアドレスで認証
          </Button>
        </Box>
        <Box mt={2}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={() => router.push("/auth/signup/phone")}
          >
            電話番号で認証
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AuthHome;
