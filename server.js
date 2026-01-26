// server.js（pet-app2-api 完全版）

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

/* -------------------------------------------------------
   CORS（完全版）
   - GitHub Pages からのアクセスを許可
   - OPTIONS（プリフライト）も許可
------------------------------------------------------- */
app.use(
  cors({
    origin: "*", // 必要なら GitHub Pages の URL に限定してもOK
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// プリフライト（OPTIONS）を確実に返す
app.options("*", cors());

/* -------------------------------------------------------
   JSON パース
------------------------------------------------------- */
app.use(express.json({ limit: "10mb" }));

/* -------------------------------------------------------
   ルーティング
   /api/... に統一
------------------------------------------------------- */
const generateImage = require("./routes/generateImage");
const p2Video = require("./routes/p2Video");
const videoStatus = require("./routes/videoStatus");

app.use("/api/generate-image", generateImage);
app.use("/api/generate-video", p2Video);
app.use("/api/video-status", videoStatus);

/* -------------------------------------------------------
   動作確認用
------------------------------------------------------- */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});

/* -------------------------------------------------------
   エラー処理（必須）
------------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ ok: false, error: "Internal Server Error" });
});

/* -------------------------------------------------------
   Vercel 用エクスポート
------------------------------------------------------- */
module.exports = app;