const fs = require("fs").promises;
const path = require("path");

const deleteLocalFile = async (fotoUrl) => {
  if (!fotoUrl) return;
  const fsPath = fotoUrl.replace(/^\/api\//, "/");
  const absolutePath = path.join(__dirname, "..", fsPath);
  try {
    await fs.unlink(absolutePath);
    console.log("Archivo eliminado:", fotoUrl);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("Error al eliminar archivo:", err);
    }
  }
};

module.exports = { deleteLocalFile };
