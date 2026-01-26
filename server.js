// server.js（pet-app2-api 完全版）

const express = require("express");
const cors = require("cors");
const path = require("path");

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

// ★ ここを追加（Vercel のプリフライト対策）
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
   ルーティング
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
   エラー処理
------------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ ok: false, error: "Internal Server Error" });
});

/* -------------------------------------------------------
   Vercel 用エクスポート
------------------------------------------------------- */
module.exports = app;