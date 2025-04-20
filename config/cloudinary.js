const cloudinary = require('cloudinary').v2;

// Configuración más robusta con validación
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Faltan variables de Cloudinary: ${missingVars.join(', ')}`);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  api_proxy: process.env.HTTP_PROXY // Opcional, si necesitas proxy
});

// Función para extraer public_id de una URL de Cloudinary
const extractPublicId = (url) => {
  if (!url) return null;
  const matches = url.match(/\/upload\/.*\/([^\/]+)\./);
  return matches ? matches[1] : null;
};

// Función para eliminar una imagen
const deleteImage = async (url) => {
  try {
    const publicId = extractPublicId(url);
    if (!publicId) return;
    
    await cloudinary.uploader.destroy(publicId, {
      invalidate: true // Limpia la caché CDN
    });
  } catch (error) {
    console.error('Error al eliminar imagen de Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  extractPublicId,
  deleteImage
};