const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS FIRST
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// middleware
app.use(express.json());

// routes
app.use("/auth", require("./src/routes/authRoutes"));
app.use("/items", require("./src/routes/itemRoutes"));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});