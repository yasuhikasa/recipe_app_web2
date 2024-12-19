import nodemailer from 'nodemailer';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { toEmail, subject, message } = req.body;

    try {
      await sendConfirmationEmail(toEmail, subject, message);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Failed to send email' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function sendConfirmationEmail(
  toEmail: string,
  subject: string,
  message: string
) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Gmailアドレス
      pass: process.env.GMAIL_APP_PASSWORD, // アプリパスワード
    },
    secure: true,
  });

  // お客様にメールを送信
  await transporter.sendMail({
    from: process.env.GMAIL_USER, // 送信元
    to: toEmail, // 送信先
    subject: `【こだわりレシピアプリサポート】お問い合わせありがとうございます`, // 件名
    text: `以下の内容でお問い合わせを受け付けました:\n\n${subject}\n\n${message}`, // 本文
  });

  // 自分自身にもメールを送信
  await transporter.sendMail({
    from: process.env.GMAIL_USER, // 送信元
    to: process.env.GMAIL_USER, // 受信先（自分自身に送信）
    replyTo: toEmail, // 返信先
    subject: `こだわりレシピアプリ内より新しいお問い合わせ - ${subject}`,
    text: `お客様のメールアドレス: ${toEmail}\n\nお問い合わせ内容:\n\n${message}`,
  });
}
