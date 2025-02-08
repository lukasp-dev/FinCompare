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
    console.error("❌ No file was provided.");
    return res.status(400).json({ error: "Please upload a file." });
  }

  try {
    console.log("✅ File successfully received:", req.file.originalname);
    console.log("📂 File type:", req.file.mimetype);
    console.log("📏 File size:", req.file.size);

    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${crypto.randomUUID()}${fileExtension}`;

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: "public-read",
    };

    console.log("📤 Starting S3 upload:", uploadParams);
    await s3.send(new PutObjectCommand(uploadParams));
    console.log("✅ S3 upload successful");

    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    res.json({ fileUrl });
  } catch (error) {
    console.error("❌ S3 upload error:", error);
    res.status(500).json({ error: "File upload failed", details: error.message });
  }
});

export default router;
