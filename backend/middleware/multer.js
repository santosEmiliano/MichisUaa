const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const createUploadMiddleware = (subfolder = "general") => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, `images/${subfolder}/`);
        },
        filename: (req, file, cb) => {
            const unique = crypto.randomUUID().slice(0, 8);
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `${Date.now()}-${unique}${ext}`);
        },
    });

    const fileFilter = (req, file, cb) => {
        const validMimes = ["image/jpeg", "image/png", "image/webp"];
        if (validMimes.includes(file.mimetype)) {
            return cb(null, true);
        }
        cb(new Error("Error: El archivo debe ser una imagen válida (jpeg, png, webp)"));
    };

    return multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
};

module.exports = createUploadMiddleware;