const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const express = require("express");

const app = express();

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

app.use("/uploads", express.static("uploads"));

app.use("/auth", require("./src/routes/authRoutes"));
app.use("/items", require("./src/routes/itemRoutes"));

// Catch-all for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});