// services/storage.js（R2 完全版）
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY
  }
});

const BUCKET = process.env.R2_BUCKET;

export async function uploadToR2(userId, modeId, fileUrlOrBuffer) {
  let body;

  // URL の場合は fetch してバイナリ化
  if (typeof fileUrlOrBuffer === "string") {
    const res = await fetch(fileUrlOrBuffer);
    body = Buffer.from(await res.arrayBuffer());
  } else {
    body = fileUrlOrBuffer;
  }

  const key = `videos/${userId}/${modeId}/${uuidv4()}.mp4`;

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: "video/mp4"
    })
  );

  return `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
}