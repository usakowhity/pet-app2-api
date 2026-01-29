// server.js（pet-app2-api / ES Modules 完全最新版）

import express from "express";
import cors from "cors";

// ルート
import generateImage from "./routes/generateImage.js";
import generateVideo from "./routes/generate-video.js";

const app = express();

/* -------------------------------------------------------
   CORS（完全版）
------------------------------------------------------- */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ★ Railway / Vercel のプリフライト対策
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
app.use(express.json({ limit: "10mb" }));

/* -------------------------------------------------------
   ルーティング（安定版 API）
------------------------------------------------------- */
app.use("/api/generate-image", generateImage);
app.use("/api/generate-video", generateVideo);

/* -------------------------------------------------------
   動作確認用
------------------------------------------------------- */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});

/* -------------------------------------------------------
   エラー処理
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