// services/saveUserModeAsset.js
import { supabase } from "./supabase.js";

/**
 * userModeAsset テーブルに保存（upsert）
 * - 静止画: assetUrl のみ
 * - 動画: assetUrl + videoUrl
 */
export async function saveUserModeAsset({
  userId,
  modeId,
  assetUrl,
  videoUrl = null,
  assetType = "image"
}) {
  const { error } = await supabase.from("userModeAsset").upsert(
    {
      userId,
      modeId,
      assetUrl,
      videoUrl,
      assetType,
      adopted: true
    },
    {
      onConflict: "userId,modeId"
    }
  );

  if (error) {
    console.error("saveUserModeAsset error:", error);
    throw error;
  }
}