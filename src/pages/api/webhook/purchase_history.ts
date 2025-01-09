import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import * as jose from 'jose';
import * as crypto from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Supabaseの環境変数が設定されていません。');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface AppleNotificationData {
  appAppleId: number;
  bundleId: string;
  environment: string;
  signedTransactionInfo?: string;
}

interface SignedTransactionInfo {
  transactionId: string;
  productId: string;
  purchaseDate: string;
  price: number;
}

interface AppleNotificationPayload {
  notificationType: string;
  subtype?: string;
  data: AppleNotificationData;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { signedPayload } = req.body;

    if (!signedPayload) {
      return res.status(400).json({ error: 'No signedPayload provided.' });
    }

    const decodedPayload: AppleNotificationPayload =
      await decodeJwt<AppleNotificationPayload>(signedPayload);
    console.log('Decoded Payload:', JSON.stringify(decodedPayload, null, 2));

    const { data } = decodedPayload;

    if (!data.signedTransactionInfo) {
      return res
        .status(400)
        .json({ error: 'Missing signedTransactionInfo in the payload.' });
    }

    const transactionInfo = await decodeJwt<SignedTransactionInfo>(
      data.signedTransactionInfo
    );

    console.log(
      'Decoded signedTransactionInfo:',
      JSON.stringify(transactionInfo, null, 2)
    );

    // 購入情報を保存
    await savePurchaseToSupabase(transactionInfo);

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

async function decodeJwt<T>(signedPayload: string): Promise<T> {
  try {
    const header = jose.decodeProtectedHeader(signedPayload);

    if (!header.x5c || !Array.isArray(header.x5c) || header.x5c.length === 0) {
      throw new Error('x5c field is missing in JWT header.');
    }

    const x5cCertificate = header.x5c[0];
    const pemCertificate = `-----BEGIN CERTIFICATE-----\n${x5cCertificate.match(/.{1,64}/g)?.join('\n')}\n-----END CERTIFICATE-----`;
    const publicKey = crypto.createPublicKey(pemCertificate);

    const { payload } = await jose.jwtVerify(signedPayload, publicKey);
    return payload as T;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    throw new Error('Invalid signedPayload.');
  }
}

async function savePurchaseToSupabase(
  transactionInfo: SignedTransactionInfo
): Promise<void> {
  const { transactionId, productId, purchaseDate, price } = transactionInfo;

  console.log('Saving purchase to Supabase:', {
    transaction_id: transactionId,
    product_id: productId,
    purchase_date: new Date(purchaseDate),
    price,
  });

  try {
    const { error } = await supabase.from('purchase_history').insert([
      {
        transaction_id: transactionId,
        product_id: productId,
        purchase_date: new Date(purchaseDate),
        price,
      },
    ]);

    if (error) {
      throw new Error(`Failed to insert purchase: ${error.message}`);
    }

    console.log('Purchase saved successfully.');
  } catch (err) {
    console.error('Error saving purchase:', err);
    throw err;
  }
}
