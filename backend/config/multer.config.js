const multer = require("multer");
const path = require("path");

// Configure multer for memory storage (no disk storage)
const storage = multer.memoryStorage();

// File filter to only accept Excel files
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".xlsx", ".xls", ".csv"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Only Excel files (.xlsx, .xls, .csv) are allowed.`
      ),
      false
    );
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = upload;

