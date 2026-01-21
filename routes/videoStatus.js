import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// GET /video-status?userId=xxx
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ ok: false, error: "Missing userId" });
    }

    // p2 の動画生成結果を確認
    const { data, error } = await supabase
      .from("userModeAsset")
      .select("*")
      .eq("userId", userId)
      .eq("modeId", "p2")
      .single();

    if (error && error.code !== "PGRST116") {
      return res.status(500).json({ ok: false, error: error.message });
    }

    // まだ生成されていない
    if (!data) {
      return res.json({
        ok: true,
        processing: true,
        videoUrl: null
      });
    }

    // 生成済み
    return res.json({
      ok: true,
      processing: false,
      videoUrl: data.videoUrl,
      imageUrl: data.assetUrl
    });

  } catch (err) {
    console.error("videoStatus error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;