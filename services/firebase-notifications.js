const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

// Inicializa Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const sendPushNotification = async (token, notificationData) => {
  try {
    // Mapear tipos a íconos
    const iconMap = {
      'plan_entrenamiento': '🏋️',
      'asignacion_equipo': '👥',
      'estadisticas': '📊',
      'respuesta_queja': '💬'
    };

    const message = {
      token: token,
      notification: {
        title: notificationData.title,
        body: notificationData.body
      },
      data: {
        type: notificationData.type,
        id: notificationData.id.toString(),
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        icon: iconMap[notificationData.type] || '🔔',
        ...notificationData.metadata
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      },
      android: {
        notification: {
          sound: 'default',
          channel_id: 'default_channel',
          icon: 'ic_notification',
          color: '#FF5722'
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Notificación enviada con éxito:', response);
    return response;
  } catch (error) {
    console.error('Error enviando notificación:', error);
    
    // Manejo específico de errores comunes
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      // Eliminar token inválido de la base de datos
      await Usuario.update({ fcm_token: null }, { where: { fcm_token: token } });
    }
    
    throw error;
  }
};

// Función para enviar notificaciones a múltiples dispositivos
const sendMulticastNotification = async (tokens, notificationData) => {
  try {
    const message = {
      tokens: tokens.filter(t => t), // Filtra tokens nulos/undefined
      notification: {
        title: notificationData.title,
        body: notificationData.body
      },
      data: {
        type: notificationData.type,
        id: notificationData.id.toString(),
        ...notificationData.metadata
      }
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log('Notificación multicast enviada:', response);
    
    // Manejar tokens inválidos
    if (response.failureCount > 0) {
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          invalidTokens.push(tokens[idx]);
        }
      });
      
      // Eliminar tokens inválidos de la base de datos
      await Usuario.update(
        { fcm_token: null },
        { where: { fcm_token: { [Op.in]: invalidTokens } } }
      );
    }
    
    return response;
  } catch (error) {
    console.error('Error enviando notificación multicast:', error);
    throw error;
  }
};

module.exports = {
  sendPushNotification,
  sendMulticastNotification
};