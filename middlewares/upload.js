const multer = require('multer');

const storage = multer.memoryStorage(); // Guardar en memoria antes de subir a Cloudflare
const upload = multer({ storage });

module.exports = upload;
