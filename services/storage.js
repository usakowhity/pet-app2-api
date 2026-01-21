import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const R2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_API_TOKEN,
    secretAccessKey: process.env.CLOUDFLARE_API_TOKEN
  }
});

// R2 にアップロードして公開 URL を返す
export async function uploadToR2(filePath, buffer, contentType) {
  try {
    const bucket = process.env.R2_BUCKET;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: filePath,
      Body: buffer,
      ContentType: contentType
    });

    await R2.send(command);

    // 公開 URL を返す
    const publicUrl = `${process.env.R2_ENDPOINT}/${bucket}/${filePath}`;
    return publicUrl;

  } catch (err) {
    console.error("R2 upload error:", err);
    throw err;
  }
}