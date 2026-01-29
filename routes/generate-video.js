// routes/generate-video.js
import express from "express";
import { runFal } from "../services/falai.js";
import { composeVideo } from "../services/videoComposer.js";
import { uploadToR2 } from "../services/storage.js";
import { saveUserModeAsset } from "../services/saveUserModeAsset.js";

const router = express.Router();

/* -------------------------------------------------------
   種族別の喜び動画プロンプト（あなたの仕様を完全反映）
------------------------------------------------------- */
function buildP2Prompt(species) {
  if (species === "dog") {
    return `
      A joyful dog interacting with its owner.
      Start from a sitting posture, making eye contact with the owner.
      The dog’s expression gradually becomes very happy,
      tail wagging vigorously with its whole body.
      Then the dog runs toward the owner with excitement,
      as if about to jump up with joy.
      Warm lighting, friendly atmosphere, natural motion.
      Keep appearance consistent with the input image.
    `;
  }

  if (species === "cat") {
    return `
      A joyful cat interacting with its owner.
      The cat tilts its head happily, showing affection.
      Then it gently rubs its head against the owner,
      expressing love and comfort.
      Soft lighting, warm and cozy mood.
      Keep appearance consistent with the input image.
    `;
  }

  if (species === "rabbit") {
    return `
      A joyful rabbit interacting with its owner.
      The rabbit hops toward the owner with excitement,
      performing a happy “binky” jump.
      Energetic, cute, lively motion.
      Keep appearance consistent with the input image.
    `;
  }

  return `
    A joyful pet interacting with its owner.
    Express happiness, affection, and lively motion.
    Keep appearance consistent with the input image.
  `;
}

/* -------------------------------------------------------
   POST /api/generate-video
   - p2（喜び動画）生成
   - final.jpg → 合成動画 → Pika video-to-video → R2保存
------------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const { userId, species, n1Url } = req.body;

    if (!userId || !species || !n1Url) {
      return res.json({ ok: false, error: "Missing parameters" });
    }

    /* -------------------------------------------------------
       1) final.jpg（喜び顔）生成
    ------------------------------------------------------- */
    const finalImage = await runFal("fal-ai/flux-lora", {
      prompt: `
        A very happy ${species}.
        Bright joyful expression, eyes shining,
        mouth slightly open as if smiling.
        Soft lighting, warm tone.
      `,
      image_url: n1Url,
      strength: 0.6
    });

    const finalUrl = finalImage.data.output[0].url;

    /* -------------------------------------------------------
       2) n1 + final.jpg を合成して 10秒動画にする
    ------------------------------------------------------- */
    const composedVideoPath = await composeVideo(n1Url, finalUrl);

    /* -------------------------------------------------------
       3) Pika video-to-video（species別プロンプト）
    ------------------------------------------------------- */
    const prompt = buildP2Prompt(species);

    const pika = await runFal("fal-ai/pika-video", {
      prompt,
      video_url: composedVideoPath
    });

    // ★ ここを安全に修正
    const videoUrl =
      pika.data?.output?.video?.url ||
      pika.data?.output?.[0]?.url ||
      null;

    if (!videoUrl) {
      throw new Error("Pika returned no video URL");
    }

    /* -------------------------------------------------------
       4) R2 に保存
    ------------------------------------------------------- */
    const savedUrl = await uploadToR2(userId, "p2", videoUrl);

    /* -------------------------------------------------------
       5) Supabase に保存
    ------------------------------------------------------- */
    await saveUserModeAsset({
      userId,
      modeId: "p2",
      assetUrl: finalUrl,
      videoUrl: savedUrl,
      assetType: "video"
    });

    /* -------------------------------------------------------
       完了
    ------------------------------------------------------- */
    res.json({ ok: true, videoUrl: savedUrl });

  } catch (e) {
    console.error("generate-video error:", e);
    res.json({ ok: false, error: e.message });
  }
});

export default router;