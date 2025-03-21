'use strict';
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
      id_jugador:{
        type: Sequelize.SMALLINT,
        allowNull: false,
        references: {
          model: "jugadores",
          key: "id",
        },
      },
      fase_inicial: {
        type: Sequelize.STRING
      },
      fase_central: {
        type: Sequelize.STRING
      },
      fase_final: {
        type: Sequelize.SMALLINT
      },
      id_datos_sesion:{
        type: Sequelize.SMALLINT,
        allowNull: false,
        references: {
          model: "datos_sesion",
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
    await queryInterface.dropTable('entrenamientos');
  }
};