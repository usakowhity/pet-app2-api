import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import generateImageRoute from "./routes/generateImage.js";
import p2VideoRoute from "./routes/p2Video.js";
import videoStatusRoute from "./routes/videoStatus.js";

dotenv.config();

const app = express();

// ★ CORS を GitHub Pages 専用に許可
app.use(
  cors({
    origin: "https://usakowhity.github.io",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ★ OPTIONS（プリフライト）を必ず許可
app.options("*", cors());

app.use(express.json({ limit: "20mb" }));

// 動作確認用
app.get("/", (req, res) => {
  res.json({ ok: true, message: "pet-app2 API is running" });
});

// ルート登録
app.use("/generate-image", generateImageRoute);
app.use("/generate-video", p2VideoRoute);
app.use("/video-status", videoStatusRoute);

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});