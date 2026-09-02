const multer = require("multer");
const path = require("path");
const fs = require("fs");

const os = require("os");

// Use the system temporary directory.
// On Vercel this will normally be /tmp.
const tempDir = path.join(os.tmpdir(), "campusync-csv");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}`;

    cb(
      null,
      `csv-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext === ".csv") {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed"), false);
  }
};

const csvUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = csvUpload;