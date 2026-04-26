const multer = require("multer");
const os = require("os");
const path = require("path");

const storage = multer.diskStorage({
    destination: os.tmpdir(),
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const safeName = path.basename(file.originalname).replace(/\s+/g, "_");
        cb(null, `${uniqueSuffix}-${safeName}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
        cb(null, true);
        return;
    }

    cb(new Error("Only image uploads are allowed"));
};

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter
});

module.exports = upload;
