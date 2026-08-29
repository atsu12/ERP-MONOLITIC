const multer = require("multer");
const path = require("path");
const fs = require("fs");

const logger = require("../utils/logger");
const uploadRoot = path.join(__dirname, "..", "uploads");
const logoDir = path.join(uploadRoot, "logos");
const templateDir = path.join(uploadRoot, "templates");

// Create upload folders automatically
fs.mkdirSync(logoDir, { recursive: true });
fs.mkdirSync(templateDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const type = req.params.type;

    if (type === "logo") {
      return cb(null, logoDir);
    }

    cb(null, templateDir);
  },

  filename(req, file, cb) {
    const extension = path.extname(file.originalname);

    const filename =
      Date.now() + "-" + file.originalname.replace(extension, "") + extension;

    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const type = req.params.type;

  const extension = path.extname(file.originalname).toLowerCase();

  logger.info(`Uploaded file: ${file.originalname}`);
  logger.info(`Extension: ${extension}`);
  logger.info(`Upload type: ${type}`);
  if (type === "logo") {
    const allowed = [".png", ".jpg", ".jpeg", ".svg", ".webp"];

    if (!allowed.includes(extension)) {
      return cb(new Error(`Unsupported logo format: ${extension}`));
    }

    return cb(null, true);
  }

  const allowed = [".xlsx", ".xlsm"];

  if (!allowed.includes(extension)) {
    return cb(new Error(`Unsupported template format: ${extension}`));
  }

  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
});
