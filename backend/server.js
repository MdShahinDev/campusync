const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, ".env") });
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const resourceRoutes = require("./routes/resourceRoutes");

connectDB();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
