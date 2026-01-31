// routes/generateImage.js
import express from "express";
import { runFal } from "../services/falai.js";
import { saveUserModeAsset } from "../services/saveUserModeAsset.js";

const router = express.Router();

/* -------------------------------------------------------
   モード別プロンプト（あなたの世界観に合わせた最新版）
------------------------------------------------------- */
const prompts = {
  n2: (species) => `
    A ${species} sitting politely ("お座り").
    Calm, cute, friendly expression.
    Soft lighting, warm tone, clean background.
  `,
  n3: (species) => `
    A ${species} sleeping peacefully ("寝んね").
    Relaxed pose, soft lighting, warm and gentle mood.
  `,
  p1: (species) => `
    A playful ${species} ("遊ぶ").
    Energetic, joyful, cute motion implied.
    Bright and fun atmosphere.
  `,
  p3: (species) => `
    A ${species} lying down ("伏せ").
    Calm, obedient, friendly expression.
  `,
  p4: (species) => `
    A ${species} giving its paw ("お手").
    Cute, friendly, warm expression.
  `,
  p5: (species) => `
    A ${species} eating food ("ごはん").
    Happy, satisfied, cute expression.
  `,
  p6: (species) => `
    A ${species} drinking water ("お水").
    Calm, natural, gentle lighting.
  `,
  p7: (species) => `
    A ${species} using a toilet pad ("トイレ").
    Clean, simple, neutral tone.
  `,
  p8: (species) => `
    A ${species} fetching a toy ("持ってこい").
    Energetic, playful, joyful.
  `,
  p9: (species) => `
    A ${species} inside its house ("ハウス").
    Cozy, warm, safe feeling.
  `
};

/* -------------------------------------------------------
   POST /api/generate-image
   - n2〜p9 の静止画生成
   - flux-lora を使用
   - Supabase に保存
------------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const { userId, modeId, species, n1Url } = req.body;

    if (!userId || !modeId || !species || !n1Url) {
      return res.json({ ok: false, error: "Missing parameters" });
    }

    const prompt = prompts[modeId]?.(species);
    if (!prompt) {
      return res.json({ ok: false, error: "Invalid modeId" });
    }

    /* -------------------------------------------------------
       1) Fal.ai（flux-lora）で静止画生成
    ------------------------------------------------------- */
    const result = await runFal("fal-ai/flux-lora", {
      prompt,
      image_url: n1Url,
      strength: 0.55
    });

    // ★ Fal.ai のレスポンス構造の揺れに対応
    const imageUrl =
      result.data?.output?.[0]?.url ||
      result.data?.output?.image?.url ||
      null;

    if (!imageUrl) {
      throw new Error("Fal.ai returned no image URL");
    }

    /* -------------------------------------------------------
       2) Supabase に保存
    ------------------------------------------------------- */
    await saveUserModeAsset({
      userId,
      modeId,
      assetUrl: imageUrl,
      assetType: "image"
    });

    /* -------------------------------------------------------
       完了
    ------------------------------------------------------- */
    res.json({ ok: true, assetUrl: imageUrl });

  } catch (e) {
    console.error("generate-image error:", e);
    res.json({ ok: false, error: e.message });
  }
});

export default router;