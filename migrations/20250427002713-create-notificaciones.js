'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notificaciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      usuario_id: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tipo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mensaje: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      leido: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Agrega índices para mejor performance
    await queryInterface.addIndex('notificaciones', ['usuario_id']);
    await queryInterface.addIndex('notificaciones', ['leido']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notificaciones');
  }
};