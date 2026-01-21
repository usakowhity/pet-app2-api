import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import generateImageRoute from "./routes/generateImage.js";
import p2VideoRoute from "./routes/p2Video.js";
import videoStatusRoute from "./routes/videoStatus.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" })); // 画像/動画POSTに備えて拡張

// 動作確認用
app.get("/", (req, res) => {
  res.json({ ok: true, message: "pet-app2 API is running" });
});

// ------------------------------
// ルート登録（ここが重要）
// ------------------------------
app.use("/generate-image", generateImageRoute);
app.use("/generate-video", p2VideoRoute);
app.use("/video-status", videoStatusRoute);

// ------------------------------
// サーバー起動
// ------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});