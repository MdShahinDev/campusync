const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, ".env") });
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const universityRoutes = require("./routes/universityRoutes");

connectDB();
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://campusyncweb.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowOrigin = (!origin || allowedOrigins.includes(origin))
    ? (origin || "*")
    : null;

  if (!allowOrigin) {
    if (req.method === "OPTIONS") {
      return res.status(403).end();
    }
    return next();
  }

  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/admin/universities", universityRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

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
