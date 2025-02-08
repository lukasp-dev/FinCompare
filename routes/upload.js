import express from "express";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import crypto from "crypto";
import path from "path";

dotenv.config();
const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    console.error("❌ 파일이 전달되지 않았습니다.");
    return res.status(400).json({ error: "파일을 업로드하세요." });
  }

  try {
    console.log("✅ 파일이 성공적으로 받아졌습니다:", req.file.originalname);
    console.log("📂 파일 타입:", req.file.mimetype);
    console.log("📏 파일 크기:", req.file.size);

    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${crypto.randomUUID()}${fileExtension}`;

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    console.log("📤 S3 업로드 시작:", uploadParams);
    await s3.send(new PutObjectCommand(uploadParams));
    console.log("✅ S3 업로드 성공");

    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    res.json({ fileUrl });
  } catch (error) {
    console.error("❌ S3 업로드 오류:", error);
    res.status(500).json({ error: "파일 업로드 실패", details: error.message });
  }
});

export default router;
