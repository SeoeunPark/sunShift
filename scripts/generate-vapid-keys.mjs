#!/usr/bin/env node
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("아래 값을 .env.local 과 Vercel Production 환경변수에 함께 넣으세요.\n");
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log("VAPID_SUBJECT=mailto:your-email@example.com");
console.log("\n키를 바꾼 뒤 Vercel Redeploy → PWA 삭제 후 재설치 → Push 다시 켜기");
