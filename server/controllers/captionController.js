import "dotenv/config";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

import cloudinary from "../config/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// History file
const historyPath = path.join(
  __dirname,
  "../data/history.json"
);

// Read History
const readHistory = () => {
  try {
    if (!fs.existsSync(historyPath)) {
      fs.mkdirSync(path.dirname(historyPath), {
        recursive: true,
      });

      fs.writeFileSync(historyPath, "[]");
    }

    const data = fs.readFileSync(
      historyPath,
      "utf-8"
    );

    return JSON.parse(data || "[]");
  } catch (error) {
    console.error(" History Read Error:", error);

    return [];
  }
};

// Save History
const saveHistory = (history) => {
  try {
    fs.writeFileSync(
      historyPath,
      JSON.stringify(history, null, 2)
    );
  } catch (error) {
    console.error(" History Save Error:", error);

    throw error;
  }
};

// Generate Caption
const generateCaption = async (req, res) => {
  let uploadedFilePath = null;

  try {
    // Check image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image.",
      });
    }

    uploadedFilePath = req.file.path;

    console.log(
      " Image received:",
      req.file.originalname
    );

    // Read image
    const imageBuffer = fs.readFileSync(
      uploadedFilePath
    );

    const imageBase64 =
      imageBuffer.toString("base64");

    // Cloudinary Upload
    console.log(
      " Uploading image to Cloudinary..."
    );

    const cloudinaryResult =
      await cloudinary.uploader.upload(
        uploadedFilePath,
        {
          folder: "caption-ai",
          resource_type: "image",
        }
      );

    console.log(
      " Cloudinary Upload Successful"
    );

    // Gemini Caption
    console.log(
      " Generating AI caption with Gemini..."
    );

    const prompt = `
You are an expert social media caption writer.

Analyze the uploaded image and generate ONE short,
creative and engaging caption.

Rules:
- Keep it natural.
- Keep it between 1 and 2 sentences.
- Do not explain the image.
- Do not use quotation marks.
- Do not add headings.
- You can use 1-3 relevant emojis.
- Make it suitable for Instagram and social media.
- Return ONLY the caption.
`;

   const response =
  await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: [
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: imageBase64,
        },
      },
      {
        text: prompt,
      },
    ],
  });

    const caption =
      response.text?.trim();

    if (!caption) {
      throw new Error(
        "Gemini did not return a caption."
      );
    }

    console.log(
      " Caption generated successfully"
    );

    // History Item
    const historyItem = {
      id: Date.now().toString(),
      imageUrl:
        cloudinaryResult.secure_url,
      publicId:
        cloudinaryResult.public_id,
      caption: caption,
      fileName:
        req.file.originalname,
      createdAt:
        new Date().toISOString(),
    };

    // Save History
    const history = readHistory();

    history.unshift(historyItem);

    saveHistory(history);

    console.log(" History saved");

    // Delete temporary file
    if (
      uploadedFilePath &&
      fs.existsSync(uploadedFilePath)
    ) {
      fs.unlinkSync(uploadedFilePath);
    }

    // Response
    return res.status(200).json({
      success: true,
      message:
        "Caption generated successfully.",
      data: historyItem,
    });

  } catch (error) {
    console.error(
      " Caption Generation Error:",
      error
    );

    // Delete temporary upload
    if (
      uploadedFilePath &&
      fs.existsSync(uploadedFilePath)
    ) {
      try {
        fs.unlinkSync(
          uploadedFilePath
        );
      } catch (deleteError) {
        console.error(
          "Temporary file delete error:",
          deleteError
        );
      }
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate caption.",
      error: error.message,
    });
  }
};

// Get History
const getHistory = (req, res) => {
  try {
    const history = readHistory();

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });

  } catch (error) {
    console.error(
      " Get History Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch history.",
      error: error.message,
    });
  }
};

// Delete History
const deleteHistory = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "History ID is required.",
      });
    }

    const history = readHistory();

    const item = history.find(
      (entry) => entry.id === id
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message:
          "History item not found.",
      });
    }

    // Delete image from Cloudinary
    if (item.publicId) {
      console.log(
        " Deleting image from Cloudinary..."
      );

      await cloudinary.uploader.destroy(
        item.publicId,
        {
          resource_type: "image",
        }
      );

      console.log(
        " Cloudinary image deleted"
      );
    }

    // Remove from history
    const updatedHistory =
      history.filter(
        (entry) => entry.id !== id
      );

    saveHistory(updatedHistory);

    console.log(
      " History deleted"
    );

    return res.status(200).json({
      success: true,
      message:
        "Image and history deleted successfully.",
    });

  } catch (error) {
    console.error(
      " Delete History Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete history.",
      error: error.message,
    });
  }
};

export {
  generateCaption,
  getHistory,
  deleteHistory,
};