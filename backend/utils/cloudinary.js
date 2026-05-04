const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_KEY, 
  api_secret: process.env.CLOUD_SECRET 
});

const uploadToCloudinary = (fileBuffer, folderName) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: folderName },
            (error, result) => {
                if (error) reject(error);
                else resolve(result); // result.secure_url es la URL para tu BD
            }
        );
        uploadStream.end(fileBuffer);
    });
};

const deleteImage = async (publicId) => {
    if (!publicId) return;
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Imagen eliminada de Cloudinary:", result);
    } catch (err) {
        console.error('Error al borrar imagen en Cloudinary:', err);
    }
};

module.exports = { uploadToCloudinary, deleteImage };