import express from "express";
import multer from "multer";

import {
  generateCaption,
  getHistory,
  deleteHistory,
} from "../controllers/captionController.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.post(
  "/generate",
  upload.single("image"),
  generateCaption
);

router.get("/history", getHistory);

router.delete(
  "/history/:id",
  deleteHistory
);

export default router;