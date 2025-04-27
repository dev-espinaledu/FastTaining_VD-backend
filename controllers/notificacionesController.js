const { Notificacion, Usuario } = require('../models');
const { sendPushNotification } = require('../services/firebase-notifications');

// Mapeo de tipos a íconos (consistente con frontend)
const NOTIFICATION_ICONS = {
  'plan_entrenamiento': '🏋️',
  'asignacion_equipo': '👥',
  'estadisticas': '📊',
  'respuesta_queja': '💬'
};

const obtenerNotificaciones = async (req, res) => {
  try {
    // Validación de autenticación
    if (!req.user?.id) {
      return res.status(401).json({ 
        success: false,
        message: "Autenticación requerida",
        code: "UNAUTHORIZED"
      });
    }

    // Parámetros de paginación
    const { limit = 20, offset = 0, leido } = req.query;
    const parsedLimit = Math.min(parseInt(limit), 50);
    const parsedOffset = Math.max(parseInt(offset), 0);

    // Construir query
    const where = { usuario_id: req.user.id };
    if (leido !== undefined) {
      where.leido = leido === 'true';
    }

    const notificaciones = await Notificacion.findAll({
      where,
      order: [['creado_en', 'DESC']],
      limit: parsedLimit,
      offset: parsedOffset,
      attributes: ['id', 'tipo', 'mensaje', 'leido', 'creado_en', 'metadata']
    });

    res.json({
      success: true,
      data: notificaciones.map(notif => ({
        ...notif.get({ plain: true }),
        icon: NOTIFICATION_ICONS[notif.tipo] || '🔔'
      })),
      meta: {
        total: await Notificacion.count({ where }),
        limit: parsedLimit,
        offset: parsedOffset
      }
    });

  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener notificaciones",
      code: "SERVER_ERROR"
    });
  }
};

const marcarComoLeida = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar propiedad de la notificación
    const notificacion = await Notificacion.findOne({
      where: { 
        id,
        usuario_id: req.user.id 
      }
    });
    
    if (!notificacion) {
      return res.status(404).json({ 
        success: false,
        message: "Notificación no encontrada",
        code: "NOT_FOUND"
      });
    }

    await notificacion.update({ leido: true });
    
    res.json({ 
      success: true,
      message: 'Notificación marcada como leída',
      data: {
        ...notificacion.get({ plain: true }),
        icon: NOTIFICATION_ICONS[notificacion.tipo] || '🔔'
      }
    });
  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar notificación",
      code: "UPDATE_ERROR"
    });
  }
};

const marcarTodasComoLeidas = async (req, res) => {
  try {
    const updated = await Notificacion.update(
      { leido: true },
      { 
        where: { 
          usuario_id: req.user.id,
          leido: false 
        },
        returning: true // Para obtener las notificaciones actualizadas
      }
    );

    res.json({ 
      success: true,
      message: `${updated[0]} notificaciones marcadas como leídas`,
      data: {
        count: updated[0]
      }
    });
  } catch (error) {
    console.error('Error marcando notificaciones como leídas:', error);
    res.status(500).json({ 
      success: false,
      message: "Error al marcar notificaciones como leídas",
      code: "BULK_UPDATE_ERROR"
    });
  }
};

const registrarToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false,
        message: "Token FCM requerido",
        code: "TOKEN_REQUIRED"
      });
    }

    // Validar formato del token?
    
    await Usuario.update(
      { fcm_token: token },
      { where: { id: req.user.id } }
    );
    
    res.json({ 
      success: true,
      message: "Token registrado con éxito",
      data: {
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error registrando token:', error);
    res.status(500).json({ 
      success: false,
      message: "Error al registrar token",
      code: "TOKEN_REGISTRATION_ERROR"
    });
  }
};

const enviarNotificacion = async (usuarioId, tipo, mensaje, metadata = {}) => {
  try {
    // Validar tipo de notificación
    const tiposValidos = Object.keys(NOTIFICATION_ICONS);
    if (!tiposValidos.includes(tipo)) {
      throw new Error(`Tipo de notificación no válido: ${tipo}`);
    }

    const notificacion = await Notificacion.create({
      usuario_id: usuarioId,
      tipo,
      mensaje,
      metadata: typeof metadata === 'object' ? metadata : {},
      leido: false
    });

    const usuario = await Usuario.findByPk(usuarioId, {
      attributes: ['fcm_token']
    });

    if (usuario?.fcm_token) {
      await sendPushNotification(usuario.fcm_token, {
        title: getTituloNotificacion(tipo),
        body: mensaje,
        data: {
          type: tipo,
          id: notificacion.id.toString(),
          ...metadata
        },
        icon: NOTIFICATION_ICONS[tipo] || '🔔'
      });
    }

    return {
      ...notificacion.get({ plain: true }),
      icon: NOTIFICATION_ICONS[tipo] || '🔔'
    };
  } catch (error) {
    console.error('Error enviando notificación:', {
      error: error.message,
      userId: usuarioId,
      tipo,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

const getTituloNotificacion = (tipo) => {
  const titulos = {
    'plan_entrenamiento': 'Nuevo Plan de Entrenamiento',
    'asignacion_equipo': 'Asignación de Equipo',
    'estadisticas': 'Estadísticas Disponibles',
    'respuesta_queja': 'Respuesta a tu Solicitud'
  };
  return titulos[tipo] || 'Nueva Notificación';
};

module.exports = {
  obtenerNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  registrarToken,
  enviarNotificacion,
  NOTIFICATION_ICONS
};