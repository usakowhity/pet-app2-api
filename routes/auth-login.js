// routes/auth-login.js
import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Supabase クライアント
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* -------------------------------------------------------
   POST /api/auth-login
   - email と userId を受け取り、Magic Link を送信
   - Supabase にユーザーを作成（存在しなければ）
------------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const { email, userId } = req.body;

    if (!email || !userId) {
      return res.json({ ok: false, error: "email または userId が不足しています" });
    }

    // ① ユーザーが存在するか確認
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // ② 存在しなければ作成
    if (!existingUser) {
      await supabase.from("users").insert({
        user_id: userId,
        email: email,
        created_at: new Date().toISOString()
      });
    }

    // ③ Magic Link を送信
    const { error: magicError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: process.env.MAGIC_LINK_REDIRECT_URL
      }
    });

    if (magicError) {
      return res.json({ ok: false, error: magicError.message });
    }

    return res.json({ ok: true, userId });

  } catch (err) {
    console.error("auth-login error:", err);
    return res.json({ ok: false, error: "サーバーエラーが発生しました" });
  }
});

export default router;