import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import captionRoutes from "./routes/captionRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "https://ai-caption-generator-umber.vercel.app",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Caption Generator API is running 🚀",
  });
});

app.use("/api/caption", captionRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});