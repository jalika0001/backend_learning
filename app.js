const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const express = require("express");
const path = require("path");
const {
  ensureJsonFile,
  ensureFile,
  readFileBuffer
} = require("./src/utils/githubJsonStore");

const app = express();
const USERS_FILE_PATH = process.env.USERS_FILE_PATH || "src/db/users.json";
const ITEMS_FILE_PATH = process.env.ITEMS_FILE_PATH || "src/db/items.json";
const UPLOADS_DIR = process.env.UPLOADS_DIR || "uploads";

const mimeByExt = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    process.env.FRONTEND_URL || "https://frontend-learning-nu9m.onrender.com"
  ],
  credentials: true
}));

app.use(express.json());

app.get("/uploads/:filename", async (req, res) => {
  try {
    const filePath = `${UPLOADS_DIR}/${req.params.filename}`;
    const file = await readFileBuffer(filePath);

    if (!file) {
      return res.status(404).json({ message: "Image not found" });
    }

    const ext = path.extname(req.params.filename || "").toLowerCase();
    res.setHeader("Content-Type", mimeByExt[ext] || "application/octet-stream");
    return res.send(file.buffer);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load image" });
  }
});

app.use("/auth", require("./src/routes/authRoutes"));
app.use("/items", require("./src/routes/itemRoutes"));

// Catch-all for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "Image is too large. Max size is 10MB."
    });
  }

  if (err && err.message === "Only images allowed") {
    return res.status(400).json({
      message: "Only JPG, PNG, and WEBP images are allowed."
    });
  }

  if (err) {
    return res.status(500).json({
      message: "Upload failed"
    });
  }

  return next();
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await ensureJsonFile(USERS_FILE_PATH, [], "init: create users.json");
    await ensureJsonFile(ITEMS_FILE_PATH, [], "init: create items.json");
    await ensureFile(`${UPLOADS_DIR}/.gitkeep`, "", "init: create uploads folder");
    console.log("GitHub JSON files ready");
  } catch (error) {
    console.error("GitHub JSON init failed:", error.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
};

startServer();