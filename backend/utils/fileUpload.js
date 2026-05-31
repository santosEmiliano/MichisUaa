const fs = require("fs").promises;
const path = require("path");

const deleteLocalFile = async (relativePath) => {
  if (!relativePath) return;
  const absolutePath = path.join(__dirname, "..", relativePath);
  try {
    await fs.unlink(absolutePath);
    console.log("Archivo eliminado:", relativePath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("Error al eliminar archivo:", err);
    }
  }
};

module.exports = { deleteLocalFile };
