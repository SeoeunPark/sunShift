import crypto from "crypto";
import { getVapidPublicKey, getVapidSubject, isPushConfigured } from "@/lib/push/config";

function padBuffer(buffer: Buffer, targetLength: number): Buffer {
  if (buffer.length >= targetLength) {
    return buffer;
  }

  return Buffer.concat([Buffer.alloc(targetLength - buffer.length), buffer]);
}

export function verifyVapidKeyPair(): boolean {
  const publicKey = getVapidPublicKey();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();

  if (!publicKey || !privateKey) {
    return false;
  }

  try {
    const expectedPublic = Buffer.from(publicKey, "base64url");
    const privateBuffer = Buffer.from(privateKey, "base64url");

    if (expectedPublic.length !== 65 || privateBuffer.length !== 32) {
      return false;
    }

    const ecdh = crypto.createECDH("prime256v1");
    ecdh.setPrivateKey(privateBuffer);
    const derivedPublic = padBuffer(ecdh.getPublicKey(), 65);

    return derivedPublic.equals(expectedPublic);
  } catch {
    return false;
  }
}

export function getVapidDiagnostics() {
  const publicKey = getVapidPublicKey();
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = getVapidSubject();

  return {
    configured: isPushConfigured(),
    keyPairValid: verifyVapidKeyPair(),
    hasPublicKey: Boolean(publicKey),
    hasPrivateKey: Boolean(privateKey),
    hasSubject: Boolean(subject),
    publicKeyPrefix: publicKey?.slice(0, 12) ?? null,
    subject,
  };
}
