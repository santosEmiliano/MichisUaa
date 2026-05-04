const multer = require("multer");

const createUploadMiddleware = () => {
    const storage = multer.memoryStorage();

    const fileFilter = (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype) {
            return cb(null, true);
        }
        cb(new Error("Error: El archivo debe ser una imagen válida"));
    }

    return multer({ storage, fileFilter });
};

module.exports = createUploadMiddleware;