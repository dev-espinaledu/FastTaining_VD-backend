'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Notificacion extends Model {
        static associate(models) {
            this.belongsTo(models.Usuario, {
                foreignKey: 'usuario_id',
                as: 'usuario'
            });
        }

        static async crearParaUsuario(usuarioId, tipo, mensaje, metadata = {}) {
            return this.create({
                usuario_id: usuarioId,
                tipo,
                mensaje,
                metadata,
                leido: false
            });
        }

        static async marcarComoLeido(id) {
            return this.update(
                { leido: true },
                { where: { id } }
            );
        }

        static async obtenerNoLeidas(usuarioId) {
            return this.count({
                where: {
                    usuario_id: usuarioId,
                    leido: false
                }
            });
        }

        static async marcarTodasComoLeidas(usuarioId) {
            return this.update(
                { leido: true },
                {
                    where: {
                        usuario_id: usuarioId,
                        leido: false
                    }
                }
            );
        }
    }

    Notificacion.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        usuario_id: {
            type: DataTypes.SMALLINT, // ← También SMALLINT aquí
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'        
        },
        tipo: {
            type: DataTypes.ENUM(
                'plan_entrenamiento',
                'asignacion_equipo',
                'estadisticas',
                'respuesta_queja'
            ),
            allowNull: false
        },
        mensaje: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        leido: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('metadata');
                return rawValue ? rawValue : null;
            },
            set(value) {
                this.setDataValue('metadata', value);
            }
        }
    }, {
        sequelize,
        modelName: 'Notificacion',
        tableName: 'notificaciones',
        timestamps: true,
        underscored: true,
        createdAt: 'creado_en',
        updatedAt: 'actualizado_en',
        indexes: [
            { fields: ['usuario_id'] },
            { fields: ['leido'] },
            { fields: ['creado_en'] },
            { fields: ['tipo'] }
        ],
        hooks: {
            afterCreate: async (notificacion, options) => {
                // Lógica para notificaciones push
            }
        },
        scopes: {
            noLeidas: {
                where: { leido: false }
            },
            paraUsuario(usuarioId) {
                return {
                    where: { usuario_id: usuarioId }
                };
            },
            recientes: {
                order: [['creado_en', 'DESC']],
                limit: 50
            }
        }
    });

    return Notificacion;
};