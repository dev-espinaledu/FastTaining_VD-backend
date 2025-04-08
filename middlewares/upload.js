const multer = require("multer");
const path = require("path");

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../public/uploads/profiles"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
        );
    },
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(
        new Error(
        "Error: Solo se permiten archivos de imagen (JPEG, JPG, PNG, WEBP)"
        )
    );
};

// Configuración de Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;