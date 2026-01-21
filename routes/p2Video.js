import express from "express";
import { createClient } from "@supabase/supabase-js";
import { uploadToR2 } from "../services/storage.js";
import { generateImageWithFal } from "../services/falai.js";
import { generateVideoWithFal } from "../services/falai.js"; // 動画生成用
import { buildPrompt } from "../services/prompts.js";

const router = express.Router();

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// POST /generate-video (p2専用)
router.post("/", async (req, res) => {
  try {
    const { userId, species, n1Url } = req.body;
    const modeId = "p2"; // 固定

    if (!userId || !species || !n1Url) {
      return res.status(400).json({ ok: false, error: "Missing parameters" });
    }

    // 1. 既存データチェック（初回のみ生成）
    const existing = await supabase
      .from("userModeAsset")
      .select("*")
      .eq("userId", userId)
      .eq("modeId", modeId)
      .single();

    if (existing.data) {
      return res.json({
        ok: true,
        reused: true,
        imageUrl: existing.data.assetUrl,
        videoUrl: existing.data.videoUrl
      });
    }

    // 2. 静止画プロンプト生成（final.jpg 用）
    const imagePrompt = buildPrompt("p2", species, n1Url);

    // 3. Fal.ai で静止画生成（final.jpg）
    const finalImageBuffer = await generateImageWithFal(imagePrompt);

    // 4. R2 に final.jpg 保存
    const imagePath = `videos/${userId}/p2/final.jpg`;
    const finalImageUrl = await uploadToR2(imagePath, finalImageBuffer, "image/jpeg");

    // 5. 動画プロンプト（p2専用）
    const videoPrompt = `
A very happy ${species} showing joy, wagging tail or cheerful movement.
Match the appearance of the pet from this reference: ${n1Url}.
Natural lighting, soft background, photorealistic.
    `.trim();

    // 6. Fal.ai で動画生成（mp4）
    const videoBuffer = await generateVideoWithFal(videoPrompt);

    // 7. R2 に動画保存
    const videoPath = `videos/${userId}/p2/video.mp4`;
    const videoUrl = await uploadToR2(videoPath, videoBuffer, "video/mp4");

    // 8. Supabase に保存
    await supabase.from("userModeAsset").insert({
      userId,
      modeId,
      species,
      assetUrl: finalImageUrl, // サムネイル
      videoUrl: videoUrl,
      assetType: "video",
      generatedAt: new Date().toISOString(),
      adopted: true
    });

    return res.json({
      ok: true,
      reused: false,
      imageUrl: finalImageUrl,
      videoUrl: videoUrl
    });

  } catch (err) {
    console.error("p2Video error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;