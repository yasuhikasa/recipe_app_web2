import React, { useState } from "react";
import { getAuth, PhoneAuthProvider, RecaptchaVerifier, signInWithCredential, signInWithPhoneNumber } from "firebase/auth";
import { TextField, Button, Container, Typography, Box } from "@mui/material";

const SignUpPhone: React.FC = () => {
  const [phone, setPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [verificationId, setVerificationId] = useState<string | null>(null);

  // Firebase Authのインスタンスを取得
  const auth = getAuth();

  // OTP送信時にreCAPTCHAを初期化
  const sendOtp = async () => {
    // RecaptchaVerifier の初期化 (auth を第一引数に渡す)
    const recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "normal", // Visible reCAPTCHA
      callback: (response: string) => {
        console.log("reCAPTCHA solved:", response);
      },
      "expired-callback": () => {
        console.log("reCAPTCHA expired, please try again.");
      },
    });

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
      setVerificationId(confirmationResult.verificationId);
      alert("OTPが送信されました。");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
      console.error("Error during signInWithPhoneNumber", error);
    }
  }
  };

  // OTPを確認
  const verifyOtp = async () => {
    if (!verificationId) {
      alert("Verification IDが存在しません");
      return;
    }

    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential);
      alert("サインインに成功しました！");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        console.error("Error during signInWithCredential", error);
    }
  }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          電話番号でサインアップ
        </Typography>
        <div id="recaptcha-container"></div>
        <TextField
          label="電話番号"
          variant="outlined"
          fullWidth
          margin="normal"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={sendOtp}
        >
          OTPを送信
        </Button>
        {verificationId && (
          <Box mt={3}>
            <TextField
              label="OTPコード"
              variant="outlined"
              fullWidth
              margin="normal"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={verifyOtp}
            >
              OTPを確認
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default SignUpPhone;
