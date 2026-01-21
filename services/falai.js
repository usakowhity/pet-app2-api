import fetch from "node-fetch";

const FAL_KEY = process.env.FAL_KEY;

/* -------------------------------------------------------
   1) 画像生成（n2〜p9 共通）
------------------------------------------------------- */
export async function generateImageWithFal(prompt) {
  try {
    const response = await fetch("https://api.fal.ai/v1/run/stable-diffusion-xl", {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        image_size: "1024x1024"
      })
    });

    if (!response.ok) {
      throw new Error(`Fal.ai image error: ${response.status}`);
    }

    const result = await response.json();

    const base64 = result.image_base64;
    if (!base64) {
      throw new Error("Fal.ai returned no image");
    }

    return Buffer.from(base64, "base64");

  } catch (err) {
    console.error("Fal.ai image generation error:", err);
    throw err;
  }
}

/* -------------------------------------------------------
   2) 動画生成（p2 専用）
------------------------------------------------------- */
export async function generateVideoWithFal(prompt) {
  try {
    const response = await fetch("https://api.fal.ai/v1/run/fal-ai/flux-lora", {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        duration: 4,          // 4秒動画
        resolution: "720p",   // 安定動作する解像度
        format: "mp4"
      })
    });

    if (!response.ok) {
      throw new Error(`Fal.ai video error: ${response.status}`);
    }

    const result = await response.json();

    const base64 = result.video_base64;
    if (!base64) {
      throw new Error("Fal.ai returned no video");
    }

    return Buffer.from(base64, "base64");

  } catch (err) {
    console.error("Fal.ai video generation error:", err);
    throw err;
  }
}