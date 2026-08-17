const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { env } = require("../config/env");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = env.UPLOAD_DIR;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (
    file.mimetype === "text/csv" ||
    file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    ext === ".csv" ||
    ext === ".xlsx"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV and XLSX files are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE },
  fileFilter,
});

module.exports = { upload };
