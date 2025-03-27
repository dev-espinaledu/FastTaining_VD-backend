'use strict';

const { defaultValueSchemable } = require('sequelize/lib/utils');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('entrenamientos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.SMALLINT
      },
      jugador_id: {
        allowNull:false,
        type: Sequelize.SMALLINT,
        references: {
          model: "jugadores",
          key: "id",
        },
      },
      fase_inicial: {
        type: Sequelize.JSONB
      },
      fase_central: {
        type: Sequelize.JSONB
      },
      fase_final: {
        type: Sequelize.JSONB
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('entrenamientos');
  }
};
