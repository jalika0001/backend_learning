const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const express = require("express");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use((req, res) => {
  res.send("Welcome to the Item Management API");
});

app.use("/uploads", express.static("uploads"));

app.use("/auth", require("./src/routes/authRoutes"));
app.use("/items", require("./src/routes/itemRoutes"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});