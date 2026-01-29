// services/falai.js
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY
});

// Fal.ai モデルを実行する共通関数
export async function runFal(model, params) {
  return await fal.run(model, params);
}

// Fal.ai ジョブのステータス確認（必要なら）
export async function getFalStatus(requestId) {
  return await fal.status(requestId);
}