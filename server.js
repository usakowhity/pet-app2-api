// server.js（pet-app2-api / ES Modules 最終安定版）

import express from "express";
import cors from "cors";

// 既存ルート
import generateImage from "./routes/generateImage.js";
import generateVideo from "./routes/generate-video.js";

// 追加ルート
import authLogin from "./routes/auth-login.js";
import saveUserModeAsset from "./routes/save-user-mode-asset.js";

const app = express();

/* -------------------------------------------------------
   CORS（Railway / GitHub Pages 両対応）
------------------------------------------------------- */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// プリフライト対策
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

/* -------------------------------------------------------
   JSON パース
------------------------------------------------------- */
app.use(express.json({ limit: "20mb" })); // 画像生成の prompt が長くてもOK

/* -------------------------------------------------------
   ルーティング
------------------------------------------------------- */

// 画像生成
app.use("/api/generate-image", generateImage);

// 動画生成
app.use("/api/generate-video", generateVideo);

// ログイン（Magic Link）
app.use("/api/auth-login", authLogin);

// n1画像アップロード & ユーザー設定保存
app.use("/api/save-user-mode-asset", saveUserModeAsset);

/* -------------------------------------------------------
   動作確認用
------------------------------------------------------- */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});

/* -------------------------------------------------------
   エラー処理（全ルート共通）
------------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ ok: false, error: "Internal Server Error" });
});

/* -------------------------------------------------------
   サーバー起動（Railway 用）
------------------------------------------------------- */
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`pet-app2-api running on port ${port}`);
});