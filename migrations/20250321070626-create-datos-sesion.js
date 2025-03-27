'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('datos_sesion', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.SMALLINT
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false
      },
      objetivo: {
        type: Sequelize.STRING,
        allowNull: false

      },
      jugador_id: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        references: {
          model: "jugadores",
          key: "id",
        },
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
    await queryInterface.dropTable('datos_sesion');
  }
};