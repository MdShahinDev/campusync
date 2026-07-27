
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
// console.log("Current Directory:", process.cwd());
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const result = dotenv.config();

console.log(result);
console.log(process.env.MONGODB_URI);
console.log(process.env.MONGODB_URI);
connectDB();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
