'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('estadisticas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      altura: {
        type: Sequelize.STRING
      },
      peso: {
        type: Sequelize.STRING
      },
      grasaCorporal: {
        type: Sequelize.STRING
      },
      masaMuscular: {
        type: Sequelize.STRING
      },
      fuerza: {
        type: Sequelize.STRING
      },
      velocidadMaxima: {
        type: Sequelize.STRING
      },
      resistenciaAerobica: {
        type: Sequelize.STRING
      },
      resistenciaAnaerobica: {
        type: Sequelize.STRING
      },
      flexibilidad: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('estadisticas');
  }
};