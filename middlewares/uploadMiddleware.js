const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuración de Cloudinary (directa aquí o desde archivo config)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuración del almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile_pictures',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
        format: 'webp',  // Convertir a webp para optimización
        quality: 'auto:best'  // Calidad automática
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    const filetypes = /jpe?g|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, WEBP)'), false);
};

// Configuración de Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1 // Solo un archivo por vez
    },
    preservePath: true // Mantener la estructura de directorios
});

// Middleware para manejar errores de upload
const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Error de Multer (ej: tamaño de archivo excedido)
        return res.status(400).json({
        success: false,
        message: err.message,
        code: 'UPLOAD_ERROR'
        });
    } else if (err) {
        // Otros errores
        return res.status(400).json({
        success: false,
        message: err.message,
        code: 'FILE_VALIDATION_ERROR'
        });
    }
    next();
};

module.exports = {
  singleUpload: upload.single('foto_perfil'), // Para subida única
  arrayUpload: upload.array('photos', 5), // Ejemplo para múltiples archivos (máx 5)
  handleUploadErrors // Middleware para manejo de errores
};