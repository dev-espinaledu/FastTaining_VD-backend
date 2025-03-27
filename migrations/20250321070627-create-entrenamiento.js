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
      datos_sesion_id:{
        type: Sequelize.SMALLINT,
        allowNull: false,
        references: {
          model: "datos_sesion",
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