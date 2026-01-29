// routes/save-user-mode-asset.js
import express from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Supabase クライアント
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* -------------------------------------------------------
   POST /api/save-user-mode-asset
   - userId, species, customName, customKeywords
   - n1画像（file）
------------------------------------------------------- */
router.post("/", upload.single("n1"), async (req, res) => {
  try {
    const { userId, species, customName, customKeywords } = req.body;
    const file = req.file;

    if (!userId || !species || !file) {
      return res.json({ ok: false, error: "必要なデータが不足しています" });
    }

    // ① ファイル名生成
    const ext = file.originalname.split(".").pop();
    const fileName = `n1_${userId}.${ext}`;
    const filePath = `n1/${fileName}`;

    // ② Supabase Storage にアップロード
    const { error: uploadError } = await supabase.storage
      .from("pet-images")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error(uploadError);
      return res.json({ ok: false, error: "画像アップロードに失敗しました" });
    }

    // ③ 公開URL取得
    const { data: urlData } = supabase.storage
      .from("pet-images")
      .getPublicUrl(filePath);

    const n1Url = urlData.publicUrl;

    // ④ DB に保存（ユーザー情報更新）
    await supabase
      .from("users")
      .update({
        species,
        custom_name: customName || null,
        custom_keywords: customKeywords || null,
        n1_url: n1Url,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    return res.json({ ok: true, n1Url });

  } catch (err) {
    console.error("save-user-mode-asset error:", err);
    return res.json({ ok: false, error: "サーバーエラーが発生しました" });
  }
});

export default router;