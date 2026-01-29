// services/videoComposer.js
import { exec } from "child_process";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import ffmpegPath from "ffmpeg-static";

const execAsync = promisify(exec);

/**
 * n1Url と finalUrl を 5秒ずつつないだ 10秒動画を生成
 * 出力は /tmp/composed-xxxx.mp4
 */
export async function composeVideo(n1Url, finalUrl) {
  const id = uuidv4();
  const n1Path = `/tmp/n1-${id}.jpg`;
  const finalPath = `/tmp/final-${id}.jpg`;
  const outPath = `/tmp/composed-${id}.mp4`;

  // n1 を保存
  const n1Res = await fetch(n1Url);
  fs.writeFileSync(n1Path, Buffer.from(await n1Res.arrayBuffer()));

  // final.jpg を保存
  const finalRes = await fetch(finalUrl);
  fs.writeFileSync(finalPath, Buffer.from(await finalRes.arrayBuffer()));

  // ffmpeg で 5秒 + 5秒 = 10秒動画を作成
  const cmd = `
    ${ffmpegPath} -y \
      -loop 1 -t 5 -i ${n1Path} \
      -loop 1 -t 5 -i ${finalPath} \
      -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0" \
      -pix_fmt yuv420p \
      ${outPath}
  `;

  await execAsync(cmd);

  return outPath;
}