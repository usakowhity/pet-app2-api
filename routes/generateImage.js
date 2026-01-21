import express from "express";
import { createClient } from "@supabase/supabase-js";
import { uploadToR2 } from "../services/storage.js";
import { buildPrompt } from "../services/prompts.js";
import { generateImageWithFal } from "../services/falai.js";

const router = express.Router();

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// POST /generate-image
router.post("/", async (req, res) => {
  try {
    const { userId, modeId, species, n1Url } = req.body;

    if (!userId || !modeId || !species || !n1Url) {
      return res.status(400).json({ ok: false, error: "Missing parameters" });
    }

    // 1. 既存データがあるか確認（初回のみ生成）
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
        assetUrl: existing.data.assetUrl
      });
    }

    // 2. プロンプト生成
    const prompt = buildPrompt(modeId, species, n1Url);

    // 3. Fal.ai で画像生成
    const imageBuffer = await generateImageWithFal(prompt);

    // 4. R2 に保存
    const filePath = `images/${userId}/${modeId}.jpg`;
    const publicUrl = await uploadToR2(filePath, imageBuffer, "image/jpeg");

    // 5. Supabase に保存
    await supabase.from("userModeAsset").insert({
      userId,
      modeId,
      assetUrl: publicUrl,
      assetType: "image",
      species,
      generatedAt: new Date().toISOString(),
      adopted: true
    });

    return res.json({
      ok: true,
      reused: false,
      assetUrl: publicUrl
    });
  } catch (err) {
    console.error("generateImage error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;