const multer = require('multer');

const storage = multer.memoryStorage(); // Almacena en memoria en lugar de disco

const fileFilter = (req, file, cb) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (validTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo imágenes JPEG, PNG o WEBP'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = {
  singleUpload: upload.single('foto_perfil'),
  handleUploadErrors: (err, req, res, next) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
        code: 'UPLOAD_ERROR'
      });
    }
    next();
  }
};